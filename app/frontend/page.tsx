"use client"
import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import Link from "next/link"
import { useCart } from "./context/CartContext"

export default function FrontendHome() {
    const [blocks, setBlocks] = useState<any[]>([])
    const [banners, setBanners] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [marques, setMarques] = useState<any[]>([])
    const [pub, setPub] = useState<any>(null)
    const [bonPlans, setBonPlans] = useState<any[]>([])
    const [categorySections, setCategorySections] = useState<any[]>([])
    const [categorySections2, setCategorySections2] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedMarques, setSelectedMarques] = useState<string[]>([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
    const [maxPrice, setMaxPrice] = useState(10000000)
    const [page, setPage] = useState(1)
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle')
    const [addedId, setAddedId] = useState<string | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const perPage = 8

    const { addToCart } = useCart()

    useEffect(() => {
        Promise.all([
            fetch('/api/hero').then(r => r.json()),
            fetch('/api/banners').then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
            fetch('/api/marques').then(r => r.json()),
            fetch('/api/pub?page=home').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('/api/bonplans').then(r => r.json()),
            fetch('/api/category-sections').then(r => r.json()),
            fetch('/api/category-sections2').then(r => r.json()),
        ]).then(([hero, banner, prods, cats, mars, pubData, bonPlansData, sectionsData, sections2Data]) => {
            setBlocks(hero)
            setBanners(banner)
            setProducts(prods)
            setCategories(cats)
            setMarques(mars)
            setPub(pubData || null)
            setBonPlans(bonPlansData)
            setCategorySections(sectionsData)
            setCategorySections2(sections2Data)
            const max = Math.max(...prods.map((p: any) => p.price))
            setMaxPrice(max)
            setPriceRange([0, max])
            setLoading(false)
        })
    }, [])

    const b = (slot: number) => blocks.find(b => b.slot === slot)
    const bn = (slot: number) => banners.find(b => b.slot === slot)

    const toggleCategory = (id: string) => { setPage(1); setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]) }
    const toggleMarque = (id: string) => { setPage(1); setSelectedMarques(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]) }

    const filtered = products.filter(p =>
        (selectedCategories.length === 0 || p.categories?.some((c: any) => c.visible && selectedCategories.includes(c.categorieId))) &&
        (selectedMarques.length === 0 || selectedMarques.includes(p.marqueId)) &&
        p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    const totalPages = Math.ceil(filtered.length / perPage)
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    const resetFilters = () => {
        setSelectedCategories([])
        setSelectedMarques([])
        setPriceRange([0, maxPrice])
        setPage(1)
    }

    const submitNewsletter = async () => {
        if (!newsletterEmail.includes('@')) return
        const res = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newsletterEmail })
        })
        if (res.ok) { setNewsletterStatus('success'); setNewsletterEmail('') }
        else if (res.status === 409) setNewsletterStatus('duplicate')
        else setNewsletterStatus('error')
    }

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

    const renderProductCard = (product: any) => (
        <div
            key={product.id}
            style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' }}
            onMouseEnter={e => {
                const icon = e.currentTarget.querySelector('.cart-icon') as HTMLElement
                if (icon) icon.style.opacity = '1'
            }}
            onMouseLeave={e => {
                const icon = e.currentTarget.querySelector('.cart-icon') as HTMLElement
                if (icon) icon.style.opacity = '0'
            }}
        >
            <div style={{ height: '160px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                {product.promoActive && (
                    <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#e67e00', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '4px', zIndex: 1 }}>
                        PROMO
                    </div>
                )}
                <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 4px', gap: '6px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#0F3D1F', margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <span
                        className="cart-icon"
                        onClick={(e) => handleAddToCart(e, product)}
                        title="Ajouter au panier"
                        style={{ cursor: 'pointer', fontSize: '16px', opacity: 0, transition: 'opacity 0.2s', flexShrink: 0, color: addedId === product.id ? '#22c55e' : '#0F3D1F' }}
                    >
                        {addedId === product.id ? '✓' : '🛒'}
                    </span>
                </div>
                <p style={{ fontSize: '11px', color: '#999', margin: '0 0 8px' }}>
                    {product.marque?.name || ''}
                    {product.marque && product.categories?.some((c: any) => c.visible) ? ' · ' : ''}
                    {product.categories?.filter((c: any) => c.visible).map((c: any) => c.categorie?.name).filter(Boolean).join(', ')}
                </p>
                <div style={{ marginBottom: '12px' }}>
                    {product.promoActive && product.pricePromo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#e67e00', fontWeight: 'bold' }}>{product.pricePromo.toLocaleString()} Fcfa</span>
                            <span style={{ fontSize: '12px', color: '#bbb', textDecoration: 'line-through' }}>{product.price.toLocaleString()}</span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '14px', color: '#0F3D1F', fontWeight: 'bold' }}>{product.price.toLocaleString()} Fcfa</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link href={`/frontend/produit/${product.id}`} style={{ flex: 1 }}>
                        <button style={{ width: '100%', backgroundColor: 'transparent', color: '#0F3D1F', border: '1px solid #0F3D1F', padding: '7px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Détails
                        </button>
                    </Link>
                    <button onClick={(e) => handleAddToCart(e, product)}
                        style={{ flex: 1, backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '7px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Panier
                    </button>
                </div>
            </div>
        </div>
    )

    if (loading) return <div style={{ height: '420px', backgroundColor: '#0F3D1F' }} />

    return (
        <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
{/* Search bar mobile - sous navbar */}
<div style={{ display: 'none', padding: '8px 16px', backgroundColor: '#f0f0f0', gap: '8px', alignItems: 'center', position: 'sticky', top: '56px', zIndex: 99 }} className="mobile-search-bar">
    <input
        type="text"
        placeholder="Rechercher votre produit..."
        onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                window.location.href = `/frontend/products?search=${(e.target as HTMLInputElement).value}`
            }
        }}
        style={{ flex: 1, padding: '10px 16px', borderRadius: '8px 0 0 8px', border: 'none', fontSize: '13px', outline: 'none' }}
    />
    <button
        onClick={() => setFiltersOpen(true)}
        style={{ backgroundColor: '#168039', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '0 8px 8px 0', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
        Catégories
    </button>
</div>

{/* Nav links - desktop only */}


           {/* HERO */}
<div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: '420px' }}>
    <div className="hero-main" style={{ position: 'relative', backgroundColor: '#0F3D1F', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0px 0 0 70px' }}>
        {b(1)?.imageUrl && (
            <>
                <img src={b(1).imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.63) 40%, rgba(0,0,0,0.3) 100%)' }} />
            </>
        )}
<div className="hero-text" style={{ zIndex: 1, maxWidth: '50%' }}>            <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 'bold', margin: '0 0 8px', lineHeight: 1.3 }}>{b(1)?.title || ''}</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', margin: '0 0 20px' }}>{b(1)?.description || ''}</p>
            {b(1)?.buttonText && b(1)?.buttonLink && (
                <Link href={b(1).buttonLink}>
                    <button style={{ backgroundColor: '#fff', color: '#0F3D1F', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                        {b(1).buttonText}
                    </button>
                </Link>
            )}
        </div>
    </div>
    <div className="hero-side" style={{ display: 'flex', flexDirection: 'column' }}>
        {[2, 3].map((slot, i) => (
            <div key={slot} style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: i === 0 ? '#1a1a2e' : '#16213e', display: 'flex', alignItems: 'center', padding: '24px 0 0 100px', borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                {b(slot)?.imageUrl && (
                    <>
                        <img src={b(slot).imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.49) 35%, rgba(0,0,0,0.21) 100%)' }} />
                    </>
                )}
<div className="hero-side-text" style={{ zIndex: 1, maxWidth: '55%' }}>                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '0 0 6px', lineHeight: 1.3 }}>{b(slot)?.title || ''}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 12px' }}>{b(slot)?.description || ''}</p>
                    {b(slot)?.buttonText && b(slot)?.buttonLink && (
                        <Link href={b(slot).buttonLink}>
                            <button style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {b(slot).buttonText}
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        ))}
    </div>
</div>

            {/* BANNIÈRES */}
            <div className="banners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '24px 40px', background: `radial-gradient(circle, rgba(15,61,31,0.98) 1px, transparent 1px)`, backgroundSize: '25px 25px', border: '10px solid #0F3D1F' }}>
                {[1, 2, 3].map(slot => (
                    <div key={slot} style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#0F3D1F', display: 'flex', alignItems: 'center', padding: '20px' }}>
                        {bn(slot)?.imageUrl && (
                            <>
                                <img src={bn(slot).imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 100%)' }} />
                            </>
                        )}
                        <div style={{ zIndex: 1 }}>
                            <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px' }}>{bn(slot)?.title || ''}</p>
                            {bn(slot)?.buttonText && bn(slot)?.buttonLink && (
                                <Link href={bn(slot).buttonLink}>
                                    <button style={{ backgroundColor: '#fff', color: '#0F3D1F', border: 'none', padding: '5px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        {bn(slot).buttonText}
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* PRODUITS + FILTRES */}
            <div className="products-layout" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', background: `radial-gradient(circle, rgba(15,61,31,0.49) 1px, transparent 1px)`, backgroundColor: '#f9f9f9', backgroundSize: '25px 25px' }}>

                {/* SIDEBAR */}
                <div className="sidebar-filters" style={{ backgroundColor: '#fff', borderRight: '1px solid #e0e0e0', padding: '24px 20px', alignSelf: 'start', position: 'sticky', top: '90px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#0F3D1F', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Filtres</h3>
                        <button onClick={resetFilters} style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                            Réinitialiser
                        </button>
                    </div>
                    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Montant</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                            <span>{priceRange[0].toLocaleString()} XAF</span>
                            <span>{priceRange[1].toLocaleString()} XAF</span>
                        </div>
                        <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                            onChange={e => { setPage(1); setPriceRange([priceRange[0], parseInt(e.target.value)]) }}
                            style={{ width: '100%', accentColor: '#0F3D1F' }} />
                    </div>
                    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Catégories</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {categories.map((cat: any) => (
                                <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                                    style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${selectedCategories.includes(cat.id) ? '#0F3D1F' : '#ddd'}`, backgroundColor: selectedCategories.includes(cat.id) ? '#0F3D1F' : '#fff', color: selectedCategories.includes(cat.id) ? '#fff' : '#333', fontWeight: selectedCategories.includes(cat.id) ? 'bold' : 'normal', transition: '0.2s' }}>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Marques</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {marques.map((mar: any) => (
                                <label key={mar.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                                    <input type="checkbox" checked={selectedMarques.includes(mar.id)} onChange={() => toggleMarque(mar.id)}
                                        style={{ accentColor: '#0F3D1F', width: '15px', height: '15px' }} />
                                    {mar.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GRILLE */}
                <div className="products-padding" style={{ padding: '40px' }}>



                    <h2 style={{ color: '#0F3D1F', fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>
                        Explorez nos produits <span style={{ fontSize: '14px', color: '#999', fontWeight: 'normal' }}>({filtered.length} produits)</span>
                    </h2>
                    <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {paginated.map(renderProductCard)}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    style={{ width: '36px', height: '36px', borderRadius: '6px', border: `1px solid ${page === p ? '#0F3D1F' : '#ddd'}`, backgroundColor: page === p ? '#0F3D1F' : '#fff', color: page === p ? '#333' : '#333', fontWeight: page === p ? 'bold' : 'normal', fontSize: '13px', cursor: 'pointer' }}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PUB */}
                    <div style={{ marginTop: '40px' }}>
                        {pub?.imageUrl ? (
                            <a href={pub.linkUrl || '#'} style={{ display: 'block', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 16px rgba(0,0,0,0.1)' }}>
                                <img src={pub.imageUrl} alt="Publicité" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                            </a>
                        ) : (
                            <div style={{ height: '160px', backgroundColor: '#e0e0e0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#aaa', letterSpacing: '2px' }}>HIGH TECH 241</span>
                            </div>
                        )}
                    </div>

                    {/* BONS PLANS */}
                    <div style={{ padding: '10px 30px 20px 30px', margin: '40px 0 0 0', backgroundColor: '#0F3D1F', borderRadius: '12px 12px 0 0' }}>
                        <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Nos bons plans</h2>
                        <div className="bonplans-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {bonPlans[0]?.imageUrl && (
                                <a href={bonPlans[0]?.buttonLink || '#'} style={{ textDecoration: 'none' }}>
                                    <div style={{ position: 'relative', height: '100%', minHeight: '360px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                                        <img src={bonPlans[0].imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.1) 100%)' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '24px' }}>
                                            <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px' }}>{bonPlans[0].title || ''}</p>
                                            {bonPlans[0].buttonText && (
                                                <button style={{ backgroundColor: '#fff', color: '#0F3D1F', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                                                    {bonPlans[0].buttonText}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            )}
                            <div className="bonplans-subgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {bonPlans.slice(1).map((block: any) => (
                                    block?.imageUrl && (
                                        <a key={block.slot} href={block.buttonLink || '#'} style={{ textDecoration: 'none' }}>
                                            <div style={{ position: 'relative', height: '170px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
                                                <img src={block.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 30%, rgba(0,0,0,0.05) 100%)' }} />
                                                <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '14px' }}>
                                                    <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px' }}>{block.title || ''}</p>
                                                    {block.buttonText && (
                                                        <button style={{ backgroundColor: '#ffffff', color: '#0F3D1F', border: 'none', padding: '5px 14px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                            {block.buttonText}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* NEWSLETTER */}
                    <div style={{ padding: '50px 40px', backgroundColor: '#d4edda', textAlign: 'center' }}>
                        <h2 style={{ color: '#0F3D1F', fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px' }}>Restez informé de nos offres</h2>
                        <p style={{ color: '#4a7c59', fontSize: '14px', margin: '0 0 24px' }}>Inscrivez-vous et recevez nos bons plans en avant-première</p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input type="email" value={newsletterEmail} onChange={e => setNewsletterEmail(e.target.value)}
                                placeholder="Entrez votre email"
                                style={{ width: '340px', padding: '10px 16px', backgroundColor: '#fff', color: '#0F3D1F', border: '1px solid #ccc', borderRadius: '6px 0 0 6px', fontSize: '13px', outline: 'none' }} />
                            <button onClick={submitNewsletter}
                                style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '0 6px 6px 0', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Envoyez
                            </button>
                        </div>
                        {newsletterStatus === 'success' && <p style={{ color: '#0F3D1F', marginTop: '12px', fontSize: '13px' }}>✅ Inscription réussie !</p>}
                        {newsletterStatus === 'duplicate' && <p style={{ color: '#e67e00', marginTop: '12px', fontSize: '13px' }}>Cet email est déjà inscrit.</p>}
                        {newsletterStatus === 'error' && <p style={{ color: 'red', marginTop: '12px', fontSize: '13px' }}>Une erreur est survenue.</p>}
                    </div>

                    {/* SECTIONS CATÉGORIES 1 */}
                    {categorySections.map((section: any) => {
                        const sectionProducts = filtered
                            .filter(p => p.categories?.some((c: any) => c.categorieId === section.categorieId))
                            .slice(0, section.limit)
                        if (sectionProducts.length === 0) return null
                        return (
                            <div key={section.id} style={{ marginTop: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <h2 style={{ color: '#0F3D1F', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                        Explorez nos produits {section.categorie.name}
                                    </h2>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                                </div>
                                <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                    {sectionProducts.map(renderProductCard)}
                                </div>
                            </div>
                        )
                    })}

                    {/* SECTIONS CATÉGORIES 2 */}
                    {categorySections2.map((section: any) => {
                        const sectionProducts = products
                            .filter(p => p.categories?.some((c: any) => c.categorieId === section.categorieId))
                            .slice(0, section.limit)
                        if (sectionProducts.length === 0) return null
                        return (
                            <div key={section.id} style={{ marginTop: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <h2 style={{ color: '#0F3D1F', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                        Explorez nos produits {section.categorie.name}
                                    </h2>
                                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                                </div>
                                <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                                    {sectionProducts.map(renderProductCard)}
                                </div>
                            </div>
                        )
                    })}

                </div>
            </div>

            {/* DRAWER FILTRES MOBILE */}
            {filtersOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setFiltersOpen(false)} />
                    <div style={{ position: 'relative', backgroundColor: '#fff', width: '85%', maxWidth: '320px', height: '100%', overflowY: 'auto', padding: '24px 20px', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ color: '#0F3D1F', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Filtres</h3>
                            <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
                        </div>
                        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Montant</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                                <span>{priceRange[0].toLocaleString()} XAF</span>
                                <span>{priceRange[1].toLocaleString()} XAF</span>
                            </div>
                            <input type="range" min={0} max={maxPrice} value={priceRange[1]}
                                onChange={e => { setPage(1); setPriceRange([priceRange[0], parseInt(e.target.value)]) }}
                                style={{ width: '100%', accentColor: '#0F3D1F' }} />
                        </div>
                        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Catégories</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((cat: any) => (
                                    <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                                        style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${selectedCategories.includes(cat.id) ? '#0F3D1F' : '#ddd'}`, backgroundColor: selectedCategories.includes(cat.id) ? '#0F3D1F' : '#fff', color: selectedCategories.includes(cat.id) ? '#fff' : '#333', fontWeight: selectedCategories.includes(cat.id) ? 'bold' : 'normal' }}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#333', margin: '0 0 12px' }}>Marques</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {marques.map((mar: any) => (
                                    <label key={mar.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                                        <input type="checkbox" checked={selectedMarques.includes(mar.id)} onChange={() => toggleMarque(mar.id)}
                                            style={{ accentColor: '#0F3D1F', width: '15px', height: '15px' }} />
                                        {mar.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => { resetFilters(); setFiltersOpen(false) }}
                            style={{ marginTop: '24px', width: '100%', backgroundColor: '#0F3D1F', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Réinitialiser et fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}