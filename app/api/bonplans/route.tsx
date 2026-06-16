import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SLOTS = [1, 2, 3, 4, 5]

export async function GET() {
    const blocks = await prisma.bonPlanBlock.findMany({ orderBy: { slot: 'asc' } })
    
    const filled = SLOTS.map(slot => {
        const found = blocks.find(b => b.slot === slot)
        return found || { slot, imageUrl: null, title: null, buttonText: null, buttonLink: null }
    })
    
    return NextResponse.json(filled)
}

export async function PUT(req: Request) {
    const body = await req.json()
    const { slot, imageUrl, title, buttonText, buttonLink } = body

    const block = await prisma.bonPlanBlock.upsert({
        where: { slot },
        update: { imageUrl, title, buttonText, buttonLink },
        create: { slot, imageUrl, title, buttonText, buttonLink }
    })

    return NextResponse.json(block)
}