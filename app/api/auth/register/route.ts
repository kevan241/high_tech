import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
    const body = await request.json()
    const { name, email, password, phone } = body

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return Response.json({ error: "Email déjà utilisé" }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: { name, email, password: hashed, phone, role: 'USER' }
    })

    return Response.json({ id: user.id, name: user.name, email: user.email })
}