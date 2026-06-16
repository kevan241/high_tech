import { prisma } from "../../../lib/prisma"

export async function GET() {
    const blocks = await prisma.heroBlock.findMany({ orderBy: { slot: 'asc' } })
    
    if (blocks.length < 3) {
        for (let slot = 1; slot <= 3; slot++) {
            await prisma.heroBlock.upsert({
                where: { slot },
                update: {},
                create: { slot, imageUrl: '', title: '', description: '', buttonText: '', buttonLink: '' }
            })
        }
        const fresh = await prisma.heroBlock.findMany({ orderBy: { slot: 'asc' } })
        return Response.json(fresh)
    }

    return Response.json(blocks)
}

export async function PUT(request: Request) {
    const body = await request.json()
    const block = await prisma.heroBlock.update({
        where: { slot: body.slot },
        data: {
            imageUrl: body.imageUrl,
            title: body.title,
            description: body.description,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink
        }
    })
    return Response.json(block)
}