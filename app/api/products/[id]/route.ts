import { prisma } from "../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id },
        include: { 
    marque: true,
    categories: { include: { categorie: true } }
}
    })
    if (!product) return Response.json({ error: "Not found" }, { status: 404 })
    return Response.json(product)
}