"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Box, CircularProgress, Typography,
    Drawer, IconButton, Button
} from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import CloseIcon from '@mui/icons-material/Close'
import { useCart } from '../context/CartContext'
import Link from 'next/link'

type Product = {
    id: string
    name: string
    imageUrl: string
    price: number
    pricePromo: number | null
    promoActive: boolean
    categories: { categorieId: string, visible: boolean, categorie: { id: string; name: string } }[]
    marque: { id: string; name: string } | null
    marqueId: string | null
}

export default function RecentPage() {
    const router = useRouter()
    const { addToCart } = useCart()
    const [products, setProducts] = useState<Product[]>([])
    const [allMarques, setAllMarques] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [addedId, setAddedId] = useState<string | null>(null)
    const [selectedMarques, setSelectedMarques] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [maxPrice, setMaxPrice] = useState(10000000)
    const [drawerOpen, setDrawerOpen] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(r => r.json()),
            fetch('/api/marques').then(r => r.json()),
        ]).then(([all, mars]) => {
            const recent = all.filter((p: any) =>
                p.categories?.some((c: any) =>
                    c.categorie?.name?.toLowerCase().includes('récent') ||
                    c.categorie?.name?.toLowerCase().includes('recent') ||
                    c.categorie?.name?.toLowerCase().includes('nouveau') ||
                    c.categorie?.name?.toLowerCase().includes('new')
                )
            )
            const max = Math.max(...recent.map((p: any) => p.price), 0)
            setMaxPrice(max)
            setPriceRange([0, max])
            setProducts(recent)
            setAllMarques(mars)
            setLoading(false)
        })
    }, [])

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

    const displayed = products.filter(p =>
        (selectedMarques.length === 0 || selectedMarques.includes(p.marqueId!)) &&
        p.price <= priceRange[1]
    )

    const availableMarques = allMarques.filter(m =>
        products.filter(p => p.price <= priceRange[1]).some(p => p.marqueId === m.id)
    )

    const FilterContent = () => (
        <Box sx={{ padding: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: 0, fontSize: '15px' }}>Filtres</p>
                <button
                    onClick={() => { setSelectedMarques([]); setPriceRange([0, maxPrice]) }}
                    style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                >
                    Réinitialiser
                </button>
            </Box>

            <Box sx={{ mb: 3, pb: 3, borderBottom: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#333' }}>Prix</p>
                <input
                    type="range" min={0} max={maxPrice} value={priceRange[1]}
                    onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                    style={{ width: '100%', accentColor: '#0F3D1F' }}
                />
                <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>
                    0 — {priceRange[1].toLocaleString()} Fcfa
                </p>
            </Box>

            {availableMarques.length > 0 && (
                <Box>
                    <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 8px', color: '#333' }}>Marques</p>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {availableMarques.map((m: any) => (
                            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#444' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedMarques.includes(m.id)}
                                    onChange={() => setSelectedMarques(prev =>
                                        prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]
                                    )}
                                    style={{ accentColor: '#0F3D1F', width: '15px', height: '15px' }}
                                />
                                {m.name}
                            </label>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )

    return (
        <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>

            {/* Hero header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0F3D1F 0%, #168039 100%)',
                color: '#fff',
                padding: { xs: '24px 16px', md: '40px 60px' }
            }}>
                <Typography sx={{ fontSize: { xs: '22px', md: '28px' }, fontWeight: 800, lineHeight: 1.1 }}>
                    Produits Récents
                </Typography>
                <Typography sx={{ fontSize: '14px', opacity: 0.8, mt: 0.5 }}>
                    {displayed.length} produits
                </Typography>
            </Box>

            {/* Bouton filtres mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, px: 2, pt: 2 }}>
                <Button
                    startIcon={<TuneIcon />}
                    onClick={() => setDrawerOpen(true)}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: '#0F3D1F', color: '#0F3D1F', borderRadius: '8px',
                        fontWeight: 600, fontSize: '13px',
                        '&:hover': { backgroundColor: '#0F3D1F', color: '#fff' }
                    }}
                >
                    Filtres {(selectedMarques.length > 0) && `(${selectedMarques.length})`}
                </Button>
            </Box>

            {/* Drawer mobile */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 2 }}>
<Typography sx={{ fontWeight: 700, color: '#0F3D1F' }}>Filtres</Typography>                    <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
                </Box>
                <FilterContent />
                <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                        fullWidth variant="contained"
                        onClick={() => setDrawerOpen(false)}
                        sx={{ backgroundColor: '#0F3D1F', borderRadius: '8px', fontWeight: 700 }}
                    >
                        Voir les résultats ({displayed.length})
                    </Button>
                </Box>
            </Drawer>

            {/* Layout principal */}
            <Box sx={{
                display: { xs: 'block', md: 'grid' },
                gridTemplateColumns: '240px 1fr',
                gap: '24px',
                maxWidth: 1400,
                margin: '0 auto',
                padding: { xs: '16px', md: '32px 24px' }
            }}>

                {/* Sidebar desktop */}
                <Box sx={{
                    display: { xs: 'none', md: 'block' },
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    alignSelf: 'start',
                    position: 'sticky',
                    top: '90px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                    <FilterContent />
                </Box>

                {/* Grille produits */}
                <Box>
                    {displayed.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#aaa', fontSize: '14px', mt: 8 }}>
                            Aucun produit trouvé dans la catégorie "Récents".
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(auto-fill, minmax(200px, 1fr))'
                            },
                            gap: { xs: '10px', md: '16px' }
                        }}>
                            {displayed.map(p => {
                                const discount = p.promoActive && p.pricePromo
                                    ? Math.round((1 - p.pricePromo / p.price) * 100) : null
                                return (
                                    <Box key={p.id} sx={{
                                        backgroundColor: '#fff',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.12)', transform: 'translateY(-3px)' }
                                    }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Box sx={{
                                                height: { xs: 120, md: 160 },
                                                backgroundColor: '#fafafa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px'
                                            }}>
                                                <img src={p.imageUrl} alt={p.name}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                            </Box>
                                            {discount && (
                                                <Box sx={{
                                                    position: 'absolute', top: 8, left: 8,
                                                    backgroundColor: '#e53e3e', color: '#fff',
                                                    fontSize: '10px', fontWeight: 800,
                                                    padding: '2px 6px', borderRadius: '20px'
                                                }}>
                                                    -{discount}%
                                                </Box>
                                            )}
                                        </Box>

                                        <Box sx={{ padding: { xs: '8px', md: '12px' } }}>
                                            <Box sx={{ fontSize: '11px', color: '#888', mb: 0.5 }}>
                                                {p.marque?.name || ''}
                                            </Box>
                                            <Box sx={{
                                                fontSize: { xs: '12px', md: '13px' },
                                                fontWeight: 600, color: '#1a1a1a', mb: 1, lineHeight: 1.3,
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                {p.name}
                                            </Box>
                                            <Box sx={{ fontSize: { xs: '13px', md: '15px' }, fontWeight: 800, color: '#0F3D1F', mb: 0.5 }}>
                                                {(p.promoActive && p.pricePromo ? p.pricePromo : p.price).toLocaleString()} Fcfa
                                            </Box>
                                            {p.promoActive && p.pricePromo && (
                                                <Box sx={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through', mb: 1 }}>
                                                    {p.price.toLocaleString()} Fcfa
                                                </Box>
                                            )}
                                            <Box sx={{ display: 'flex', gap: '6px', mt: 1.5 }}>
                                                <Link href={`/frontend/produit/${p.id}`} style={{ flex: 1 }}>
                                                    <button style={{
                                                        width: '100%', backgroundColor: 'transparent',
                                                        color: '#0F3D1F', border: '1px solid #0F3D1F',
                                                        padding: '6px 4px', borderRadius: '5px',
                                                        fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                                                    }}>
                                                        Détails
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={(e) => handleAddToCart(e, p)}
                                                    style={{
                                                        flex: 1, backgroundColor: '#0F3D1F', color: '#fff',
                                                        border: 'none', padding: '6px 4px', borderRadius: '5px',
                                                        fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                                                    }}
                                                >
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