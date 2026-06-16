"use client"
import { Box, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { ShoppingCart, Inventory, People, LocalOffer, Warning } from '@mui/icons-material'
import StockAlertConfig from "@/app/admin_space/stock_alert_config"

export default function Dashboard() {
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [alertConfig, setAlertConfig] = useState<{ threshold: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            const [prodRes, ordRes, usrRes, alertRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/orders'),
                fetch('/api/users'),
                fetch('/api/stock-alert')
            ])
            setProducts(await prodRes.json())
            setOrders(await ordRes.json())
            setUsers(await usrRes.json())
            setAlertConfig(await alertRes.json())
            setLoading(false)
        }
        fetchAll()
    }, [])

    const threshold = alertConfig?.threshold ?? 5

    const stats = {
        totalProduits: products.length,
        enPromo: products.filter(p => p.promoActive).length,
        stockFaible: products.filter(p => p.quantity <= threshold).length,
        totalCommandes: orders.length,
        enAttente: orders.filter(o => o.status === 'EN_ATTENTE').length,
        expediees: orders.filter(o => o.status === 'EXPEDIEE').length,
        livrees: orders.filter(o => o.status === 'LIVREE').length,
        totalUsers: users.length,
        chiffreAffaires: orders.filter(o => o.status === 'LIVREE').reduce((sum, o) => sum + o.total, 0),
    }

    const recentOrders = orders.slice(0, 5)
    const lowStock = products.filter(p => p.quantity <= threshold).slice(0, 5)

    const STATUS_COLORS: Record<string, { bg: string, color: string, label: string }> = {
        EN_ATTENTE: { bg: '#e8f5e9', color: '#2e7d32', label: 'En attente' },
        EXPEDIEE: { bg: '#e3f0ff', color: '#1a4a7a', label: 'Expédiée' },
        LIVREE: { bg: '#0F3D1F', color: '#fff', label: 'Livrée' },
        ANNULEE: { bg: '#f5f5f5', color: '#666', label: 'Annulée' },
    }

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    return (
        <Box className='dashboard_body' sx={{
            flex: 1,overflow:'hidden', padding: '30px 60px',
            background: `radial-gradient(circle, rgba(15, 61, 31, 0.47) 1px, transparent 1px)`,
            backgroundColor: '#f9f9f9', backgroundSize: '25px 25px',height: '100%'}}>
            <h2 style={{ color: '#0F3D1F', marginBottom: '24px' }}>Vue d'ensemble</h2>

           <Box className='dashboard_content' sx={{height:'550px', overflowY:'auto'}}>
                 {/* Cartes stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {[
                    { label: 'Produits', value: stats.totalProduits, sub: `${stats.enPromo} en promo`, icon: <Inventory />, color: '#0F3D1F' },
                    { label: 'Commandes', value: stats.totalCommandes, sub: `${stats.enAttente} en attente`, icon: <ShoppingCart />, color: '#1a4a7a' },
                    { label: 'Clients', value: stats.totalUsers, sub: 'inscrits', icon: <People />, color: '#3d2a6e' },
                    { label: "Chiffre d'affaires", value: `${stats.chiffreAffaires.toLocaleString()} Fcfa`, sub: `${stats.livrees} commandes livrées`, icon: <LocalOffer />, color: '#0F3D1F' },
                ].map((stat) => (
                    <Box key={stat.label} sx={{
                        backgroundColor: '#fff', borderRadius: '12px',
                        padding: '20px 24px', boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
                        borderLeft: `4px solid ${stat.color}`
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 6px' }}>{stat.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
                                <p style={{ fontSize: '12px', color: '#aaa', margin: '4px 0 0' }}>{stat.sub}</p>
                            </Box>
                            <Box sx={{ color: stat.color, opacity: 0.3, fontSize: 40 }}>{stat.icon}</Box>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Statuts commandes */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                {[
                    { ...STATUS_COLORS.EN_ATTENTE, value: stats.enAttente },
                    { ...STATUS_COLORS.EXPEDIEE, value: stats.expediees },
                    { ...STATUS_COLORS.LIVREE, value: stats.livrees },
                    { ...STATUS_COLORS.ANNULEE, label: 'Annulées', value: orders.filter(o => o.status === 'ANNULEE').length },
                ].map((s) => (
                    <Box key={s.label} sx={{ backgroundColor: s.bg, borderRadius: '10px', padding: '14px 20px', textAlign: 'center', boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' }}>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: s.color, margin: 0 }}>{s.value}</p>
                        <p style={{ fontSize: '12px', color: s.color, margin: '4px 0 0', opacity: 0.8 }}>{s.label}</p>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Commandes récentes */}
                <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <Box sx={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                        <h3 style={{ color: '#0F3D1F', margin: 0, fontSize: '15px' }}>Commandes récentes</h3>
                    </Box>
                    {recentOrders.length === 0 ? (
                        <Box sx={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Aucune commande</Box>
                    ) : recentOrders.map((order: any, i: number) => (
                        <Box key={order.id} sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 20px', borderBottom: '1px solid #f9f9f9',
                            backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                            <Box>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', margin: 0 }}>{order.user?.name || '—'}</p>
                                <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>{order.product?.name || '—'}</p>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#0F3D1F', margin: 0 }}>{order.total?.toLocaleString()} Fcfa</p>
                                <Box sx={{
                                    display: 'inline-block', fontSize: '10px', fontWeight: 'bold',
                                    backgroundColor: STATUS_COLORS[order.status]?.bg,
                                    color: STATUS_COLORS[order.status]?.color,
                                    padding: '2px 8px', borderRadius: '4px', marginTop: '4px'
                                }}>
                                    {STATUS_COLORS[order.status]?.label}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Stock faible */}
                <Box sx={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 4px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <Box sx={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Warning sx={{ color: '#e67e00', fontSize: 18 }} />
                        <h3 style={{ color: '#0F3D1F', margin: 0, fontSize: '15px' }}>Stock faible ({stats.stockFaible})</h3>
                    </Box>
                    {lowStock.length === 0 ? (
                        <Box sx={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '13px' }}>Aucun stock faible</Box>
                    ) : lowStock.map((product: any, i: number) => (
                        <Box key={product.id} sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 20px', borderBottom: '1px solid #f9f9f9',
                            backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {product.imageUrl && (
                                    <img src={product.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, backgroundColor: '#f0f0f0' }} />
                                )}
                                <Box>
                                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', margin: 0 }}>{product.name}</p>
                                    <p style={{ fontSize: '11px', color: '#999', margin: '2px 0 0' }}>{product.price?.toLocaleString()} Fcfa</p>
                                </Box>
                            </Box>
                            <Box sx={{
                                backgroundColor: product.quantity === 0 ? '#f5f5f5' : '#e8f5e9',
                                color: product.quantity === 0 ? '#666' : '#2e7d32',
                                padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold'
                            }}>
                                {product.quantity === 0 ? 'Rupture' : `${product.quantity} restant(s)`}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
           </Box>
        </Box>
    )
}