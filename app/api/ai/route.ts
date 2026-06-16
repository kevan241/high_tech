import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "../../../lib/prisma"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, history } = await request.json()

    const [products, orders, categories, marques] = await Promise.all([
        prisma.product.findMany({ include: { categories: { include: { categorie: true } }, marque: true } }),
        prisma.order.findMany({ include: { user: true, product: true } }),
        prisma.categorie.findMany(),
        prisma.marque.findMany()
    ])

    const context = `Tu es un assistant IA pour l'interface d'administration de High Tech 241, un site e-commerce de produits tech au Gabon.
Tu aides l'administrateur à gérer le site.
Données actuelles du site :
- Produits (${products.length}) : ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity, promo: p.promoActive, pricePromo: p.pricePromo, categories: p.categories?.map((c: any) => c.categorie?.name).join(', '), marque: p.marque?.name })))}
- Commandes (${orders.length}) : ${JSON.stringify(orders.map(o => ({ id: o.id, status: o.status, total: o.total, product: o.product?.name, user: o.user?.name })))}
- Catégories : ${categories.map(c => c.name).join(', ')}
- Marques : ${marques.map(m => m.name).join(', ')}
Réponds en français, de façon concise et utile.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: context },
                ...history.map((h: any) => ({
                    role: h.role === 'model' ? 'assistant' : h.role,
                    content: h.parts[0].text
                })),
                { role: 'user', content: message }
            ]
        })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Je n'ai pas pu répondre."
    return Response.json({ reply })
}