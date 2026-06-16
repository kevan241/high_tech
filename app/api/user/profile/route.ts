import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return Response.json({ error: "Non autorisé" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return Response.json({
    avatar: user?.avatar || null,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    country: user?.country || "",
    postalCode: user?.postalCode || ""
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Non autorisé" }, { status: 401 })

  const { name, email, phone, address, city, country, postalCode } = await request.json()

  if (email && email !== session.user.email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return Response.json({ error: "Email déjà utilisé" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, email, phone, address, city, country, postalCode }
  })

  return Response.json({ ok: true })
}