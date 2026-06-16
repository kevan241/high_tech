import { prisma } from "../../../lib/prisma"

export async function GET() {
    const emails = await prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(emails)
}

export async function POST(request: Request) {
    const { email } = await request.json()
    if (!email || !email.includes('@')) {
        return Response.json({ error: "Email invalide" }, { status: 400 })
    }
    try {
        await prisma.newsletter.create({ data: { email } })
        return Response.json({ success: true })
    } catch {
        return Response.json({ error: "Email déjà inscrit" }, { status: 409 })
    }
}