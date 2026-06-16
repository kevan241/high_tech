import {prisma} from "../../../lib/prisma"
import * as z from "zod"
import bcrypt from "bcrypt"
import {getServerSession} from "next-auth/next"

const UserSchema = z.object({
  name: z.string().min(4).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[1-9][\d]{7,14}$/),
  password: z.string().min(8).max(100)
})

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}

//création d'un utilisateur

export async function POST(request: Request) {
  const body = await request.json()
  const parsedBody = UserSchema.safeParse(body)

  if (!parsedBody.success) {
    return Response.json({ error: parsedBody.error }, { status: 400 })
  }

  const userCheckEmail = await prisma.user.findUnique({
    where: { email: parsedBody.data.email }
  })

  if (userCheckEmail) {
    return Response.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
  }

const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: parsedBody.data.name,
      email: parsedBody.data.email,
      phone: parsedBody.data.phone,
      password: hashedPassword,
    }


  })
  return Response.json(user)
}

// mise à jour d'un utilisateur ou modification des identifiants

export async function PUT(request: Request) {
  const session = await getServerSession()
  const body = await request.json()
  if (!session || session.user.id !== body.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const hashedPassword = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.update({
    where: { id: body.id },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: hashedPassword,
    }
  })
  return Response.json(user)
}

// suppression d'un utilisateur

export async function DELETE(request: Request) {
  const session = await getServerSession()
  const body = await request.json()

    if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.delete({
    where: { id: body.id }
  })
  return Response.json(user)
}