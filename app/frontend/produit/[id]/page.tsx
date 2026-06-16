"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Box, CircularProgress, TextField, Rating } from '@mui/material'
import { ShoppingCart, Bookmark, Star, ChevronLeft, ChevronRight } from '@mui/icons-material'

type Product = {
    id: string
    name: string
    description: string
    fiche_technique: string
    imageUrl: string
    price: number
    quantity: number
    pricePromo: number | null
    promoActive: boolean
    categorieId: string | null
    marqueId: string | null
    categorie: { id: string; name: string } | null
    marque: { id: string; name: string } | null
}

type Post = {
    id: string
    title: string
    content: string
    rating: number
    user: { name: string }
}

export default function ProductPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: session } = useSession()

    const [product, setProduct] = useState<Product | null>(null)
    const [similar, setSimilar] = useState<Product[]>([])
    const [suggested, setSuggested] = useState<Product[]>([])
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'description' | 'fiche'>('description')
    const [qty, setQty] = useState(1)

    // Review form
    const [reviewTitle, setReviewTitle] = useState('')
    const [reviewContent, setReviewContent] = useState('')
    const [reviewRating, setReviewRating] = useState<number | null>(5)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Carousel indexes
    const [simIdx, setSimIdx] = useState(0)
    const [sugIdx, setSugIdx] = useState(0)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        Promise.all([
            fetch(`/api/products/${id}`).then(r => r.json()),
            fetch(`/api/post?productId=${id}`).then(r => r.json())
        ]).then(([prod, postData]) => {
            setProduct(prod)
            setPosts(Array.isArray(postData) ? postData : [])
            // Fetch similar & suggested
            fetch('/api/products').then(r => r.json()).then((all: Product[]) => {
                const others = all.filter(p => p.id !== prod.id)
                setSimilar(others.filter(p => p.categorieId === prod.categorieId).slice(0, 8))
                setSuggested(others.filter(p => p.marqueId === prod.marqueId && p.marqueId !== null).slice(0, 8))
                setLoading(false)
            })
        })
    }, [id])

    const handleReviewSubmit = async () => {
        if (!reviewTitle || !reviewContent || !reviewRating) return
        setSubmitting(true)
        const res = await fetch('/api/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id, title: reviewTitle, content: reviewContent, rating: reviewRating })
        })
        const newPost = await res.json()
        if (!newPost.error) {
            setPosts(prev => [newPost, ...prev])
            setReviewTitle('')
            setReviewContent('')
            setReviewRating(5)
            setSubmitted(true)
            setTimeout(() => setSubmitted(false), 3000)
        }
        setSubmitting(false)
    }

    const avgRating = posts.length > 0 ? posts.reduce((a, p) => a + p.rating, 0) / posts.length : 0

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    if (!product) return (
        <Box sx={{ textAlign: 'center', padding: '60px', color: '#666' }}>Produit introuvable.</Box>
    )

    const displayPrice = product.promoActive && product.pricePromo ? product.pricePromo : product.price

    return (
        <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8', padding: '12px 40px' }}>
                <Box sx={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#888' }}>
                    <span style={{ cursor: 'pointer', color: '#0F3D1F' }} onClick={() => router.push('/frontend')}>Accueil</span>
                    <span>›</span>
                    {product.categorie && <><span style={{ cursor: 'pointer', color: '#0F3D1F' }}>{product.categorie.name}</span><span>›</span></>}
                    <span style={{ color: '#333' }}>{product.name}</span>
                </Box>
            </Box>

            {/* Main product section */}
            <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '32px 40px' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: '40px', backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

                    {/* Image */}
                    <Box>
                        <Box sx={{ border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                            <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </Box>
                        {/* Thumbnails placeholder */}
                        <Box sx={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {[1, 2, 3].map(i => (
                                <Box key={i} sx={{ width: 64, height: 64, border: i === 1 ? '2px solid #0F3D1F' : '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Info */}
                    <Box>
                        {product.marque && <Box sx={{ fontSize: '12px', fontWeight: 700, color: '#0F3D1F', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{product.marque.name}</Box>}
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>{product.name}</h1>

                        {/* Rating summary */}
                        {posts.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Rating value={avgRating} precision={0.5} readOnly size="small" sx={{ color: '#0F3D1F' }} />
                                <span style={{ fontSize: '13px', color: '#888' }}>({posts.length} avis)</span>
                            </Box>
                        )}

                        {/* Tabs */}
                        <Box sx={{ display: 'flex', borderBottom: '2px solid #e8e8e8', marginBottom: '16px' }}>
                            {(['description', 'fiche'] as const).map(tab => (
                                <Box key={tab} onClick={() => setActiveTab(tab)} sx={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid #0F3D1F' : '2px solid transparent', marginBottom: '-2px', color: activeTab === tab ? '#0F3D1F' : '#888', transition: 'all 0.2s' }}>
                                    {tab === 'description' ? 'Description' : 'Fiche technique'}
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ fontSize: '14px', color: '#555', lineHeight: 1.7, maxHeight: 180, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                            {activeTab === 'description' ? (product.description || 'Aucune description disponible.') : (product.fiche_technique || 'Aucune fiche technique disponible.')}
                        </Box>
                    </Box>

                    {/* Buy box */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* Price */}
                        <Box sx={{ backgroundColor: '#f0f7f2', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                            {product.promoActive && product.pricePromo ? (
                                <>
                                    <Box sx={{ fontSize: '13px', color: '#888', textDecoration: 'line-through', marginBottom: '4px' }}>{product.price.toLocaleString()} Fcfa</Box>
                                    <Box sx={{ fontSize: '26px', fontWeight: 800, color: '#0F3D1F' }}>{product.pricePromo.toLocaleString()} Fcfa</Box>
                                    <Box sx={{ backgroundColor: '#0F3D1F', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginTop: '6px' }}>
                                        -{Math.round((1 - product.pricePromo / product.price) * 100)}%
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ fontSize: '26px', fontWeight: 800, color: '#0F3D1F' }}>{product.price.toLocaleString()} Fcfa</Box>
                            )}
                        </Box>

                        {/* Stock */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: product.quantity > 0 ? '#22c55e' : '#ef4444' }} />
                            <span style={{ color: product.quantity > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                {product.quantity > 0 ? `En stock (${product.quantity})` : 'Rupture de stock'}
                            </span>
                        </Box>

                        {/* Qty */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Quantité</span>
                            <Box sx={{ display: 'flex', alignItems: 'center',color:"black", border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                                <Box onClick={() => setQty(q => Math.max(1, q - 1))} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5', fontSize: '16px', fontWeight: 700, '&:hover': { backgroundColor: '#e0e0e0' } }}>−</Box>
                                <Box sx={{ width: 40, textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{qty}</Box>
                                <Box onClick={() => setQty(q => Math.min(product.quantity, q + 1))} sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#f5f5f5', fontSize: '16px', fontWeight: 700, '&:hover': { backgroundColor: '#e0e0e0' } }}>+</Box>
                            </Box>
                        </Box>

                        {/* Buttons */}
                        <Box onClick={() => {}} sx={{ backgroundColor: '#0F3D1F', color: '#fff', padding: '13px', borderRadius: '10px', textAlign: 'center', fontWeight: 700, fontSize: '14px', cursor: product.quantity > 0 ? 'pointer' : 'not-allowed', opacity: product.quantity > 0 ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s', '&:hover': { backgroundColor: product.quantity > 0 ? '#0a2a14' : '#0F3D1F' } }}>
                            <ShoppingCart fontSize="small" /> Effectuer un paiement
                        </Box>

                        {/* Livraison info */}
                        <Box sx={{ backgroundColor: '#fafafa', borderRadius: '10px', padding: '14px', fontSize: '12px', color: '#666', lineHeight: 1.8 }}>
                            Livraison disponible<br />
                            Retrait en magasin possible<br />
                            Paiement sécurisé
                        </Box>
                    </Box>
                </Box>

                {/* Similar products */}
                {similar.length > 0 && (
                    <Box sx={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '20px' }}>Articles similaires</h2>
                        <Box sx={{ position: 'relative' }}>
                            {simIdx > 0 && <Box onClick={() => setSimIdx(i => Math.max(0, i - 4))} sx={arrowStyle('left')}><ChevronLeft /></Box>}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflow: 'hidden' }}>
                                {similar.slice(simIdx, simIdx + 5).map(p => <ProductCard key={p.id} product={p} onClick={() => router.push(`/frontend/produit/${p.id}`)} />)}
                            </Box>
                            {simIdx + 5 < similar.length && <Box onClick={() => setSimIdx(i => i + 4)} sx={arrowStyle('right')}><ChevronRight /></Box>}
                        </Box>
                    </Box>
                )}

                {/* Suggested products */}
                {suggested.length > 0 && (
                    <Box sx={{ marginTop: '40px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '20px' }}>Articles qui pourraient vous intéresser</h2>
                        <Box sx={{ position: 'relative' }}>
                            {sugIdx > 0 && <Box onClick={() => setSugIdx(i => Math.max(0, i - 4))} sx={arrowStyle('left')}><ChevronLeft /></Box>}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                                {suggested.slice(sugIdx, sugIdx + 4).map(p => <ProductCard key={p.id} product={p} onClick={() => router.push(`/frontend/produit/${p.id}`)} />)}
                            </Box>
                            {sugIdx + 5 < suggested.length && <Box onClick={() => setSugIdx(i => i + 4)} sx={arrowStyle('right')}><ChevronRight /></Box>}
                        </Box>
                    </Box>
                )}

                {/* Reviews */}
                <Box sx={{ marginTop: '40px', backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '24px' }}>Retours utilisateurs</h2>

                    {/* Existing reviews */}
                    {posts.length === 0 ? (
                        <Box sx={{ color: '#aaa', fontSize: '14px', marginBottom: '32px' }}>Aucun avis pour l'instant. Soyez le premier !</Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                            {posts.map(post => (
                                <Box key={post.id} sx={{ border: '1px solid #e8e8e8', borderRadius: '12px', padding: '16px 20px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#0F3D1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                                            {post.user.name.charAt(0).toUpperCase()}
                                        </Box>
                                        <Box>
                                            <Box sx={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>{post.user.name}</Box>
                                            <Rating value={post.rating} readOnly size="small" sx={{ color: '#0F3D1F' }} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>{post.title}</Box>
                                    <Box sx={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>{post.content}</Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Review form */}
                    {session ? (
                        <Box sx={{ borderTop: '1px solid #e8e8e8', paddingTop: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>Laisser un avis</h3>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 500 }}>
                                <Box>
                                    <Box sx={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>Note</Box>
                                    <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} sx={{ color: '#0F3D1F' }} />
                                </Box>
                                <TextField label="Titre" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} size="small" fullWidth />
                                <TextField label="Votre avis" value={reviewContent} onChange={e => setReviewContent(e.target.value)} size="small" fullWidth multiline rows={3} />
                                <Box onClick={handleReviewSubmit} sx={{ backgroundColor: submitted ? '#22c55e' : '#0F3D1F', color: '#fff', padding: '11px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', transition: 'background 0.2s' }}>
                                    {submitting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : submitted ? '✓ Publié !' : 'Publier mon avis'}
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ borderTop: '1px solid #e8e8e8', paddingTop: '24px', fontSize: '14px', color: '#888' }}>
                            <span style={{ color: '#0F3D1F', fontWeight: 600, cursor: 'pointer' }} onClick={() => router.push('/auth/login')}>Connectez-vous</span> pour laisser un avis.
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

// Arrow button style
const arrowStyle = (side: 'left' | 'right') => ({
    position: 'absolute' as const,
    [side]: -20,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#f0f7f2' }
})

// Product card component
function ProductCard({ product, onClick }: { product: Product, onClick: () => void }) {
    return (
        <Box onClick={onClick} sx={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' } }}>
            <Box sx={{ height: 140, backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </Box>
            <Box sx={{ padding: '12px' }}>
                <Box sx={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '4px' }}>{product.marque?.name || ''}</Box>
                <Box sx={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</Box>
                <Box sx={{ fontSize: '14px', fontWeight: 800, color: '#0F3D1F' }}>
                    {product.promoActive && product.pricePromo ? product.pricePromo.toLocaleString() : product.price.toLocaleString()} Fcfa
                </Box>
                {product.promoActive && product.pricePromo && (
                    <Box sx={{ fontSize: '11px', color: '#aaa', textDecoration: 'line-through' }}>{product.price.toLocaleString()} Fcfa</Box>
                )}
                <Box sx={{ marginTop: '10px', backgroundColor: '#0F3D1F', color: '#fff', padding: '7px', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                    Voir le produit
                </Box>
            </Box>
        </Box>
    )
}