"use client"
import { useEffect, useState } from "react"
import { Box, Paper, Typography, Chip, Divider } from "@mui/material"
import { ShoppingBagOutlined } from "@mui/icons-material"
import Image from "next/image"
import Link from "next/link"

const statusConfig: Record<string, { label: string, color: string, bg: string }> = {
    EN_ATTENTE: { label: "En attente",  color: '#e67e00', bg: '#fff3e0' },
    EXPEDIEE:   { label: "Expédiée",    color: '#1565c0', bg: '#e3f2fd' },
    LIVREE:     { label: "Livrée",      color: '#0F3D1F', bg: '#e8f5e9' },
    ANNULEE:    { label: "Annulée",     color: '#c62828', bg: '#ffebee' },
}

export default function CommandesPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/orders/my")
            .then(r => r.json())
            .then(data => { setOrders(data); setLoading(false) })
    }, [])

    if (loading) return (
        <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#999' }}>Chargement...</Typography>
        </Box>
    )

    if (orders.length === 0) return (
        <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ borderRadius: '20px', p: 6, textAlign: 'center', maxWidth: 400 }}>
                <ShoppingBagOutlined sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>Aucune commande</Typography>
                <Typography sx={{ color: '#999', mb: 4 }}>Vous n'avez pas encore passé de commande</Typography>
                <Link href="/frontend">
                    <button style={{ backgroundColor: '#0F3D1F', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                        Découvrir nos produits
                    </button>
                </Link>
            </Paper>
        </Box>
    )

    return (
        <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', py: 4, px: 2 }}>
            <Box sx={{ maxWidth: 750, margin: '0 auto' }}>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F3D1F' }}>Mes commandes</Typography>
                    <Typography sx={{ color: '#999', fontSize: '13px' }}>{orders.length} commande{orders.length > 1 ? 's' : ''}</Typography>
                </Box>

                <Paper elevation={3} sx={{ borderRadius: '20px', p: 3 }}>
                    <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                        {orders.map((order, index) => {
                            const s = statusConfig[order.status] ?? statusConfig.EN_ATTENTE
                            return (
                                <Box key={order.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                                        {/* Image produit */}
                                        <Box sx={{ width: 80, height: 80, borderRadius: '10px', backgroundColor: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Image src={order.product.imageUrl} alt={order.product.name} width={70} height={70} style={{ objectFit: 'contain' }} />
                                        </Box>

                                        {/* Infos */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 'bold', fontSize: '15px', color: '#222', mb: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {order.product.name}
                                            </Typography>
                                            <Typography sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </Typography>
                                            <Typography sx={{ color: '#555', fontSize: '13px' }}>
                                                Qté : {order.quantity} · Total : <strong>{order.total.toLocaleString()} FCFA</strong>
                                            </Typography>
                                        </Box>

                                        {/* Statut */}
                                        <Chip label={s.label}
                                            sx={{ backgroundColor: s.bg, color: s.color, fontWeight: 'bold', fontSize: '12px', border: `1px solid ${s.color}33` }} />
                                    </Box>
                                    {index < orders.length - 1 && <Divider />}
                                </Box>
                            )
                        })}
                    </Paper>
                </Paper>
            </Box>
        </Box>
    )
}