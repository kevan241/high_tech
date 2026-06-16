"use client"
import { Box, TextField, Button, Modal, Select, MenuItem, InputAdornment, CircularProgress, Checkbox, Switch, FormControlLabel } from '@mui/material'
import { useState, useEffect } from 'react'
import { Slider } from '@mui/material'
import { Search, Visibility, VisibilityOff, Close } from '@mui/icons-material'

export default function ProductGestion() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [marques, setMarques] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedMarque, setSelectedMarque] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<any>(null)
    const [productCategories, setProductCategories] = useState<{ categorieId: string, visible: boolean }[]>([])
    const [modalOpen, setModalOpen] = useState(false)
    const [libraryOpen, setLibraryOpen] = useState(false)
    const [libraryImages, setLibraryImages] = useState<any[]>([])
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkModalOpen, setBulkModalOpen] = useState(false)
    const [bulkType, setBulkType] = useState<'categorie' | 'promo'>('categorie')
    const [bulkCategory, setBulkCategory] = useState('')
    const [bulkPromoPrice, setBulkPromoPrice] = useState('')
    const [bulkSaving, setBulkSaving] = useState(false)
    const [priceRange, setPriceRange] = useState<number[]>([0, 1000000])

    const fetchProducts = async () => {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
        setLoading(false)
    }

    const fetchAll = async () => {
        const [catRes, marRes] = await Promise.all([fetch('/api/categories'), fetch('/api/marques')])
        setCategories(await catRes.json())
        setMarques(await marRes.json())
    }

    const fetchLibrary = async () => {
        const res = await fetch('/api/upload')
        const data = await res.json()
        setLibraryImages(data.images || [])
    }

    useEffect(() => { fetchProducts(); fetchAll() }, [])

    useEffect(() => {
        if (products.length > 0) {
            setPriceRange([0, Math.max(...products.map(p => p.price))])
        }
    }, [products])

    const handleOpenModal = (product: any) => {
        if (selectionMode) { toggleSelect(product.id); return }
        setSelectedProduct({ ...product })
        // Initialise les catégories depuis le produit
        const cats = product.categories?.map((c: any) => ({ categorieId: c.categorieId, visible: c.visible })) || []
        setProductCategories(cats)
        setModalOpen(true)
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const toggleSelectionMode = () => { setSelectionMode(prev => !prev); setSelectedIds([]) }

    const selectAll = () => {
        if (selectedIds.length === filtered.length) setSelectedIds([])
        else setSelectedIds(filtered.map(p => p.id))
    }

    const addCategory = (categorieId: string) => {
        if (!categorieId || productCategories.find(c => c.categorieId === categorieId)) return
        setProductCategories(prev => [...prev, { categorieId, visible: true }])
    }

    const removeCategory = (categorieId: string) => {
        setProductCategories(prev => prev.filter(c => c.categorieId !== categorieId))
    }

    const toggleVisibility = (categorieId: string) => {
        setProductCategories(prev => prev.map(c => c.categorieId === categorieId ? { ...c, visible: !c.visible } : c))
    }

    const handleBulkCategory = async () => {
        setBulkSaving(true)
        await Promise.all(selectedIds.map(id => {
            const product = products.find(p => p.id === id)
            return fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, categorieId: bulkCategory || null })
            })
        }))
        await fetchProducts()
        setBulkSaving(false)
        setBulkModalOpen(false)
        setSelectedIds([])
        setSelectionMode(false)
    }

    const handleBulkPromo = async () => {
        setBulkSaving(true)
        await Promise.all(selectedIds.map(id => {
            const product = products.find(p => p.id === id)
            return fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    pricePromo: bulkPromoPrice ? parseFloat(bulkPromoPrice) : null,
                    promoActive: !!bulkPromoPrice
                })
            })
        }))
        await fetchProducts()
        setBulkSaving(false)
        setBulkModalOpen(false)
        setSelectedIds([])
        setSelectionMode(false)
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Supprimer ${selectedIds.length} produit(s) ?`)) return
        await Promise.all(selectedIds.map(id =>
            fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        ))
        await fetchProducts()
        setSelectedIds([])
        setSelectionMode(false)
    }

    const handleUpdate = async () => {
        const res = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...selectedProduct, categories: productCategories })
        })
        if (res.ok) { await fetchProducts(); setModalOpen(false) }
    }

    const handleDelete = async () => {
        if (!confirm('Supprimer ce produit ?')) return
        await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedProduct.id }) })
        await fetchProducts()
        setModalOpen(false)
    }

    const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 1000000

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (selectedCategory === '' || p.categories?.some((c: any) => c.categorieId === selectedCategory)) &&
        (selectedMarque === '' || p.marqueId === selectedMarque) &&
        p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    return (
        <Box className="parent_container" sx={{ display: 'flex', flexDirection: 'column', height: '700px', overflow: 'hidden' }}>

            {/* Barre filtres */}
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 60px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexWrap: 'wrap' }}>
                <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} displayEmpty size="small"
                    sx={{ minWidth: 130, backgroundColor: '#0F3D1F', fontSize: '13px', color: '#fff', borderRadius: '6px', '& .MuiSvgIcon-root': { color: '#fff' } }}>
                    <MenuItem value="">Catégories</MenuItem>
                    {categories.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>

                <Select value={selectedMarque} onChange={(e) => setSelectedMarque(e.target.value)} displayEmpty size="small"
                    sx={{ minWidth: 130, backgroundColor: '#0F3D1F', fontSize: '13px', color: '#fff', borderRadius: '6px', '& .MuiSvgIcon-root': { color: '#fff' } }}>
                    <MenuItem value="">Marques</MenuItem>
                    {marques.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                </Select>

                <Box sx={{ width: 200, px: 2 }}>
                    <p style={{ fontSize: '12px', color: '#333', margin: '0 0 4px' }}>
                        Prix : {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} Fcfa
                    </p>
                    <Slider value={priceRange} onChange={(_, val) => setPriceRange(val as number[])} min={0} max={maxPrice} sx={{ color: '#0F3D1F' }} />
                </Box>

                <TextField placeholder="Rechercher un produit" value={search} onChange={(e) => setSearch(e.target.value)}
                    size="small" sx={{ flex: 1, maxWidth: 300 }}
                    slotProps={{ input: { endAdornment: <InputAdornment position="end"><Search sx={{ color: '#0F3D1F' }} /></InputAdornment> } }} />

                <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {selectionMode && selectedIds.length > 0 && (
                        <>
                            <Button variant="contained" size="small" onClick={() => { setBulkType('categorie'); setBulkModalOpen(true) }}
                                sx={{ backgroundColor: '#0F3D1F', fontSize: '12px' }}>
                                Catégorie ({selectedIds.length})
                            </Button>
                            <Button variant="contained" size="small" onClick={() => { setBulkType('promo'); setBulkModalOpen(true) }}
                                sx={{ backgroundColor: '#e67e00', fontSize: '12px' }}>
                                Promo ({selectedIds.length})
                            </Button>
                            <Button variant="outlined" size="small" onClick={handleBulkDelete}
                                sx={{ borderColor: '#cc0000', color: '#cc0000', fontSize: '12px' }}>
                                Supprimer ({selectedIds.length})
                            </Button>
                        </>
                    )}
                    {selectionMode && (
                        <Button variant="outlined" size="small" onClick={selectAll}
                            sx={{ borderColor: '#0F3D1F', color: '#0F3D1F', fontSize: '12px' }}>
                            {selectedIds.length === filtered.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </Button>
                    )}
                    <Button variant={selectionMode ? 'contained' : 'outlined'} size="small" onClick={toggleSelectionMode}
                        sx={{ borderColor: '#0F3D1F', fontSize: '12px', backgroundColor: selectionMode ? '#0F3D1F' : 'transparent', color: selectionMode ? '#fff' : '#0F3D1F' }}>
                        {selectionMode ? 'Annuler' : 'Sélectionner'}
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ position: 'sticky', top: 73, zIndex: 9, display: 'flex', backgroundColor: '#0F3D1F', padding: '0 60px' }}>
                {['Tous les produits', 'En promo', 'Rupture de stock'].map((tab) => (
                    <Box key={tab} sx={{ padding: '10px 24px', color: '#fff', fontSize: '13px', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                        {tab}
                    </Box>
                ))}
            </Box>

            {/* Grille */}
            <Box className="product_grid_scroll" sx={{ padding: '30px 60px', background: `radial-gradient(circle, rgba(15,61,31,0.49) 1px, transparent 1px)`, backgroundColor: '#f9f9f9', backgroundSize: '25px 25px' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                        <CircularProgress sx={{ color: '#0F3D1F' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {filtered.map((product: any) => {
                            const isSelected = selectedIds.includes(product.id)
                            const visibleCat = product.categories?.find((c: any) => c.visible)?.categorie
                            return (
                                <Box key={product.id} onClick={() => handleOpenModal(product)} sx={{
                                    backgroundColor: '#fff', borderRadius: '8px',
                                    boxShadow: isSelected ? '0px 0px 0px 3px #0F3D1F' : '0px 4px 12px rgba(0,0,0,0.08)',
                                    overflow: 'hidden', padding: '20px 10px',
                                    cursor: selectionMode ? 'pointer' : 'default',
                                    position: 'relative', transition: 'box-shadow 0.2s'
                                }}>
                                    {product.promoActive && (
                                        <Box sx={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#e67e00', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', zIndex: 1 }}>
                                            PROMO
                                        </Box>
                                    )}
                                    {selectionMode && (
                                        <Checkbox checked={isSelected} onChange={() => toggleSelect(product.id)}
                                            onClick={e => e.stopPropagation()}
                                            sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1, color: '#0F3D1F', '&.Mui-checked': { color: '#0F3D1F' }, padding: '4px' }} />
                                    )}
                                    <Box sx={{ height: '150px', overflow: 'hidden', backgroundColor: '#f0f0f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                                    </Box>
                                    <Box sx={{ padding: '12px' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px', margin: 0, color: '#0F3D1F' }}>{product.name}</p>
<p style={{ fontSize: '11px', color: '#999', margin: '2px 0' }}>
    {product.marque?.name || ''}
    {product.marque && product.categories?.some((c: any) => c.visible) ? ' · ' : ''}
    {product.categories?.filter((c: any) => c.visible).map((c: any) => c.categorie?.name).filter(Boolean).join(', ')}
</p>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 8px' }}>
                                            {product.promoActive && product.pricePromo ? (
                                                <>
                                                    <p style={{ fontSize: '13px', color: '#e67e00', fontWeight: 'bold', margin: 0 }}>{product.pricePromo.toLocaleString()} Fcfa</p>
                                                    <p style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through', margin: 0 }}>{product.price.toLocaleString()}</p>
                                                </>
                                            ) : (
                                                <p style={{ fontSize: '13px', color: '#0F3D1F', margin: 0 }}>{product.price.toLocaleString()} Fcfa</p>
                                            )}
                                        </Box>
                                        <Box sx={{ marginBottom: '8px' }}>
                                            <Box sx={{
                                                display: 'inline-block',
                                                backgroundColor: product.quantity === 0 ? '#F8D7DA' : product.quantity <= 5 ? '#FFF3CD' : '#D4EDDA',
                                                color: product.quantity === 0 ? '#721C24' : product.quantity <= 5 ? '#856404' : '#155724',
                                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                                            }}>
                                                {product.quantity === 0 ? 'Rupture' : `Stock : ${product.quantity}`}
                                            </Box>
                                        </Box>
                                        {!selectionMode && (
                                            <Button fullWidth variant="contained"
                                                onClick={(e) => { e.stopPropagation(); handleOpenModal(product) }}
                                                sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '11px' }}>
                                                Modifier le produit
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                )}
            </Box>

            {/* Modal modification */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '600px', maxHeight: '85vh', overflow: 'auto', boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }}>
                    <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>Modifier le produit</h3>
                    <Box onClick={() => { fetchLibrary(); setLibraryOpen(true) }} sx={{ height: '160px', backgroundColor: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedProduct?.imageUrl
                            ? <img src={selectedProduct.imageUrl} alt="" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '12px', color: '#888' }}>Changer l'image</span>}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <TextField label="Nom" value={selectedProduct?.name || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} fullWidth size="small" />
                        <TextField label="Prix" value={selectedProduct?.price || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })} fullWidth size="small" />
                        <TextField label="Quantité" value={selectedProduct?.quantity || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: parseInt(e.target.value) })} fullWidth size="small" />
                        <TextField label="Description" value={selectedProduct?.description || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })} fullWidth size="small" />
                        <TextField label="Fiche technique" multiline rows={4} value={selectedProduct?.fiche_technique || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, fiche_technique: e.target.value })} fullWidth />

                        {/* Multi-catégories */}
                        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#0F3D1F', margin: '0 0 12px' }}>Catégories</p>

                            {/* Catégories assignées */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                {productCategories.map(pc => {
                                    const cat = categories.find((c: any) => c.id === pc.categorieId)
                                    return (
                                        <Box key={pc.categorieId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f5f5', borderRadius: '6px', padding: '8px 12px' }}>
                                            <span style={{ fontSize: '13px', color: pc.visible ? '#1a1a1a' : '#aaa', textDecoration: pc.visible ? 'none' : 'line-through' }}>
                                                {cat?.name || pc.categorieId}
                                            </span>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Box onClick={() => toggleVisibility(pc.categorieId)} sx={{ cursor: 'pointer', color: pc.visible ? '#0F3D1F' : '#bbb', display: 'flex', alignItems: 'center' }} title={pc.visible ? 'Masquer' : 'Afficher'}>
                                                    {pc.visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                                </Box>
                                                <Box onClick={() => removeCategory(pc.categorieId)} sx={{ cursor: 'pointer', color: '#cc0000', display: 'flex', alignItems: 'center' }}>
                                                    <Close fontSize="small" />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )
                                })}
                                {productCategories.length === 0 && (
                                    <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Aucune catégorie assignée</p>
                                )}
                            </Box>

                            {/* Ajouter une catégorie */}
                            <Select displayEmpty size="small" fullWidth value=""
                                onChange={(e) => { if (e.target.value) addCategory(e.target.value as string) }}>
                                <MenuItem value="">Ajouter une catégorie...</MenuItem>
                                {categories
                                    .filter((c: any) => !productCategories.find(pc => pc.categorieId === c.id))
                                    .map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </Box>

                        <Select value={selectedProduct?.marqueId || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, marqueId: e.target.value })} displayEmpty size="small" fullWidth>
                            <MenuItem value="">Aucune marque</MenuItem>
                            {marques.map((m: any) => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                        </Select>

                        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={selectedProduct?.promoActive || false}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, promoActive: e.target.checked })}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#e67e00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#e67e00' } }}
                                    />
                                }
                                label={<span style={{ fontSize: '14px', color: '#333' }}>Activer la promotion</span>}
                            />
                            {selectedProduct?.promoActive && (
                                <TextField label="Prix promo" value={selectedProduct?.pricePromo || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, pricePromo: parseFloat(e.target.value) })} fullWidth size="small" type="number" sx={{ marginTop: '12px' }} />
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button fullWidth variant="contained" onClick={handleUpdate} sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>Sauvegarder</Button>
                        <Button fullWidth variant="outlined" onClick={handleDelete} sx={{ borderColor: '#cc0000', color: '#cc0000' }}>Supprimer</Button>
                    </Box>
                </Box>
            </Modal>

            <Modal open={bulkModalOpen} onClose={() => setBulkModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '420px', boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }}>
                    {bulkType === 'categorie' ? (
                        <>
                            <h3 style={{ color: '#0F3D1F', marginBottom: '8px' }}>Attribuer une catégorie</h3>
                            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>{selectedIds.length} produit(s) sélectionné(s)</p>
                            <Select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} displayEmpty size="small" fullWidth>
                                <MenuItem value="">Aucune catégorie</MenuItem>
                                {categories.map((c: any) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                            <Box sx={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <Button fullWidth variant="contained" onClick={handleBulkCategory} disabled={bulkSaving} sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                                    {bulkSaving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Appliquer'}
                                </Button>
                                <Button fullWidth variant="outlined" onClick={() => setBulkModalOpen(false)} sx={{ borderColor: '#ccc', color: '#666' }}>Annuler</Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <h3 style={{ color: '#e67e00', marginBottom: '8px' }}>Appliquer une promotion</h3>
                            <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>{selectedIds.length} produit(s) sélectionné(s)</p>
                            <TextField label="Prix promo (laisser vide pour désactiver)" value={bulkPromoPrice} onChange={(e) => setBulkPromoPrice(e.target.value)} fullWidth size="small" type="number" />
                            <Box sx={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                <Button fullWidth variant="contained" onClick={handleBulkPromo} disabled={bulkSaving} sx={{ backgroundColor: '#e67e00', '&:hover': { backgroundColor: '#cc6e00' } }}>
                                    {bulkSaving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Appliquer'}
                                </Button>
                                <Button fullWidth variant="outlined" onClick={() => setBulkModalOpen(false)} sx={{ borderColor: '#ccc', color: '#666' }}>Annuler</Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

            <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '70vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }}>
                    <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>Bibliothèque Médias</h3>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                        {libraryImages.map((image: any) => (
                            <Box key={image.key} onClick={() => { setSelectedProduct({ ...selectedProduct, imageUrl: image.url }); setLibraryOpen(false) }}
                                sx={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', '&:hover': { border: '2px solid #0F3D1F' } }}>
                                <img src={image.url} alt={image.key} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Modal>
        </Box>
    )
}