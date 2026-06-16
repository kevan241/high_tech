import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "../../../../lib/prisma"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return Response.json({ error: "Non autorisé" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File
  if (!file) return Response.json({ error: "Aucun fichier" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: filename,
    Body: buffer,
    ContentType: file.type,
  }))

  const avatarUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

  await prisma.user.update({
    where: { email: session.user.email },
    data: { avatar: avatarUrl }
  })

  return Response.json({ avatarUrl })
}