import { prisma } from "../../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        include: { product: { include: { marque: true, categorie: true } } },
        orderBy: { createdAt: 'desc' }
    })

    return Response.json(orders)
}