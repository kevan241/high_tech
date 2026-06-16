import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json([])

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return Response.json([])

    const items = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true }
    })

    return Response.json(items.map(i => ({
        id: i.product.id,
        name: i.product.name,
        imageUrl: i.product.imageUrl,
        price: i.product.price,
        pricePromo: i.product.pricePromo,
        promoActive: i.product.promoActive,
        quantity: i.quantity,
        maxQty: i.product.quantity
    })))
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Non autorisé" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return Response.json({ error: "Introuvable" }, { status: 404 })

    const { productId, quantity } = await request.json()

    const item = await prisma.cartItem.upsert({
        where: { userId_productId: { userId: user.id, productId } },
        update: { quantity },
        create: { userId: user.id, productId, quantity }
    })

    return Response.json(item)
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Non autorisé" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return Response.json({ error: "Introuvable" }, { status: 404 })

    const { productId } = await request.json()

    if (productId) {
        await prisma.cartItem.delete({
            where: { userId_productId: { userId: user.id, productId } }
        })
    } else {
        await prisma.cartItem.deleteMany({ where: { userId: user.id } })
    }

    return Response.json({ ok: true })
}