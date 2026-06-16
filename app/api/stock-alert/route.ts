import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"

export async function GET() {
    const config = await prisma.stockAlertConfig.findFirst()
    return Response.json(config ?? { threshold: 5, email: '' })
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { threshold, email } = await request.json()
    const existing = await prisma.stockAlertConfig.findFirst()
    if (existing) {
        const config = await prisma.stockAlertConfig.update({
            where: { id: existing.id },
            data: { threshold, email }
        })
        return Response.json(config)
    }
    const config = await prisma.stockAlertConfig.create({ data: { threshold, email } })
    return Response.json(config)
}