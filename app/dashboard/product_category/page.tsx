"use client"
import { Box, TextField, Button, Modal, IconButton, CircularProgress } from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useState, useEffect } from 'react'

export default function ProductCategory() {
    const [categories, setCategories] = useState<any[]>([])
    const [marques, setMarques] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'CATEGORIE' | 'MARQUE'>('CATEGORIE')

    const fetchAll = async () => {
        const [catRes, marRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/marques')
        ])
        setCategories(await catRes.json())
        setMarques(await marRes.json())
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    const items = activeTab === 'CATEGORIE' ? categories : marques
    const apiUrl = activeTab === 'CATEGORIE' ? '/api/categories' : '/api/marques'
    const label = activeTab === 'CATEGORIE' ? 'catégorie' : 'marque'

    const openCreate = () => {
        setSelected(null)
        setName('')
        setModalOpen(true)
    }

    const openEdit = (item: any) => {
        setSelected(item)
        setName(item.name)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!name.trim()) return
        setSaving(true)
        if (selected) {
            await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selected.id, name })
            })
        } else {
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
        }
        await fetchAll()
        setSaving(false)
        setModalOpen(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(`Supprimer cette ${label} ?`)) return
        await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        })
        await fetchAll()
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 100px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
                <Box>
                    <h2 style={{ color: '#0F3D1F', margin: 0, textTransform: 'capitalize' }}>
                        {activeTab === 'CATEGORIE' ? 'Catégories' : 'Marques'}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0' }}>
                        {items.length} {label}(s) au total
                    </p>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={openCreate}
                    sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '12px' }}>
                    Nouvelle {label}
                </Button>
            </Box>

            {/* Tabs */}
            <Box sx={{ display: 'flex', backgroundColor: '#0F3D1F', flexShrink: 0, padding: '0 100px' }}>
                {[
                    { value: 'CATEGORIE', label: 'Catégories' },
                    { value: 'MARQUE', label: 'Marques' },
                ].map(tab => (
                    <Box key={tab.value} onClick={() => setActiveTab(tab.value as any)} sx={{
                        padding: '10px 24px', color: '#fff', fontSize: '13px', cursor: 'pointer',
                        borderBottom: activeTab === tab.value ? '2px solid #fff' : '2px solid transparent',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}>
                        {tab.label}
                    </Box>
                ))}
            </Box>

            {/* Contenu scrollable */}
            <Box sx={{
                flex: 1, overflow: 'auto', padding: '30px 100px',
                background: `radial-gradient(circle, rgba(15,61,31,0.45) 1px, transparent 1px)`,
                backgroundColor: '#f9f9f9', backgroundSize: '25px 25px'
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                        <CircularProgress sx={{ color: '#0F3D1F' }} />
                    </Box>
                ) : items.length === 0 ? (
                    <Box sx={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
                        <p>Aucune {label} créée pour le moment.</p>
                        <Button onClick={openCreate} variant="outlined"
                            sx={{ borderColor: '#0F3D1F', color: '#0F3D1F', marginTop: '12px' }}>
                            Créer la première {label}
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {items.map((item: any) => (
                            <Box key={item.id} sx={{
                                backgroundColor: '#fff', borderRadius: '10px',
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
                                padding: '20px 24px',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                borderLeft: `4px solid ${activeTab === 'CATEGORIE' ? '#0F3D1F' : '#1a6e3c'}`
                            }}>
                                <Box>
                                    <p style={{ fontWeight: 'bold', fontSize: '15px', color: '#0F3D1F', margin: 0 }}>
                                        {item.name}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>
                                        {item._count?.products ?? 0} produit(s)
                                    </p>
                                </Box>
                                <Box sx={{ display: 'flex', gap: '4px' }}>
                                    <IconButton onClick={() => openEdit(item)} size="small" sx={{ color: '#0F3D1F' }}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(item.id)} size="small" sx={{ color: '#cc0000' }}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff', borderRadius: '12px',
                    padding: '30px', width: '420px',
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>
                        {selected ? `Modifier la ${label}` : `Nouvelle ${label}`}
                    </h3>
                    <TextField
                        label={`Nom de la ${label}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth size="small" autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <Box sx={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        <Button fullWidth variant="contained" onClick={handleSave}
                            disabled={saving || !name.trim()}
                            sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                        </Button>
                        <Button fullWidth variant="outlined" onClick={() => setModalOpen(false)}
                            sx={{ borderColor: '#ccc', color: '#666' }}>
                            Annuler
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    )
}