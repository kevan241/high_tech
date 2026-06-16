"use client"
import { Box, TextField, Button, CircularProgress, Divider, Checkbox, FormControlLabel } from '@mui/material'
import { useState, useEffect } from 'react'
import { Add, ContentCopy, Delete, Edit, Visibility } from '@mui/icons-material'

export default function StorePages() {
    const [pages, setPages] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [marques, setMarques] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingPage, setEditingPage] = useState<any>(null)

    const fetchAll = async () => {
        const [pagesRes, catsRes, marRes] = await Promise.all([
            fetch('/api/store-pages'),
            fetch('/api/categories'),
            fetch('/api/marques')
        ])
        setPages(await pagesRes.json())
        setCategories(await catsRes.json())
        setMarques(await marRes.json())
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    const newPage = () => setEditingPage({
        title: '',
        slug: '',
        filters: { categories: [], marques: [], limit: 20, showFilters: []  }
    })

    const duplicate = (page: any) => setEditingPage({
        ...page,
        id: undefined,
        title: `${page.title} (copie)`,
        slug: `${page.slug}-copy-${Date.now()}`
    })

    const save = async () => {
        setSaving(true)
        const method = editingPage.id ? 'PUT' : 'POST'
        await fetch('/api/store-pages', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingPage)
        })
        await fetchAll()
        setEditingPage(null)
        setSaving(false)
    }

    const deletePage = async (id: string) => {
        if (!confirm('Supprimer cette page ?')) return
        await fetch('/api/store-pages', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        await fetchAll()
    }

    const toggleFilter = (type: 'categories' | 'marques', id: string) => {
        const current = editingPage.filters[type] || []
        const updated = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
        setEditingPage({ ...editingPage, filters: { ...editingPage.filters, [type]: updated } })
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    return (
        <Box className="main-content" sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            
            {/* Liste des pages */}
            <Box sx={{ width: editingPage ? '40%' : '100%', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRight: editingPage ? '1px solid #e0e0e0' : 'none', transition: '0.2s' }}>
                <Box sx={{ padding: '16px 32px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ color: '#0F3D1F', margin: 0 }}>Pages du site</h2>
                    <Button variant="contained" startIcon={<Add />} onClick={newPage}
                        sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                        Nouvelle page
                    </Button>
                </Box>

                <Box sx={{ overflowY: 'auto', padding: '24px 32px', flex: 1, backgroundColor: '#f9f9f9' }}>
                    {pages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', color: '#aaa', mt: 8 }}>
                            <p>Aucune page créée.</p>
                            <Button variant="outlined" onClick={newPage} sx={{ borderColor: '#0F3D1F', color: '#0F3D1F', mt: 1 }}>
                                Créer une première page
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pages.map(page => {
                                const filters = page.filters as any
                                const catCount = filters?.categories?.length || 0
                                const marCount = filters?.marques?.length || 0
                                return (
                                    <Box key={page.id} sx={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box>
                                            <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: '0 0 4px', fontSize: '15px' }}>{page.title}</p>
                                            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>/frontend/page/{page.slug}</p>
                                            <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {catCount > 0 && <span style={{ fontSize: '11px', backgroundColor: '#e8f5e9', color: '#0F3D1F', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{catCount} catégorie(s)</span>}
                                                {marCount > 0 && <span style={{ fontSize: '11px', backgroundColor: '#e3f2fd', color: '#1565c0', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{marCount} marque(s)</span>}
                                                <span style={{ fontSize: '11px', backgroundColor: '#f5f5f5', color: '#666', padding: '2px 8px', borderRadius: '4px' }}>max {filters?.limit || 20} produits</span>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: '8px' }}>
                                            <Button size="small" variant="outlined" startIcon={<Visibility />}
                                                onClick={() => window.open(`/frontend/page/${page.slug}`, '_blank')}
                                                sx={{ borderColor: '#0F3D1F', color: '#0F3D1F', fontSize: '11px' }}>
                                                Voir
                                            </Button>
                                            <Button size="small" variant="outlined" startIcon={<Edit />}
                                                onClick={() => setEditingPage({ ...page, filters: page.filters || { categories: [], marques: [], limit: 20 } })}
                                                sx={{ borderColor: '#888', color: '#888', fontSize: '11px' }}>
                                                Modifier
                                            </Button>
                                            <Button size="small" variant="outlined" startIcon={<ContentCopy />}
                                                onClick={() => duplicate(page)}
                                                sx={{ borderColor: '#e67e00', color: '#e67e00', fontSize: '11px' }}>
                                                Dupliquer
                                            </Button>
                                            <Button size="small" variant="outlined" startIcon={<Delete />}
                                                onClick={() => deletePage(page.id)}
                                                sx={{ borderColor: '#cc0000', color: '#cc0000', fontSize: '11px' }}>
                                                Supprimer
                                            </Button>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Panneau d'édition */}
            {editingPage && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>                    <Box sx={{ padding: '16px 32px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ color: '#0F3D1F', margin: 0 }}>{editingPage.id ? 'Modifier la page' : 'Nouvelle page'}</h3>
                        <Button onClick={() => setEditingPage(null)} sx={{ color: '#888' }}>Fermer</Button>
                    </Box>
                <Box sx={{overflowY:'auto', height: '600px'}}>

                    <Box sx={{ overflowY: 'auto', padding: '24px 32px', flex: 1, height: '900px' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            <TextField label="Titre de la page" value={editingPage.title} fullWidth size="small"
                                onChange={e => setEditingPage({ ...editingPage, title: e.target.value })} />

                            <TextField label="Slug (URL)" value={editingPage.slug} fullWidth size="small"
                                helperText={`URL : /frontend/page/${editingPage.slug || '...'}`}
                                onChange={e => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />

                            <TextField label="Nombre max de produits" value={editingPage.filters?.limit || 20} fullWidth size="small" type="number"
                                onChange={e => setEditingPage({ ...editingPage, filters: { ...editingPage.filters, limit: parseInt(e.target.value) } })} />


                            <Divider />

                                <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: '0 0 4px', fontSize: '14px' }}>Filtres visibles sur la page</p>
                                <p style={{ fontSize: '12px', color: '#888', margin: '-8px 0 8px' }}>Laisser vide = tous affichés par défaut</p>
                                <Box sx={{ display: 'flex', gap: '10px' }}>
                                    {['categories', 'marques', 'prix'].map(f => {
                                        const selected = editingPage.filters?.showFilters?.includes(f)
                                        return (
                                            <Box key={f} onClick={() => {
                                                const current = editingPage.filters?.showFilters || []
                                                const updated = current.includes(f) ? current.filter((x: string) => x !== f) : [...current, f]
                                                setEditingPage({ ...editingPage, filters: { ...editingPage.filters, showFilters: updated } })
                                            }} sx={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: selected ? '#0F3D1F' : '#ddd', backgroundColor: selected ? '#0F3D1F' : '#fff', color: selected ? '#fff' : '#555', transition: '0.2s' }}>
                                                {f === 'categories' ? 'Catégories' : f === 'marques' ? 'Marques' : 'Prix'}
                                            </Box>
                                        )
                                    })}
                                </Box>
                            <Divider />

                            <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: '0 0 4px', fontSize: '14px' }}>Filtrer par catégories</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: '-8px 0 8px' }}>Laisser vide = toutes les catégories</p>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {categories.map((c: any) => {
                                    const selected = editingPage.filters?.categories?.includes(c.id)
                                    return (
                                        <Box key={c.id} onClick={() => toggleFilter('categories', c.id)}
                                            sx={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: selected ? '#0F3D1F' : '#ddd', backgroundColor: selected ? '#0F3D1F' : '#fff', color: selected ? '#fff' : '#555', transition: '0.2s' }}>
                                            {c.name}
                                        </Box>
                                    )
                                })}
                            </Box>

                            <Divider />

                            <p style={{ fontWeight: 'bold', color: '#0F3D1F', margin: '0 0 4px', fontSize: '14px' }}>Filtrer par marques</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: '-8px 0 8px' }}>Laisser vide = toutes les marques</p>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {marques.map((m: any) => {
                                    const selected = editingPage.filters?.marques?.includes(m.id)
                                    return (
                                        <Box key={m.id} onClick={() => toggleFilter('marques', m.id)}
                                            sx={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: selected ? '#1565c0' : '#ddd', backgroundColor: selected ? '#1565c0' : '#fff', color: selected ? '#fff' : '#555', transition: '0.2s' }}>
                                            {m.name}
                                        </Box>
                                    )
                                })}
                            </Box>

                        </Box>
                    </Box>

                    <Box sx={{ padding: '16px 32px', borderTop: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
                        <Button fullWidth variant="contained" onClick={save} disabled={saving || !editingPage.title || !editingPage.slug}
                            sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                        </Button>
                    </Box>
                </Box>
            </Box>
            )}
        </Box>
    )
}