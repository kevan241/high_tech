import { S3Client, PutObjectCommand, ListObjectsV2Command,DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await s3.send(new ListObjectsV2Command({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Prefix: 'products/'
  }))

  const images = result.Contents?.map(item => ({
    key: item.Key,
    url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`,
    lastModified: item.LastModified,
    size: item.Size
  })) || []

  return Response.json({ images })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return Response.json({ error: "Aucun fichier fourni" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `products/${Date.now()}-${file.name}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: filename,
    Body: buffer,
    ContentType: file.type,
  }))

  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`
  return Response.json({ imageUrl })
}


export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { key } = await request.json()
    await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key
    }))
    return Response.json({ success: true })
}