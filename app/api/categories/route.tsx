import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const categories = await prisma.categorie.findMany({
        include: { _count: { select: { productCategories: true } } }
    })
    return Response.json(categories)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    if (!body.name) {
        return Response.json({ error: "Nom requis" }, { status: 400 })
    }
const categorie = await prisma.categorie.create({
    data: { name: body.name || 'CATEGORIE' }
})
    return Response.json(categorie)
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await request.json()
    const categorie = await prisma.categorie.delete({
        where: { id: body.id }
    })
    return Response.json(categorie)
}


export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id, name } = await request.json()
    const categorie = await prisma.categorie.update({
        where: { id },
        data: { name }
    })
    return Response.json(categorie)
}