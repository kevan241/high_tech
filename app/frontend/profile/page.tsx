"use client"
import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Box, Paper, Typography, Avatar, IconButton, CircularProgress, TextField, Button, Alert, Divider } from "@mui/material"
import { CameraAlt } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import { MenuItem as MuiMenuItem } from "@mui/material"

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const fileRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState("")
    const [error, setError] = useState("")

    const [form, setForm] = useState({
        name: "", email: "", phone: "",
        address: "", city: "", country: "", postalCode: "", avatar: ""
    })

    const COUNTRIES = [
    { code: "GA", name: "Gabon" },
    { code: "CM", name: "Cameroun" },
    { code: "CG", name: "Congo" },
    { code: "CD", name: "RD Congo" },
    { code: "CI", name: "Côte d'Ivoire" },
    { code: "SN", name: "Sénégal" },
    { code: "ML", name: "Mali" },
    { code: "BF", name: "Burkina Faso" },
    { code: "GN", name: "Guinée" },
    { code: "MG", name: "Madagascar" },
    { code: "MA", name: "Maroc" },
    { code: "DZ", name: "Algérie" },
    { code: "TN", name: "Tunisie" },
    { code: "FR", name: "France" },
    { code: "BE", name: "Belgique" },
    { code: "CH", name: "Suisse" },
    { code: "US", name: "États-Unis" },
    { code: "GB", name: "Royaume-Uni" },
    { code: "DE", name: "Allemagne" },
    { code: "ES", name: "Espagne" },
    { code: "IT", name: "Italie" },
    { code: "CN", name: "Chine" },
    { code: "JP", name: "Japon" },
    { code: "BR", name: "Brésil" },
    { code: "OTHER", name: "Autre" },
]

    useEffect(() => {
        if (status === "unauthenticated") router.push("/frontend/login")
        if (status === "authenticated") {
            fetch("/api/user/profile").then(r => r.json()).then(d => setForm(f => ({ ...f, ...d })))
        }
    }, [status])

    const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/user/avatar", { method: "POST", body: formData })
        const data = await res.json()
        if (data.avatarUrl) setForm(f => ({ ...f, avatar: data.avatarUrl }))
        setUploading(false)
    }


    const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    const emailChanged = form.email !== session?.user?.email
    const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Erreur"); setSaving(false); return }
    
    setSuccess(emailChanged ? "Profil mis à jour ! Reconnexion requise..." : "Profil mis à jour !")
    setSaving(false)

    if (emailChanged) {
        setTimeout(() => { window.location.href = "/frontend/login" }, 1500)
    }
    // 👇 Supprime le reload — inutile pour un simple changement de pays
}

    const field = (label: string, key: string, type = "text") => (
        <TextField fullWidth label={label} type={type} value={(form as any)[key]}
            onChange={set(key)} size="small"
            sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} />
    )

    if (status === "loading") return null

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', pt: 6, px: 2, pb: 6 }}>
            <Paper elevation={3} sx={{ borderRadius: '20px', p: 4, width: '100%', maxWidth: 500, height: 'fit-content' }}>

                {/* Avatar */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={form.avatar || undefined}
                            sx={{ width: 96, height: 96, backgroundColor: '#0F3D1F', fontSize: 36 }}>
                            {form.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <IconButton onClick={() => fileRef.current?.click()}
                            sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', border: '2px solid #0F3D1F', width: 30, height: 30 }}>
                            {uploading ? <CircularProgress size={14} /> : <CameraAlt sx={{ fontSize: 16, color: '#0F3D1F' }} />}
                        </IconButton>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                    </Box>
                </Box>

                {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', fontSize: '13px' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '13px' }}>{error}</Alert>}

                {/* Infos personnelles */}
                <Typography sx={{ fontWeight: 'bold', fontSize: '13px', color: '#0F3D1F', mb: 1.5 }}>Informations personnelles</Typography>
                {field("Nom complet", "name")}
                {field("Email", "email", "email")}
                {field("Téléphone", "phone")}

                <Divider sx={{ my: 2 }} />

                {/* Adresse de livraison */}
                <Typography sx={{ fontWeight: 'bold', fontSize: '13px', color: '#0F3D1F', mb: 1.5 }}>Adresse de livraison</Typography>
                {field("Adresse", "address")}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField label="Ville" value={form.city} onChange={set('city')} size="small" fullWidth
                        sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} />
                    <TextField label="Code postal" value={form.postalCode} onChange={set('postalCode')} size="small" fullWidth
                        sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} />
                </Box>
<TextField select fullWidth label="Pays" value={form.country} onChange={set('country')} size="small"
    sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }}>
    {COUNTRIES.map(c => (
        <MuiMenuItem key={c.code} value={c.name} sx={{ fontSize: '13px' }}>{c.name}</MuiMenuItem>
    ))}
</TextField>

                <Button fullWidth variant="contained" size="large" onClick={handleSave} disabled={saving}
                    sx={{ backgroundColor: '#0F3D1F', borderRadius: '8px', py: 1.5, textTransform: 'none', fontWeight: 'bold', fontSize: '13px', '&:hover': { backgroundColor: '#0a2e15' } }}>
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
            </Paper>
        </Box>
    )
}