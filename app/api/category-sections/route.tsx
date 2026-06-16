import { prisma } from "../../../lib/prisma"

export async function GET() {
    const sections = await prisma.categorySection.findMany({
        orderBy: { ordre: 'asc' },
        include: { categorie: true }
    })
    return Response.json(sections)
}

export async function POST(request: Request) {
    const { categorieId } = await request.json()
    const count = await prisma.categorySection.count()
    const section = await prisma.categorySection.create({
        data: { categorieId, ordre: count + 1, limit: 4 },
        include: { categorie: true }
    })
    return Response.json(section)
}

export async function PUT(request: Request) {
    const { id, limit } = await request.json()
    const section = await prisma.categorySection.update({
        where: { id },
        data: { limit },
        include: { categorie: true }
    })
    return Response.json(section)
}

export async function DELETE(request: Request) {
    const { id } = await request.json()
    await prisma.categorySection.delete({ where: { id } })
    return Response.json({ success: true })
}