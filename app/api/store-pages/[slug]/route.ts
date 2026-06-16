import { prisma } from "../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const page = await prisma.storePage.findUnique({ where: { slug } })
    if (!page) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(page)
}