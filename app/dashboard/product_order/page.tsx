"use client"
import { Box, Button, CircularProgress, Modal, Select, MenuItem, Chip } from '@mui/material'
import { useState, useEffect } from 'react'

const STATUS_COLORS: Record<string, { bg: string, color: string, label: string }> = {
    EN_ATTENTE: { bg: '#FFF3CD', color: '#856404', label: 'En attente' },
    EXPEDIEE: { bg: '#CCE5FF', color: '#004085', label: 'Expédiée' },
    LIVREE: { bg: '#D4EDDA', color: '#155724', label: 'Livrée' },
    ANNULEE: { bg: '#F8D7DA', color: '#721C24', label: 'Annulée' },
}

export default function ProductOrder() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders')
            const data = await res.json()
            setOrders(Array.isArray(data) ? data : [])
        } catch {
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrders() }, [])

    const handleOpenModal = (order: any) => {
        setSelectedOrder({ ...order })
        setModalOpen(true)
    }

    const handleUpdateStatus = async () => {
        setSaving(true)
        await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedOrder.id, status: selectedOrder.status })
        })
        await fetchOrders()
        setSaving(false)
        setModalOpen(false)
    }

    const handleDelete = async () => {
        if (!confirm('Supprimer cette commande ?')) return
        await fetch('/api/orders', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: selectedOrder.id })
        })
        await fetchOrders()
        setModalOpen(false)
    }

    const filtered = orders.filter(o =>
        filterStatus === '' || o.status === filterStatus
    )

    const stats = {
        total: orders.length,
        en_attente: orders.filter(o => o.status === 'EN_ATTENTE').length,
        expediee: orders.filter(o => o.status === 'EXPEDIEE').length,
        livree: orders.filter(o => o.status === 'LIVREE').length,
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{ padding: '20px 100px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', flexShrink: 0 }}>
                <h2 style={{ color: '#0F3D1F', margin: '0 0 16px' }}>Gestion des commandes</h2>

                {/* Stats */}
                <Box sx={{ display: 'flex', gap: '16px' }}>
                    {[
                        { label: 'Total', value: stats.total, bg: '#f0f0f0', color: '#333' },
                        { label: 'En attente', value: stats.en_attente, bg: '#FFF3CD', color: '#856404' },
                        { label: 'Expédiées', value: stats.expediee, bg: '#CCE5FF', color: '#004085' },
                        { label: 'Livrées', value: stats.livree, bg: '#D4EDDA', color: '#155724' },
                    ].map(s => (
                        <Box key={s.label} sx={{ backgroundColor: s.bg, borderRadius: '8px', padding: '10px 20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '22px', fontWeight: 'bold', color: s.color, margin: 0 }}>{s.value}</p>
                            <p style={{ fontSize: '12px', color: s.color, margin: 0 }}>{s.label}</p>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Tabs filtre statut */}
            <Box sx={{ display: 'flex', backgroundColor: '#0F3D1F', flexShrink: 0, padding: '0 100px' }}>
                {[
                    { value: '', label: 'Toutes' },
                    { value: 'EN_ATTENTE', label: 'En attente' },
                    { value: 'EXPEDIEE', label: 'Expédiées' },
                    { value: 'LIVREE', label: 'Livrées' },
                    { value: 'ANNULEE', label: 'Annulées' },
                ].map(tab => (
                    <Box
                        key={tab.value}
                        onClick={() => setFilterStatus(tab.value)}
                        sx={{
                            padding: '10px 24px', color: '#fff', fontSize: '13px', cursor: 'pointer',
                            borderBottom: filterStatus === tab.value ? '2px solid #fff' : '2px solid transparent',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        {tab.label}
                    </Box>
                ))}
            </Box>

            {/* Tableau scrollable */}
            <Box sx={{
                flex: 1, overflow: 'auto', padding: '30px 100px',
                background: `radial-gradient(circle, rgba(15,61,31,0.06) 1px, transparent 1px)`,
                backgroundColor: '#f9f9f9', backgroundSize: '25px 25px'
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                        <CircularProgress sx={{ color: '#0F3D1F' }} />
                    </Box>
                ) : filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
                        <p>Aucune commande pour le moment.</p>
                    </Box>
                ) : (
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                        {/* En-tête tableau */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', backgroundColor: '#0F3D1F', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                            <span>Client</span>
                            <span>Produit</span>
                            <span>Quantité</span>
                            <span>Total</span>
                            <span>Statut</span>
                            <span>Action</span>
                        </Box>

                        {/* Lignes */}
                        {filtered.map((order: any, i: number) => (
                            <Box
                                key={order.id}
                                sx={{
                                    display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
                                    padding: '14px 20px', alignItems: 'center', fontSize: '13px',
                                    backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <Box>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: '#0F3D1F' }}>{order.user?.name || '—'}</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>{order.user?.email || '—'}</p>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {order.product?.imageUrl && (
                                        <img src={order.product.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, backgroundColor: '#f0f0f0' }} />
                                    )}
                                    <p style={{ margin: 0 }}>{order.product?.name || '—'}</p>
                                </Box>
                                <span>{order.quantity}</span>
                                <span style={{ fontWeight: 'bold' }}>{order.total?.toLocaleString()} Fcfa</span>
                                <Chip
                                    label={STATUS_COLORS[order.status]?.label || order.status}
                                    size="small"
                                    sx={{
                                        backgroundColor: STATUS_COLORS[order.status]?.bg,
                                        color: STATUS_COLORS[order.status]?.color,
                                        fontWeight: 'bold', fontSize: '11px', width: 'fit-content'
                                    }}
                                />
                                <Button
                                    size="small" variant="outlined"
                                    onClick={() => handleOpenModal(order)}
                                    sx={{ borderColor: '#0F3D1F', color: '#0F3D1F', fontSize: '11px' }}
                                >
                                    Gérer
                                </Button>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Modal gérer commande */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff', borderRadius: '12px',
                    padding: '30px', width: '480px',
                    boxShadow: '0px 8px 24px rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ color: '#0F3D1F', marginBottom: '20px' }}>Détail de la commande</h3>

                    {selectedOrder && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#888' }}>Client</span>
                                <span style={{ fontWeight: 'bold' }}>{selectedOrder.user?.name}</span>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#888' }}>Produit</span>
                                <span style={{ fontWeight: 'bold' }}>{selectedOrder.product?.name}</span>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#888' }}>Quantité</span>
                                <span>{selectedOrder.quantity}</span>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: '#888' }}>Total</span>
                                <span style={{ fontWeight: 'bold' }}>{selectedOrder.total?.toLocaleString()} Fcfa</span>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                                <span style={{ color: '#888' }}>Statut</span>
                                <Select
                                    value={selectedOrder.status}
                                    onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                                    size="small"
                                    sx={{ minWidth: 160 }}
                                >
                                    <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                                    <MenuItem value="EXPEDIEE">Expédiée</MenuItem>
                                    <MenuItem value="LIVREE">Livrée</MenuItem>
                                    <MenuItem value="ANNULEE">Annulée</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: '12px' }}>
                        <Button fullWidth variant="contained" onClick={handleUpdateStatus} disabled={saving}
                            sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' } }}>
                            {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Sauvegarder'}
                        </Button>
                        <Button fullWidth variant="outlined" onClick={handleDelete}
                            sx={{ borderColor: '#cc0000', color: '#cc0000' }}>
                            Supprimer
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    )
}