"use client"
import { Box, TextField, Button, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { NotificationsActive } from '@mui/icons-material'

export default function StockAlertConfig() {
    const [threshold, setThreshold] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetch('/api/stock-alert')
            .then(res => res.json())
            .then(data => {
                setThreshold(data.threshold?.toString() || '5')
                setEmail(data.email || '')
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        setSaving(true)
        await fetch('/api/stock-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threshold: parseInt(threshold), email })
        })
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    if (loading) return <CircularProgress size={20} sx={{ color: '#0F3D1F' }} />

    return (
        <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', backgroundColor: '#fff', boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <NotificationsActive sx={{ color: '#e67e00', fontSize: 20 }} />
                <h3 style={{ margin: 0, color: '#0F3D1F', fontSize: '15px' }}>Alerte stock faible</h3>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <TextField
                    label="Seuil d'alerte (quantité)"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    type="number"
                    size="small"
                    fullWidth
                    helperText="Une alerte sera envoyée quand le stock descend en dessous de ce seuil"
                />
                <TextField
                    label="Email destinataire"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    size="small"
                    fullWidth
                    helperText="L'adresse qui recevra les alertes par mail"
                />
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving || !email || !threshold}
                    sx={{ backgroundColor: saved ? '#155724' : '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '13px' }}
                >
                    {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
                </Button>
            </Box>
        </Box>
    )
}