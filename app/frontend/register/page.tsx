"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material"
import Link from "next/link"
import { PersonAddOutlined } from "@mui/icons-material"

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))

    const handleSubmit = async () => {
        if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas"); return }
        setLoading(true); setError("")

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password })
        })

        if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur"); setLoading(false); return }

        await signIn("credentials", { email: form.email, password: form.password, redirect: false })
        router.push("/frontend")
    }

    return (
        <Box sx={{  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
            <Paper elevation={3} sx={{ borderRadius: '20px', p: 4, width: '100%', maxWidth: 420 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
    <Box sx={{ backgroundColor: '#0F3D1F', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PersonAddOutlined sx={{ color: '#fff', fontSize: 28 }} />
    </Box>
</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F3D1F', mb: 0.5, textAlign: 'center' }}>Créer un compte</Typography>
                <Typography sx={{ color: '#999', fontSize: '13px', mb: 3, textAlign: 'center' }}>Rejoignez-nous en quelques secondes</Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

                <TextField fullWidth label="Nom complet" value={form.name} onChange={set('name')} sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small"  />
                <TextField fullWidth label="Email" type="email" value={form.email} onChange={set('email')} sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />
                <TextField fullWidth label="Téléphone" value={form.phone} onChange={set('phone')} sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />
                <TextField fullWidth label="Mot de passe" type="password" value={form.password} onChange={set('password')} sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />
                <TextField fullWidth label="Confirmer le mot de passe" type="password" value={form.confirm} onChange={set('confirm')} sx={{ mb: 3, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />

                <Button fullWidth variant="contained"  size="large" onClick={handleSubmit} disabled={loading}
                    sx={{ backgroundColor: '#0F3D1F',fontSize: '13px', borderRadius: '8px', py: 1.5, textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#0a2e15' } }}>
                    {loading ? "Création..." : "Créer mon compte"}
                </Button>

                <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '12px', color: '#666' }}>
                    Déjà un compte ?{" "}
                    <Link href="/frontend/login" style={{ color: '#0F3D1F', fontWeight: 'bold' }}>Se connecter</Link>
                </Typography>
            </Paper>
        </Box>
    )
}