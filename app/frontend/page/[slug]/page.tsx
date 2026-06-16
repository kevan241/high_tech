"use client"
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useCart } from '../../context/CartContext'
import Link from 'next/link'

export default function StorePageFront({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const { addToCart } = useCart()
    const [storePage, setStorePage] = useState<any>(null)
    const [products, setProducts] = useState<any[]>([])
    const [allCategories, setAllCategories] = useState<any[]>([])
    const [allMarques, setAllMarques] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [addedId, setAddedId] = useState<string | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedMarques, setSelectedMarques] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [maxPrice, setMaxPrice] = useState(10000000)

    useEffect(() => {
        Promise.all([
            fetch(`/api/store-pages/${slug}`).then(r => r.ok ? r.json() : null),
            fetch('/api/products').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/marques').then(r => r.json()),
        ]).then(([page, allProducts, cats, mars]) => {
            if (!page) { setNotFound(true); setLoading(false); return }
            setStorePage(page)
            setAllCategories(cats)
            setAllMarques(mars)

            const filters = page.filters as { categories: string[], marques: string[], limit: number }
            const filtered = allProducts.filter((p: any) => {
                const matchCat = !filters.categories?.length ||
                    p.categories?.some((c: any) => filters.categories.includes(c.categorieId))
                const matchMar = !filters.marques?.length ||
                    filters.marques.includes(p.marqueId)
                return matchCat && matchMar
            }).slice(0, filters.limit || 20)

            const max = Math.max(...filtered.map((p: any) => p.price), 0)
            setMaxPrice(max)
            setPriceRange([0, max])
            setProducts(filtered)
            setLoading(false)
        })
    }, [slug])

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault()
        addToCart({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            pricePromo: product.pricePromo,
            promoActive: product.promoActive,
            quantity: 1,
            maxQty: product.quantity
        })
        setAddedId(product.id)
        setTimeout(() => setAddedId(null), 1200)
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    if (notFound) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F3D1F' }}>Page introuvable</Typography>
            <Typography sx={{ color: '#888' }}>Cette page n'existe pas ou a été supprimée.</Typography>
            <button onClick={() => router.push('/frontend')} style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Retour à l'accueil
            </button>
        </Box>
    )

    const showFilters: string[] = storePage.filters?.showFilters?.length
        ? storePage.filters.showFilters
        : ['categories', 'marques', 'prix']

    const displayed = products.filter(p =>
        (selectedCategories.length === 0 || p.categories?.some((c: any) => selectedCategories.includes(c.categorieId))) &&
        (selectedMarques.length === 0 || selectedMarques.includes(p.marqueId)) &&
        p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Filtres dynamiques — chaque filtre ignore sa propre sélection
    const availableCategories = allCategories.filter(c =>
        products.filter(p =>
            (selectedMarques.length === 0 || selectedMarques.includes(p.marqueId)) &&
            p.price <= priceRange[1]
        ).some(p => p.categories?.some((pc: any) => pc.categorieId === c.id))
    )

    const availableMarques = allMarques.filter(m =>
        products.filter(p =>
            (selectedCategories.length === 0 || p.categories?.some((c: any) => selectedCategories.includes(c.categorieId))) &&
            p.price <= priceRange[1]
        ).some(p => p.marqueId === m.id)
    )

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #0F3D1F 0%, #168039 100%)', color: '#fff', padding: '40px 60px' }}>
                <Typography sx={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.1 }}>{storePage.title}</Typography>
                <Typography sx={{ fontSize: '14px', opacity: 0.8, mt: 0.5 }}>{displayed.length} produit(s)</Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

                {/* Sidebar filtres */}
                <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', alignSelf: 'start', position: 'sticky', top: '90px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: 0, fontSize: '15px' }}>Filtres</p>
                        <button onClick={() => { setSelectedCategories([]); setSelectedMarques([]); setPriceRange([0, maxPrice]) }}
                            style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            Réinitialiser
                        </button>
                    </Box>

                    {showFilters.includes('prix') && (
                        <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#333' }}>Prix</p>
                            <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                                onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                style={{ width: '100%', accentColor: '#0F3D1F' }} />
                            <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
                                0 — {priceRange[1].toLocaleString()} Fcfa
                            </p>
                        </Box>
                    )}

                    {showFilters.includes('categories') && availableCategories.length > 0 && (
                        <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#333' }}>Catégories</p>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {availableCategories.map((c: any) => (
                                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#444' }}>
                                        <input type="checkbox" checked={selectedCategories.includes(c.id)}
                                            onChange={() => setSelectedCategories(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                                            style={{ accentColor: '#0F3D1F', width: '15px', height: '15px' }} />
                                        {c.name}
                                    </label>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {showFilters.includes('marques') && availableMarques.length > 0 && (
                        <Box>
                            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#333' }}>Marques</p>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {availableMarques.map((m: any) => (
                                    <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#444' }}>
                                        <input type="checkbox" checked={selectedMarques.includes(m.id)}
                                            onChange={() => setSelectedMarques(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                                            style={{ accentColor: '#0F3D1F', width: '15px', height: '15px' }} />
                                        {m.name}
                                    </label>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Grille produits */}
                <Box>
                    {displayed.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#aaa', fontSize: '14px', mt: 8 }}>
                            Aucun produit trouvé.
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                            {displayed.map(p => {
                                const discount = p.promoActive && p.pricePromo ? Math.round((1 - p.pricePromo / p.price) * 100) : null
                                return (
                                    <Box key={p.id} sx={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.12)', transform: 'translateY(-3px)' } }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box sx={{ height: 160, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                                                <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </Box>
                                            {discount && (
                                                <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#e53e3e', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>
                                                    -{discount}%
                                                </Box>
                                            )}
                                        </Box>
                                        <Box sx={{ padding: '12px' }}>
                                            <Box sx={{ fontSize: '11px', color: '#888', mb: 0.5 }}>{p.marque?.name || ''}</Box>
                                            <Box sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', mb: 1, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Box>
                                            <Box sx={{ fontSize: '15px', fontWeight: 800, color: '#0F3D1F', mb: 0.5 }}>
                                                {(p.promoActive && p.pricePromo ? p.pricePromo : p.price).toLocaleString()} Fcfa
                                            </Box>
                                            {p.promoActive && p.pricePromo && (
                                                <Box sx={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through', mb: 1 }}>{p.price.toLocaleString()} Fcfa</Box>
                                            )}
                                            <Box sx={{ display: 'flex', gap: '8px', mt: 1.5 }}>
                                                <Link href={`/frontend/produit/${p.id}`} style={{ flex: 1 }}>
                                                    <button style={{ width: '100%', backgroundColor: 'transparent', color: '#0F3D1F', border: '1px solid #0F3D1F', padding: '7px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                        Détails
                                                    </button>
                                                </Link>
                                                <button onClick={(e) => handleAddToCart(e, p)}
                                                    style={{ flex: 1, backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '7px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    {addedId === p.id ? '✓' : 'Acheter'}
                                                </button>
                                            </Box>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}