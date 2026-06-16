import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const pages = await prisma.storePage.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(pages)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const page = await prisma.storePage.create({
        data: {
            title: body.title || 'Nouvelle page',
            slug: body.slug || `page-${Date.now()}`,
            filters: body.filters || {}
        }
    })
    return Response.json(page)
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const page = await prisma.storePage.update({
        where: { id: body.id },
        data: {
            title: body.title,
            slug: body.slug,
            filters: body.filters
        }
    })
    return Response.json(page)
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") return Response.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    await prisma.storePage.delete({ where: { id: body.id } })
    return Response.json({ success: true })
}