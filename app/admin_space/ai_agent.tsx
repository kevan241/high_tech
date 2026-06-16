"use client"
import { Box, TextField, Modal, IconButton, CircularProgress } from '@mui/material'
import { Button } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { Send, SmartToy, KeyboardArrowDown, NotificationsActive } from '@mui/icons-material'
import { usePathname } from 'next/navigation'

export default function AIAgent() {
    const pathname = usePathname()
    const isAdmin = pathname.startsWith('/dashboard')

    const [open, setOpen] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [history, setHistory] = useState<any[]>([])
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider ?' }
    ])
    const [loading, setLoading] = useState(false)
    const [threshold, setThreshold] = useState('')
    const [email, setEmail] = useState('')
    const [alertLoading, setAlertLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleOpenAlert = () => {
        setAlertOpen(true)
        setAlertLoading(true)
        fetch('/api/stock-alert')
            .then(res => res.json())
            .then(data => {
                setThreshold(data.threshold?.toString() || '5')
                setEmail(data.email || '')
                setAlertLoading(false)
            })
    }

    const handleSaveAlert = async () => {
        setSaving(true)
        await fetch('/api/stock-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threshold: parseInt(threshold), email })
        })
        setSaving(false)
        setSaved(true)
        setTimeout(() => { setSaved(false); setAlertOpen(false) }, 1500)
    }

    const parseMessage = (text: string) => {
        const imageUrls: string[] = []
        const productLinks: string[] = []

        // Extraire les liens LIEN:/frontend/produit/xxx
        const lienRegex = /LIEN:(\/[^\s,\n]+)/gi
        let match
        while ((match = lienRegex.exec(text)) !== null) {
            productLinks.push(match[1])
        }

        // Extraire les URLs d'images
        const urlRegex = /https?:\/\/[^\s,\n]+\.(?:webp|jpg|jpeg|png|gif)/gi
        const foundUrls = text.match(urlRegex) || []
        foundUrls.forEach(url => {
            if (!imageUrls.includes(url)) imageUrls.push(url)
        })

        // Nettoyer le texte
        let cleanText = text
            .replace(urlRegex, '')
            .replace(/LIEN:\/[^\s,\n]+/gi, '')
            .replace(/IMAGE:/gi, '')
            .replace(/,\s*,/g, '')
            .replace(/:\s*\./g, '.')
            .trim()

        return { text: cleanText, images: imageUrls, links: productLinks }
    }

    const handleSend = async () => {
        if (!message.trim() || loading) return
        const userMessage = message.trim()
        setMessage('')
        setMessages(prev => [...prev, { role: 'user', text: userMessage }])
        setLoading(true)
        try {
            const apiUrl = isAdmin ? '/api/ai' : '/api/ai-client'
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history })
            })
            const data = await res.json()
            const reply = data.reply || "Je n'ai pas pu répondre."
            setMessages(prev => [...prev, { role: 'ai', text: reply }])
            setHistory(prev => [
                ...prev,
                { role: 'user', parts: [{ text: userMessage }] },
                { role: 'model', parts: [{ text: reply }] }
            ])
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: 'Une erreur est survenue.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Boutons flottants */}
            {!open && (
                <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                    {isAdmin && (
                        <Box
                            onClick={handleOpenAlert}
                            sx={{
                                backgroundColor: '#fff', color: '#0F3D1F',
                                width: 44, height: 44, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0px 4px 16px rgba(15,61,31,0.2)',
                                border: '2px solid #0F3D1F',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                            }}
                        >
                            <NotificationsActive sx={{ fontSize: 20 }} />
                        </Box>
                    )}

                    <Box
                        onClick={() => setOpen(true)}
                        sx={{
                            backgroundColor: '#0F3D1F', color: '#fff',
                            width: 56, height: 56, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', boxShadow: '0px 4px 20px rgba(15,61,31,0.4)',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                        }}
                    >
                        <SmartToy />
                    </Box>
                </Box>
            )}

            {/* Modal alerte stock */}
            <Modal open={alertOpen} onClose={() => setAlertOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: '#fff', borderRadius: '16px', padding: '30px', width: '380px',
                    boxShadow: '0px 8px 40px rgba(0,0,0,0.15)', outline: 'none'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <NotificationsActive sx={{ color: '#0F3D1F', fontSize: 22 }} />
                        <h3 style={{ margin: 0, color: '#0F3D1F', fontSize: '16px' }}>Alerte stock faible</h3>
                    </Box>
                    {alertLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                            <CircularProgress size={24} sx={{ color: '#0F3D1F' }} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <TextField
                                label="Seuil d'alerte"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                type="number"
                                size="small"
                                fullWidth
                                helperText="Alerte déclenchée quand le stock passe en dessous de ce seuil"
                            />
                            <TextField
                                label="Email destinataire"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                size="small"
                                fullWidth
                                helperText="Adresse qui recevra les alertes"
                            />
                            <Button
                                variant="contained"
                                onClick={handleSaveAlert}
                                disabled={saving || !email || !threshold}
                                sx={{ backgroundColor: saved ? '#2e7d32' : '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, marginTop: '4px' }}
                            >
                                {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Modal>

            {/* Fenêtre de chat */}
            {open && (
                <Box sx={{
                    position: 'fixed', bottom: 30, right: 30, zIndex: 1000,
                    width: 380, height: 520,
                    backgroundColor: '#fff', borderRadius: '16px',
                    boxShadow: '0px 8px 40px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>
                    <Box sx={{ backgroundColor: '#0F3D1F', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <SmartToy sx={{ color: '#fff', fontSize: 20 }} />
                            <Box>
                                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>Assistant IA</p>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', margin: 0 }}>High Tech 241</p>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff', padding: '4px' }}>
                            <KeyboardArrowDown />
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((msg, i) => {
                            const parsed = msg.role === 'ai' ? parseMessage(msg.text) : { text: msg.text, images: [], links: [] }
                            return (
                                <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <Box sx={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <Box sx={{
                                            backgroundColor: msg.role === 'user' ? '#0F3D1F' : '#f0f0f0',
                                            color: msg.role === 'user' ? '#fff' : '#333',
                                            padding: '10px 14px',
                                            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            fontSize: '13px', lineHeight: '1.5'
                                        }}>
                                            {parsed.text}
                                        </Box>
                                        {parsed.images.map((url, j) => (
                                            <a
                                                key={j}
                                                href={parsed.links[j] || '#'}
                                                style={{ textDecoration: 'none', display: 'block', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e0e0e0', cursor: 'pointer' }}
                                            >
                                                <img
                                                    src={url}
                                                    alt="produit"
                                                    style={{ width: '100%', maxHeight: '140px', objectFit: 'contain', backgroundColor: '#f8f8f8', display: 'block', transition: 'opacity 0.2s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                                />
                                                <Box sx={{ backgroundColor: '#f8f8f8', borderTop: '1px solid #e0e0e0', padding: '6px 10px', fontSize: '11px', color: '#0F3D1F', fontWeight: 600 }}>
                                                    Voir le produit →
                                                </Box>
                                            </a>
                                        ))}
                                    </Box>
                                </Box>
                            )
                        })}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Box sx={{ backgroundColor: '#f0f0f0', padding: '10px 14px', borderRadius: '16px 16px 16px 4px' }}>
                                    <CircularProgress size={16} sx={{ color: '#0F3D1F' }} />
                                </Box>
                            </Box>
                        )}
                        <div ref={bottomRef} />
                    </Box>

                    <Box sx={{ padding: '12px 16px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <TextField
                            placeholder="Posez votre question..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            size="small"
                            fullWidth
                            multiline
                            maxRows={3}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '13px' } }}
                        />
                        <IconButton onClick={handleSend} disabled={loading || !message.trim()}
                            sx={{ backgroundColor: '#0F3D1F', color: '#fff', '&:hover': { backgroundColor: '#0a2a14' }, '&:disabled': { backgroundColor: '#ccc' }, borderRadius: '10px' }}>
                            <Send fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            )}
        </>
    )
}