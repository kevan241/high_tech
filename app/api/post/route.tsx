import {prisma} from "../../../lib/prisma"

export async function GET(request: Request) {  
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    const posts = await prisma.post.findMany({
        where: productId ? { productId } : undefined,
        include: { user: true, product: true }
    })
    return Response.json(posts)
}

export async function POST(request: Request) {
    const body = await request.json()
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            rating: body.rating,
            productId: body.productId,
            userId: body.userId
        }
    })
    return Response.json(post)
}

export async function PUT(request: Request) {
    const body = await request.json()
    const post = await prisma.post.update({
        where: { id: body.id },
        data: {
            title: body.title,
            content: body.content,
            rating: body.rating,
        }
    })
    return Response.json(post)
}

export async function DELETE(request: Request) {
    const body = await request.json()
    const post = await prisma.post.delete({
        where: { id: body.id }
    })
    return Response.json(post)
}