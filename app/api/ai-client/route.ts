import { prisma } from "../../../lib/prisma"

export async function POST(request: Request) {
    const { message, history } = await request.json()

    const [products, categories, marques] = await Promise.all([
        prisma.product.findMany({ 
            include: { categorie: true, marque: true },
            where: { quantity: { gt: 0 } }
        }),
        prisma.categorie.findMany(),
        prisma.marque.findMany()
    ])

    const productList = products.map(p =>
        `- ID:${p.id} | ${p.name} | ${p.marque?.name || 'N/A'} | ${p.categorie?.name || 'N/A'} | Prix: ${p.price.toLocaleString()} Fcfa${p.promoActive && p.pricePromo ? ` (PROMO: ${p.pricePromo.toLocaleString()} Fcfa)` : ''} | IMAGE_URL:${p.imageUrl || ''}`
    ).join('\n')

    const context = `Tu es l'assistant virtuel de High Tech 241, une boutique tech au Gabon.
RÈGLES STRICTES :
1. Réponds en 2-3 phrases maximum.
2. Sois direct et chaleureux.
3. Quand tu mentionnes des produits, ajoute OBLIGATOIREMENT à la fin de ta réponse les URLs exactes des images en copiant mot pour mot l'IMAGE_URL du produit, au format suivant (une par ligne) :
IMAGE:https://exemple.com/image.jpg
4. Ne modifie jamais les URLs, copie-les exactement comme elles apparaissent après IMAGE_URL:
5. Réponds toujours en français.

CATALOGUE (${products.length} produits) :
${productList}

CATÉGORIES : ${categories.map(c => c.name).join(', ')}
MARQUES : ${marques.map(m => m.name).join(', ')}

INFOS MAGASIN :
- Nom : High Tech 241
- Localisation : Gabon
- Pour acheter, utiliser le bouton "Acheter" sur la fiche produit.`

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