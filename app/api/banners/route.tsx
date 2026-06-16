import { prisma } from "../../../lib/prisma"

export async function GET() {
    const blocks = await prisma.bannerBlock.findMany({ orderBy: { slot: 'asc' } })
    
    if (blocks.length < 3) {
        for (let slot = 1; slot <= 3; slot++) {
            await prisma.bannerBlock.upsert({
                where: { slot },
                update: {},
                create: { slot, imageUrl: '', title: '', buttonText: '', buttonLink: '' }
            })
        }
        const fresh = await prisma.bannerBlock.findMany({ orderBy: { slot: 'asc' } })
        return Response.json(fresh)
    }

    return Response.json(blocks)
}

export async function PUT(request: Request) {
    const body = await request.json()
    const block = await prisma.bannerBlock.update({
        where: { slot: body.slot },
        data: {
            imageUrl: body.imageUrl,
            title: body.title,
            buttonText: body.buttonText,
            buttonLink: body.buttonLink
        }
    })
    return Response.json(block)
}