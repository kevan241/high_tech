import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const orders = await prisma.order.findMany({
        include: {
            user: true,
            product: true
        }
    })
    return Response.json(orders)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    const body = await request.json()

    const orders = await Promise.all(
        body.items.map((item: any) =>
            prisma.order.create({
                data: {
                    userId: user.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                    status: 'EN_ATTENTE'
                }
            })
        )
    )

    return Response.json(orders)
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const order = await prisma.order.update({
        where: { id: body.id },
        data: {
            userId: body.userId,
            productId: body.productId,
            quantity: body.quantity,
            total: body.total,
            status: body.status,
        }
    })
    return Response.json(order)
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const order = await prisma.order.delete({
        where: { id: body.id }
    })
    return Response.json(order)
}