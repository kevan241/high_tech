import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const page = req.nextUrl.searchParams.get('page')
    if (!page) return NextResponse.json({ error: 'page requis' }, { status: 400 })

    const block = await prisma.pubBlock.findUnique({ where: { page } })
    return NextResponse.json(block || { page, imageUrl: '', linkUrl: '' })
}

export async function PUT(req: NextRequest) {
    const { page, imageUrl, linkUrl } = await req.json()
    if (!page) return NextResponse.json({ error: 'page requis' }, { status: 400 })

    const block = await prisma.pubBlock.upsert({
        where: { page },
        update: { imageUrl, linkUrl },
        create: { page, imageUrl, linkUrl }
    })
    return NextResponse.json(block)
}

export async function DELETE(req: NextRequest) {
    const { page } = await req.json()
    await prisma.pubBlock.deleteMany({ where: { page } })
    return NextResponse.json({ ok: true })
}