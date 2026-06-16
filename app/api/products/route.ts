import { prisma } from "../../../lib/prisma"
import * as z from "zod"
import { Resend } from 'resend'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const ProductSchema = z.object({
  name: z.string().min(4).max(100),
  description: z.string().max(1000).optional(),
  fiche_technique: z.string().max(5000).optional(),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
  pricePromo: z.number().positive().optional().nullable(),
  promoActive: z.boolean().optional()
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      marque: true,
      categories: {
        include: { categorie: true }
      }
    }
  })
  // Normalise pour compatibilité avec le code existant
  const normalized = products.map(p => ({
    ...p,
    categorie: p.categories.find(c => c.visible)?.categorie || null,
    categorieId: p.categories.find(c => c.visible)?.categorieId || null,
  }))
  return Response.json(normalized)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const parsedBody = ProductSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json({ error: parsedBody.error }, { status: 400 })
  }
  const product = await prisma.product.create({
    data: {
      name: parsedBody.data.name,
      description: parsedBody.data.description || "",
      fiche_technique: parsedBody.data.fiche_technique || "",
      price: parsedBody.data.price,
      quantity: parsedBody.data.quantity,
      imageUrl: body.imageUrl || "",
      pricePromo: parsedBody.data.pricePromo || null,
      promoActive: parsedBody.data.promoActive || false,
      ...(body.categorieId ? {
        categories: {
          create: [{ categorieId: body.categorieId, visible: true }]
        }
      } : {})
    }
  })
  return Response.json(product)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const parsedBody = ProductSchema.safeParse(body)
  if (!parsedBody.success) {
    return Response.json({ error: parsedBody.error }, { status: 400 })
  }
  const config = await prisma.stockAlertConfig.findFirst()

  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: parsedBody.data.name,
      description: parsedBody.data.description || "",
      fiche_technique: parsedBody.data.fiche_technique || "",
      price: parsedBody.data.price,
      quantity: parsedBody.data.quantity,
      imageUrl: body.imageUrl || "",
      marqueId: body.marqueId || null,
      pricePromo: parsedBody.data.pricePromo ?? null,
      promoActive: parsedBody.data.promoActive || false
    }
  })

  // Gestion catégories multiples
  if (body.categories && Array.isArray(body.categories)) {
    // Supprime toutes les catégories existantes et recrée
    await prisma.productCategorie.deleteMany({ where: { productId: body.id } })
    await prisma.productCategorie.createMany({
      data: body.categories.map((c: { categorieId: string, visible: boolean }) => ({
        productId: body.id,
        categorieId: c.categorieId,
        visible: c.visible
      }))
    })
  } else if (body.categorieId !== undefined) {
    // Compatibilité ancienne API — une seule catégorie
    await prisma.productCategorie.deleteMany({ where: { productId: body.id } })
    if (body.categorieId) {
      await prisma.productCategorie.create({
        data: { productId: body.id, categorieId: body.categorieId, visible: true }
      })
    }
  }

  if (config && product.quantity <= config.threshold && config.email) {
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: config.email,
      subject: `⚠️ Alerte stock — ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background-color: #0F3D1F; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 18px;">⚠️ Alerte Stock Faible</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">High Tech 241</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; max-height: 200px; object-fit: contain; background: #fff; border-radius: 8px; margin-bottom: 20px;" />` : ''}
            <h2 style="color: #0F3D1F; margin: 0 0 16px;">${product.name}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #fff;">
                <td style="padding: 12px 16px; font-size: 14px; color: #666;">Stock actuel</td>
                <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #cc0000; text-align: right;">${product.quantity} unité(s)</td>
              </tr>
              <tr style="background: #f0f0f0;">
                <td style="padding: 12px 16px; font-size: 14px; color: #666;">Seuil d'alerte</td>
                <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0F3D1F; text-align: right;">${config.threshold} unité(s)</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 12px 16px; font-size: 14px; color: #666;">Prix</td>
                <td style="padding: 12px 16px; font-size: 14px; font-weight: bold; color: #0F3D1F; text-align: right;">${product.price.toLocaleString()} Fcfa</td>
              </tr>
            </table>
          </div>
          <div style="background: #0F3D1F; padding: 16px; text-align: center;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">High Tech 241 — Système d'alerte automatique</p>
          </div>
        </div>
      `
    })
  }

  return Response.json(product)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await request.json()
  const product = await prisma.product.delete({
    where: { id: body.id }
  })
  return Response.json(product)
}