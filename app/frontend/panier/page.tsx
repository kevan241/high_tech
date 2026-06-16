"use client"
import { useCart } from "../context/CartContext"
import { Box, Button, IconButton, Typography, Divider, Paper } from "@mui/material"
import { Add, Remove, Delete, ShoppingCartOutlined, ArrowBack, LocalShipping } from "@mui/icons-material"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function PanierPage() {
    const { items, removeFromCart, updateQty, total, clearCart } = useCart()
    const router = useRouter()

    const passerCommande = async () => {
    const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            items: items.map(i => ({
                productId: i.id,
                quantity: i.quantity,
                price: i.promoActive && i.pricePromo ? i.pricePromo : i.price
            }))
        })
    })
    if (res.ok) {
        clearCart()
        router.push("/frontend/commandes")
    }
}

    if (items.length === 0) return (
        <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Paper elevation={3} sx={{ borderRadius: '20px', p: { xs: 3, sm: 6 }, textAlign: 'center', maxWidth: 400 }}>
                <ShoppingCartOutlined sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>Votre panier est vide</Typography>
                <Typography sx={{ color: '#999', mb: 4 }}>Ajoutez des produits pour commencer vos achats</Typography>
                <Link href="/frontend">
<Button variant="contained" size="large"
    onClick={passerCommande}
    sx={{ backgroundColor: '#0F3D1F', borderRadius: '8px', py: 1.5, textTransform: 'none', fontWeight: 'bold', fontSize: '14px', '&:hover': { backgroundColor: '#0a2e15' } }}>
    Passer la commande
</Button>
                </Link>
            </Paper>
        </Box>
    )

    return (
        <Box sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>

                {/* Header */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: { xs: 1.5, sm: 0 }, mb: 3 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F3D1F', fontSize: { xs: '18px', sm: '24px' } }}>Votre panier</Typography>
                        <Typography sx={{ color: '#999', fontSize: '13px' }}>{items.length} produit{items.length > 1 ? 's' : ''} dans votre panier</Typography>
                    </Box>
                    <Link href="/frontend">
                        <Button startIcon={<ArrowBack />} sx={{ color: '#0F3D1F', textTransform: 'none', fontWeight: 'bold', fontSize: { xs: '12px', sm: '14px' }, pl: { xs: 0, sm: 2 } }}>
                            Continuer mes achats
                        </Button>
                    </Link>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>

                    {/* Liste produits */}
                    <Paper elevation={3} sx={{ flex: 1, width: '100%', borderRadius: '20px', p: { xs: 1.5, sm: 3 } }}>
                        <Paper elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                            {items.map((item, index) => {
                                const prix = item.promoActive && item.pricePromo ? item.pricePromo : item.price
                                return (
                                    <Box key={item.id}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: { xs: 1.5, sm: 2 } }}>

                                            {/* Ligne 1 : image + nom/prix + delete (mobile) */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: { xs: 56, sm: 80 }, height: { xs: 56, sm: 80 }, borderRadius: '10px', backgroundColor: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Image src={item.imageUrl} alt={item.name} width={70} height={70} style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }} />
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '13px', sm: '15px' }, color: '#222', mb: 0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.name}
                                                    </Typography>
                                                    {item.promoActive && item.pricePromo ? (
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <Typography sx={{ color: '#e67e00', fontWeight: 'bold', fontSize: '13px' }}>{item.pricePromo.toLocaleString()} Fcfa</Typography>
                                                            <Typography sx={{ color: '#bbb', fontSize: '11px', textDecoration: 'line-through' }}>{item.price.toLocaleString()}</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography sx={{ color: '#555', fontSize: '13px' }}>Prix : {prix.toLocaleString()} Fcfa</Typography>
                                                    )}
                                                </Box>
                                                <IconButton onClick={() => removeFromCart(item.id)} sx={{ display: { xs: 'flex', sm: 'none' }, color: '#ccc', '&:hover': { color: '#e53935' }, alignSelf: 'flex-start' }}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>

                                            {/* Ligne 2 : qty + total + delete (desktop) */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'flex-end' }, gap: 1.5, pl: { xs: 0, sm: 0 } }}>
                                                <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '14px', sm: '15px' }, color: '#222', order: { xs: 0, sm: 1 } }}>
                                                    {(prix * item.quantity).toLocaleString()} Fcfa
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', order: { xs: 1, sm: 0 } }}>
                                                    <IconButton size="small" onClick={() => updateQty(item.id, item.quantity - 1)} sx={{ borderRadius: 0, px: 0.5 }}><Remove fontSize="small" /></IconButton>
                                                    <Typography sx={{ px: 1.5, fontWeight: 'bold', fontSize: '14px' }}>{item.quantity}</Typography>
                                                    <IconButton size="small" onClick={() => updateQty(item.id, item.quantity + 1)} sx={{ borderRadius: 0, px: 0.5 }}><Add fontSize="small" /></IconButton>
                                                </Box>
                                                <IconButton onClick={() => removeFromCart(item.id)} sx={{ display: { xs: 'none', sm: 'flex' }, color: '#ccc', '&:hover': { color: '#e53935' } }}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        {index < items.length - 1 && <Divider />}
                                    </Box>
                                )
                            })}
                        </Paper>

                        <Button color="error" onClick={clearCart} sx={{ mt: 2, textTransform: 'none', fontSize: '13px' }}>
                            Vider le panier
                        </Button>
                    </Paper>

                    {/* Récapitulatif */}
                    <Paper elevation={3} sx={{ width: { xs: '100%', md: 280 }, borderRadius: '20px', p: { xs: 2, sm: 3 }, flexShrink: 0, position: { xs: 'static', md: 'sticky' }, top: 20 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0F3D1F', mb: 3 }}>Récapitulatif</Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography sx={{ color: '#666', fontSize: '14px' }}>Sous-total</Typography>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{total.toLocaleString()} FCFA</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography sx={{ color: '#666', fontSize: '14px' }}>Livraison</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocalShipping sx={{ fontSize: 16, color: '#0F3D1F' }} />
                                <Typography sx={{ color: '#0F3D1F', fontWeight: 'bold', fontSize: '14px' }}>Gratuite</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                            <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#0F3D1F' }}>{total.toLocaleString()} FCFA</Typography>
                        </Box>

                        <Button fullWidth variant="contained" size="large"
                            sx={{ backgroundColor: '#0F3D1F', borderRadius: '8px', py: 1.5, textTransform: 'none', fontWeight: 'bold', fontSize: '14px', '&:hover': { backgroundColor: '#0a2e15' } }}>
                            Passer la commande
                        </Button>
                    </Paper>

                </Box>
            </Box>
        </Box>
    )
}