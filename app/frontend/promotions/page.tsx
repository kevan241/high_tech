"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress, Slider, Typography, Drawer, IconButton } from '@mui/material'
import { LocalOffer, Tune, Close } from '@mui/icons-material'

type Product = {
    id: string
    name: string
    imageUrl: string
    price: number
    pricePromo: number | null
    promoActive: boolean
    categorieId: string | null
    marqueId: string | null
    categorie: { id: string; name: string } | null
    marque: { id: string; name: string } | null
}

export default function PromotionsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
    const [marques, setMarques] = useState<{ id: string; name: string }[]>([])
    const [selectedCats, setSelectedCats] = useState<string[]>([])
    const [selectedMarques, setSelectedMarques] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [maxPrice, setMaxPrice] = useState(10000000)
    const [pub, setPub] = useState<any>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/pub?page=promotions').then(r => r.json())
        ]).then(([all, pubData]) => {
            setPub(pubData)
            const promos = all.filter((p: Product) => p.promoActive && p.pricePromo)
            setProducts(promos)
            const max = Math.max(...promos.map((p: Product) => p.price), 0)
            setMaxPrice(max)
            setPriceRange([0, max])
            const cats = Array.from(new Map(promos.filter((p: Product) => p.categorie).map((p: Product) => [p.categorieId, p.categorie!])).values()) as { id: string; name: string }[]
            const mrqs = Array.from(new Map(promos.filter((p: Product) => p.marque).map((p: Product) => [p.marqueId, p.marque!])).values()) as { id: string; name: string }[]
            setCategories(cats)
            setMarques(mrqs)
            setLoading(false)
        })
    }, [])

    const toggleCat = (id: string) => setSelectedCats(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
    const toggleMarque = (id: string) => setSelectedMarques(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

    const filtered = products.filter(p => {
        const price = p.pricePromo!
        if (price < priceRange[0] || price > priceRange[1]) return false
        if (selectedCats.length > 0 && !selectedCats.includes(p.categorieId || '')) return false
        if (selectedMarques.length > 0 && !selectedMarques.includes(p.marqueId || '')) return false
        return true
    })

    const chipStyle = (active: boolean) => ({
        padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', border: '1px solid',
        borderColor: active ? '#0F3D1F' : '#ddd',
        backgroundColor: active ? '#0F3D1F' : '#fff',
        color: active ? '#fff' : '#555',
        transition: 'all 0.2s'
    })

    const FilterContent = () => (
        <Box sx={{ padding: '20px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '13px', color: '#0F3D1F', mb: 2 }}>FILTRES</Typography>

            <Typography sx={{ fontWeight: 600, fontSize: '12px', color: '#555', mb: 1 }}>Prix (Fcfa)</Typography>
            <Slider value={priceRange} onChange={(_, v) => setPriceRange(v as [number, number])}
                min={0} max={maxPrice} step={10000} sx={{ color: '#0F3D1F', mb: 0.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', mb: 2.5 }}>
                <span>{priceRange[0].toLocaleString()}</span>
                <span>{priceRange[1].toLocaleString()}</span>
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: '12px', color: '#555', mb: 1 }}>Catégories</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mb: 2.5 }}>
                {categories.map(c => (
                    <Box key={c.id} onClick={() => toggleCat(c.id)} sx={chipStyle(selectedCats.includes(c.id))}>{c.name}</Box>
                ))}
            </Box>

            <Typography sx={{ fontWeight: 600, fontSize: '12px', color: '#555', mb: 1 }}>Marques</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {marques.map(m => (
                    <Box key={m.id} onClick={() => toggleMarque(m.id)} sx={chipStyle(selectedMarques.includes(m.id))}>{m.name}</Box>
                ))}
            </Box>

            {(selectedCats.length > 0 || selectedMarques.length > 0) && (
                <Box onClick={() => { setSelectedCats([]); setSelectedMarques([]) }}
                    sx={{ mt: 2, fontSize: '12px', color: '#e53e3e', cursor: 'pointer', fontWeight: 600 }}>
                    Réinitialiser
                </Box>
            )}
        </Box>
    )

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #0F3D1F 0%, #168039 100%)', color: '#fff', padding: { xs: '24px 16px', md: '40px 60px' }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <LocalOffer sx={{ fontSize: { xs: 28, md: 40 } }} />
                    <Box>
                        <Typography sx={{ fontSize: { xs: '20px', md: '28px' }, fontWeight: 800, lineHeight: 1.1 }}>Nos Promotions</Typography>
                        <Typography sx={{ fontSize: '14px', opacity: 0.8, mt: 0.5 }}>{products.length} produits en promotion</Typography>
                    </Box>
                </Box>

                {/* Bouton filtres mobile */}
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton onClick={() => setFiltersOpen(true)} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '10px' }}>
                        <Tune />
                        {(selectedCats.length + selectedMarques.length) > 0 && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#e53e3e' }} />
                        )}
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', maxWidth: 1400, margin: '0 auto', padding: { xs: '16px', md: '24px' }, gap: '24px' }}>

                {/* Sidebar filtres - desktop */}
                <Box sx={{ width: 220, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
                        <FilterContent />
                    </Box>
                </Box>

                {/* Drawer filtres - mobile */}
                <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)}
                    slotProps={{ paper: { sx: { width: 280, backgroundColor: '#fff' } } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>Filtres</Typography>
                        <IconButton onClick={() => setFiltersOpen(false)} size="small"><Close /></IconButton>
                    </Box>
                    <FilterContent />
                </Drawer>

                {/* Grille produits */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    {filtered.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#aaa', fontSize: '14px', mt: 8 }}>Aucun produit trouvé.</Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(auto-fill, minmax(200px, 1fr))' }, gap: { xs: '10px', md: '16px' } }}>
                            {filtered.map(p => {
                                const discount = Math.round((1 - p.pricePromo! / p.price) * 100)
                                return (
                                    <Box key={p.id} onClick={() => router.push(`/frontend/produit/${p.id}`)}
                                        sx={{ backgroundColor: '#fff', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.2s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.12)', transform: 'translateY(-3px)' } }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box sx={{ height: { xs: 120, md: 160 }, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                                                <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </Box>
                                            <Box sx={{ position: 'absolute', top: 10, left: 10, backgroundColor: '#e53e3e', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px' }}>
                                                -{discount}%
                                            </Box>
                                        </Box>
                                        <Box sx={{ padding: { xs: '8px', md: '12px' } }}>
                                            <Box sx={{ fontSize: '11px', color: '#888', mb: 0.5 }}>{p.marque?.name || ''}</Box>
                                            <Box sx={{ fontSize: { xs: '12px', md: '13px' }, fontWeight: 600, color: '#1a1a1a', mb: 1, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</Box>
                                            <Box sx={{ fontSize: { xs: '13px', md: '15px' }, fontWeight: 800, color: '#0F3D1F' }}>{p.pricePromo!.toLocaleString()} Fcfa</Box>
                                            <Box sx={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>{p.price.toLocaleString()} Fcfa</Box>
                                            <Box sx={{ mt: 1.5, backgroundColor: '#0F3D1F', color: '#fff', padding: '7px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                                                Voir le produit
                                            </Box>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>

                {/* Bannière pub - desktop uniquement */}
                {pub?.imageUrl && (
                    <Box sx={{ width: 160, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                        <Box sx={{ position: 'sticky', top: '100px' }}>
                            <a href={pub.linkUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <img src={pub.imageUrl} alt="Publicité"
                                    style={{ width: '160px', borderRadius: '10px', display: 'block', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }} />
                            </a>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    )
}