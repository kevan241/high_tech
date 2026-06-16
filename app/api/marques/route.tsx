import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const marques = await prisma.marque.findMany({
        include: { _count: { select: { products: true } } }
    })
    return Response.json(marques)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { name } = await request.json()
    if (!name) return Response.json({ error: "Nom requis" }, { status: 400 })
    const marque = await prisma.marque.create({ data: { name } })
    return Response.json(marque)
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id, name } = await request.json()
    const marque = await prisma.marque.update({ where: { id }, data: { name } })
    return Response.json(marque)
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await request.json()
    const marque = await prisma.marque.delete({ where: { id } })
    return Response.json(marque)
}