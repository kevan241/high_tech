"use client"
import { Box, TextField, Button, CircularProgress, Divider } from '@mui/material'
import { useState, useEffect } from 'react'

export default function HeroConfig() {
    const [blocks, setBlocks] = useState<any[]>([])
    const [banners, setBanners] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<number | null>(null)
    const [savingBanner, setSavingBanner] = useState<number | null>(null)
    const [libraryOpen, setLibraryOpen] = useState(false)
    const [libraryImages, setLibraryImages] = useState<any[]>([])
    const [activeSlot, setActiveSlot] = useState<number | null>(null)
    const [activeTarget, setActiveTarget] = useState<'hero' | 'banner' | 'pub' | 'bonplan' | 'pub_promotions' | 'pub_page'>('hero')
    const [activePubPageSlug, setActivePubPageSlug] = useState<string | null>(null)
    const [pub, setPub] = useState<any>(null)
    const [savingPub, setSavingPub] = useState(false)
    const [pubPromotions, setPubPromotions] = useState<any>(null)
    const [savingPubPromotions, setSavingPubPromotions] = useState(false)
    const [bonPlans, setBonPlans] = useState<any[]>([])
    const [savingBonPlan, setSavingBonPlan] = useState<number | null>(null)
    const [sections, setSections] = useState<any[]>([])
    const [sections2, setSections2] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [storePages, setStorePages] = useState<any[]>([])
    const [pubPages, setPubPages] = useState<Record<string, any>>({})
    const [savingPubPage, setSavingPubPage] = useState<string | null>(null)

    const fetchAll = async () => {
        const [heroRes, bannerRes, pubRes, pubPromotionsRes, bonPlanRes, sectionsRes, sections2Res, catsRes] = await Promise.all([
            fetch('/api/hero'),
            fetch('/api/banners'),
            fetch('/api/pub?page=home'),
            fetch('/api/pub?page=promotions'),
            fetch('/api/bonplans'),
            fetch('/api/category-sections'),
            fetch('/api/category-sections2'),
            fetch('/api/categories')
        ])

        const safeJson = async (res: Response) => {
            try { return await res.json() } catch { return null }
        }

        setBlocks(await safeJson(heroRes))
        setBanners(await safeJson(bannerRes))
        setPub(await safeJson(pubRes))
        setPubPromotions(await safeJson(pubPromotionsRes))
        setBonPlans(await safeJson(bonPlanRes))
        setSections(await safeJson(sectionsRes))
        setSections2(await safeJson(sections2Res))
        setCategories(await safeJson(catsRes))

        try {
            const pages = await fetch('/api/store-pages').then(r => r.json())
            setStorePages(pages)
            const pubResults = await Promise.all(pages.map((p: any) => fetch(`/api/pub-blocks?page=${p.slug}`).then(r => r.json())))
            const pubMap: Record<string, any> = {}
            pages.forEach((p: any, i: number) => pubMap[p.slug] = pubResults[i])
            setPubPages(pubMap)
        } catch {
            setStorePages([])
        }

        setLoading(false)
    }

    const fetchLibrary = async () => {
        const res = await fetch('/api/upload')
        const data = await res.json()
        setLibraryImages(data.images || [])
    }

    useEffect(() => { fetchAll() }, [])

    const updateHero = (slot: number, field: string, value: string) => {
        setBlocks(prev => prev.map(b => b.slot === slot ? { ...b, [field]: value } : b))
    }

    const updateBanner = (slot: number, field: string, value: string) => {
        setBanners(prev => prev.map(b => b.slot === slot ? { ...b, [field]: value } : b))
    }

    const saveHero = async (block: any) => {
        setSaving(block.slot)
        await fetch('/api/hero', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(block) })
        setSaving(null)
    }

    const saveBanner = async (block: any) => {
        setSavingBanner(block.slot)
        await fetch('/api/banners', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(block) })
        setSavingBanner(null)
    }

    const openLibrary = (slot: number, target: 'hero' | 'banner' | 'pub' | 'bonplan' | 'pub_promotions' | 'pub_page', pageSlug?: string) => {
        setActiveSlot(slot)
        setActiveTarget(target)
        if (pageSlug) setActivePubPageSlug(pageSlug)
        fetchLibrary()
        setLibraryOpen(true)
    }

    const selectImage = (url: string) => {
        if (activeTarget === 'hero') updateHero(activeSlot!, 'imageUrl', url)
        else if (activeTarget === 'banner') updateBanner(activeSlot!, 'imageUrl', url)
        else if (activeTarget === 'pub') setPub((prev: any) => ({ ...prev, imageUrl: url }))
        else if (activeTarget === 'pub_promotions') setPubPromotions((prev: any) => ({ ...prev, imageUrl: url }))
        else if (activeTarget === 'bonplan') setBonPlans(prev => prev.map(b => b.slot === activeSlot ? { ...b, imageUrl: url } : b))
        else if (activeTarget === 'pub_page' && activePubPageSlug) {
            setPubPages(prev => ({ ...prev, [activePubPageSlug]: { ...prev[activePubPageSlug], imageUrl: url } }))
        }
        setLibraryOpen(false)
    }

    const savePubPage = async (slug: string) => {
        setSavingPubPage(slug)
        await fetch('/api/pub-blocks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page: slug, imageUrl: pubPages[slug]?.imageUrl || '', linkUrl: pubPages[slug]?.linkUrl || '' })
        })
        setSavingPubPage(null)
    }

    const HERO_LABELS: Record<number, string> = { 1: 'Bloc principal (gauche)', 2: 'Bloc haut (droite)', 3: 'Bloc bas (droite)' }
    const BANNER_LABELS: Record<number, string> = { 1: 'Bannière gauche', 2: 'Bannière centre', 3: 'Bannière droite' }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    const renderCards = (items: any[], labels: Record<number, string>, onUpdate: any, onSave: any, savingSlot: number | null, target: 'hero' | 'banner') => (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {items.map(block => (
                <Box key={block.slot} sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Box onClick={() => openLibrary(block.slot, target)}
                        sx={{ height: '180px', backgroundColor: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {block.imageUrl ? (
                            <>
                                <img src={block.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Changer l'image</span>
                                </Box>
                            </>
                        ) : (
                            <span style={{ fontSize: '13px', color: '#aaa' }}>Cliquer pour choisir une image</span>
                        )}
                    </Box>
                    <Box sx={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: 0, fontSize: '14px' }}>{labels[block.slot]}</p>
                        <TextField label="Titre" value={block.title || ''} onChange={e => onUpdate(block.slot, 'title', e.target.value)} fullWidth size="small" />
                        {target === 'hero' && (
                            <TextField label="Description" value={block.description || ''} onChange={e => onUpdate(block.slot, 'description', e.target.value)} fullWidth size="small" multiline rows={2} />
                        )}
                        <TextField label="Texte du bouton" value={block.buttonText || ''} onChange={e => onUpdate(block.slot, 'buttonText', e.target.value)} fullWidth size="small" />
                        <TextField label="Lien du bouton" value={block.buttonLink || ''} onChange={e => onUpdate(block.slot, 'buttonLink', e.target.value)} fullWidth size="small" />
                        <Button variant="contained" onClick={() => onSave(block)} disabled={savingSlot === block.slot}
                            sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                            {savingSlot === block.slot ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                        </Button>
                    </Box>
                </Box>
            ))}
        </Box>
    )

    const renderPubBlock = (label: string, value: any, setValue: any, savingState: boolean, setSavingState: any, pageKey: string, format?: string) => (
        <Box sx={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#0F3D1F', marginBottom: format ? '8px' : '20px' }}>📣 {label}</h3>
            {format && <p style={{ color: '#888', fontSize: '12px', marginBottom: '20px' }}>Format recommandé : {format}</p>}
            <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: format ? '220px' : '500px' }}>
                <Box onClick={() => openLibrary(1, pageKey === 'promotions' ? 'pub_promotions' : 'pub')}
                    sx={{ height: format ? '320px' : '180px', backgroundColor: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {value?.imageUrl ? (
                        <>
                            <img src={value.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
                                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Changer l'image</span>
                            </Box>
                            <Box onClick={e => { e.stopPropagation(); setValue({ ...value, imageUrl: '' }) }}
                                sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#dc2626', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', zIndex: 10, lineHeight: 1 }}>
                                ×
                            </Box>
                        </>
                    ) : (
                        <span style={{ fontSize: '13px', color: '#aaa' }}>Cliquer pour choisir une image</span>
                    )}
                </Box>
                <Box sx={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <TextField label="Lien (optionnel)" value={value?.linkUrl || ''} onChange={e => setValue({ ...value, linkUrl: e.target.value })} fullWidth size="small" />
                    <Button variant="contained" onClick={async () => {
                        setSavingState(true)
                        await fetch('/api/pub', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...value, page: pageKey }) })
                        setSavingState(false)
                    }} disabled={savingState} sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                        {savingState ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                    </Button>
                </Box>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, padding: '16px 60px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
                <h2 style={{ color: '#0F3D1F', margin: 0 }}>Configuration du site</h2>
            </Box>

            <Box className="product_grid_scroll" sx={{ padding: '30px 60px', height: '100%', overflow: 'hidden', background: `radial-gradient(circle, rgba(15,61,31,0.47) 1px, transparent 1px)`, backgroundColor: '#f9f9f9', backgroundSize: '25px 25px' }}>
                <Box sx={{ overflowY: 'auto', height: '600px' }}>

                    {/* Hero */}
                    <Box sx={{ marginBottom: '40px'}}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>🖼️ Hero principal</h3>
                        {renderCards(blocks, HERO_LABELS, updateHero, saveHero, saving, 'hero')}
                    </Box>

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Bannières */}
                    <Box sx={{ marginBottom: '40px' }}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>📢 Bannières</h3>
                        {renderCards(banners, BANNER_LABELS, updateBanner, saveBanner, savingBanner, 'banner')}
                    </Box>

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Pub home */}
                    {renderPubBlock('Bloc publicitaire — Accueil', pub, setPub, savingPub, setSavingPub, 'home')}

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Pub promotions */}
                    {renderPubBlock('Bannière pub — Page promotions (latérale)', pubPromotions, setPubPromotions, savingPubPromotions, setSavingPubPromotions, 'promotions', '160×600px')}

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Pub par page dynamique */}
                    {storePages.length > 0 && (
                        <>
                            <Box sx={{ marginBottom: '40px' }}>
                                <h3 style={{ color: '#0F3D1F', marginBottom: '8px' }}>🗂️ Blocs pub — Pages du site</h3>
                                <p style={{ color: '#888', fontSize: '12px', marginBottom: '24px' }}>Un bloc pub configurable par page.</p>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    {storePages.map((page: any) => (
                                        <Box key={page.slug} sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                                            <Box onClick={() => openLibrary(1, 'pub_page', page.slug)}
                                                sx={{ height: '160px', backgroundColor: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                                {pubPages[page.slug]?.imageUrl ? (
                                                    <>
                                                        <img src={pubPages[page.slug].imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
                                                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Changer l'image</span>
                                                        </Box>
                                                        <Box onClick={e => { e.stopPropagation(); setPubPages(prev => ({ ...prev, [page.slug]: { ...prev[page.slug], imageUrl: '' } })) }}
                                                            sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#dc2626', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', zIndex: 10, lineHeight: 1 }}>
                                                            ×
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#aaa' }}>Cliquer pour choisir</span>
                                                )}
                                            </Box>
                                            <Box sx={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: 0, fontSize: '13px' }}>{page.name || page.slug}</p>
                                                <TextField
                                                    label="Lien (optionnel)"
                                                    value={pubPages[page.slug]?.linkUrl || ''}
                                                    onChange={e => setPubPages(prev => ({ ...prev, [page.slug]: { ...prev[page.slug], linkUrl: e.target.value } }))}
                                                    fullWidth size="small"
                                                />
                                                <Button variant="contained" onClick={() => savePubPage(page.slug)} disabled={savingPubPage === page.slug}
                                                    sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                                                    {savingPubPage === page.slug ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                            <Divider sx={{ marginBottom: '40px' }} />
                        </>
                    )}

                    {/* Bons plans */}
                    <Box sx={{ marginBottom: '40px' }}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>🎯 Bons plans</h3>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {bonPlans.map(block => (
                                <Box key={block.slot} sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                                    <Box onClick={() => openLibrary(block.slot, 'bonplan')}
                                        sx={{ height: '180px', backgroundColor: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                        {block.imageUrl ? (
                                            <>
                                                <img src={block.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
                                                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>Changer l'image</span>
                                                </Box>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: '13px', color: '#aaa' }}>Slot {block.slot} — cliquer pour choisir</span>
                                        )}
                                    </Box>
                                    <Box sx={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: 0, fontSize: '14px' }}>
                                            {block.slot === 1 ? '🖼️ Grande image (gauche)' : `🃏 Carte ${block.slot - 1} (droite)`}
                                        </p>
                                        <TextField label="Titre" value={block.title || ''} onChange={e => setBonPlans(prev => prev.map(b => b.slot === block.slot ? { ...b, title: e.target.value } : b))} fullWidth size="small" />
                                        <TextField label="Texte du bouton" value={block.buttonText || ''} onChange={e => setBonPlans(prev => prev.map(b => b.slot === block.slot ? { ...b, buttonText: e.target.value } : b))} fullWidth size="small" />
                                        <TextField label="Lien du bouton" value={block.buttonLink || ''} onChange={e => setBonPlans(prev => prev.map(b => b.slot === block.slot ? { ...b, buttonLink: e.target.value } : b))} fullWidth size="small" />
                                        <Button variant="contained" onClick={async () => {
                                            setSavingBonPlan(block.slot)
                                            await fetch('/api/bonplans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(block) })
                                            setSavingBonPlan(null)
                                        }} disabled={savingBonPlan === block.slot}
                                            sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                                            {savingBonPlan === block.slot ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Sections catégories 1 */}
                    <Box sx={{ marginBottom: '40px' }}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>📦 Sections catégories (bloc 1)</h3>
                        <Box sx={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <select onChange={async e => {
                                if (!e.target.value) return
                                const res = await fetch('/api/category-sections', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ categorieId: e.target.value })
                                })
                                const newSection = await res.json()
                                setSections(prev => [...prev, newSection])
                                e.target.value = ''
                            }} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', color: '#333' }}>
                                <option value="">Ajouter une catégorie...</option>
                                {categories.filter(cat => !sections.find(s => s.categorieId === cat.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sections.map(section => (
                                <Box key={section.id} sx={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold', color: '#0F3D1F', fontSize: '14px' }}>{section.categorie.name}</span>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Produits affichés :</span>
                                            <select value={section.limit} onChange={async e => {
                                                const res = await fetch('/api/category-sections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: section.id, limit: parseInt(e.target.value) }) })
                                                const updated = await res.json()
                                                setSections(prev => prev.map(s => s.id === updated.id ? updated : s))
                                            }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                                                {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </Box>
                                        <button onClick={async () => {
                                            await fetch('/api/category-sections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: section.id }) })
                                            setSections(prev => prev.filter(s => s.id !== section.id))
                                        }} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Supprimer
                                        </button>
                                    </Box>
                                </Box>
                            ))}
                            {sections.length === 0 && <p style={{ color: '#aaa', fontSize: '13px' }}>Aucune section configurée.</p>}
                        </Box>
                    </Box>

                    <Divider sx={{ marginBottom: '40px' }} />

                    {/* Sections catégories 2 */}
                    <Box sx={{ marginBottom: '40px' }}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>📦 Sections catégories (bloc 2)</h3>
                        <Box sx={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <select onChange={async e => {
                                if (!e.target.value) return
                                const res = await fetch('/api/category-sections2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categorieId: e.target.value }) })
                                const newSection = await res.json()
                                setSections2(prev => [...prev, newSection])
                                e.target.value = ''
                            }} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', color: '#333' }}>
                                <option value="">Ajouter une catégorie...</option>
                                {categories.filter(cat => !sections2.find(s => s.categorieId === cat.id)).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sections2.map(section => (
                                <Box key={section.id} sx={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px 20px', boxShadow: '0px 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold', color: '#0F3D1F', fontSize: '14px' }}>{section.categorie.name}</span>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '12px', color: '#666' }}>Produits affichés :</span>
                                            <select value={section.limit} onChange={async e => {
                                                const res = await fetch('/api/category-sections2', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: section.id, limit: parseInt(e.target.value) }) })
                                                const updated = await res.json()
                                                setSections2(prev => prev.map(s => s.id === updated.id ? updated : s))
                                            }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px' }}>
                                                {[2, 4, 6, 8].map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </Box>
                                        <button onClick={async () => {
                                            await fetch('/api/category-sections2', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: section.id }) })
                                            setSections2(prev => prev.filter(s => s.id !== section.id))
                                        }} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Supprimer
                                        </button>
                                    </Box>
                                </Box>
                            ))}
                            {sections2.length === 0 && <p style={{ color: '#aaa', fontSize: '13px' }}>Aucune section configurée.</p>}
                        </Box>
                    </Box>

                </Box>
            </Box>

            {/* Bibliothèque */}
            {libraryOpen && (
                <Box sx={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '70vw', maxHeight: '80vh', overflow: 'auto' }}>
                        <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>Bibliothèque Médias</h3>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                            {libraryImages.map((image: any) => (
                                <Box key={image.key} onClick={() => selectImage(image.url)}
                                    sx={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', '&:hover': { border: '2px solid #0F3D1F' } }}>
                                    <img src={image.url} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Box>
                        <Button onClick={() => setLibraryOpen(false)} sx={{ marginTop: '20px', color: '#666' }}>Fermer</Button>
                    </Box>
                </Box>
            )}
        </Box>
    )
}