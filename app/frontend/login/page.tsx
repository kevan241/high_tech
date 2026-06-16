"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material"
import Link from "next/link"
import { LockOutlined } from "@mui/icons-material"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.error) { 
        setError("Email ou mot de passe incorrect")
        setLoading(false) 
    } else {
       window.location.href = "/frontend"
    }
}

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Paper elevation={3} sx={{ borderRadius: '20px', p: 4, width: '100%', maxWidth: 420 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
    <Box sx={{ backgroundColor: '#0F3D1F', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LockOutlined sx={{ color: '#fff', fontSize: 28 }} />
    </Box>
</Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0F3D1F', mb: 0.5, textAlign: 'center' }}>Connexion</Typography>
                <Typography sx={{ color: '#999', fontSize: '13px', mb: 3, textAlign: 'center' }}>Bienvenue ! Connectez-vous à votre compte</Typography>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{error}</Alert>}

                <TextField fullWidth label="Email" type="email"  value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ mb: 2, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />
                <TextField fullWidth label="Mot de passe" type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    sx={{ mb: 3, '& .MuiFormLabel-root': { fontSize: '13px' } }} size="small" />

                <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
                    sx={{ backgroundColor: '#0F3D1F',fontSize: '13px', borderRadius: '8px', py: 1.5, textTransform: 'none', fontWeight: 'bold', '&:hover': { backgroundColor: '#0a2e15' } }}>
                    {loading ? "Connexion..." : "Se connecter"}
                </Button>

                <Typography sx={{ textAlign: 'center', mt: 2, fontSize: '12px', color: '#666' }}>
                    Pas encore de compte ?{" "}
                    <Link href="/frontend/register" style={{ color: '#0F3D1F', fontWeight: 'bold' }}>S'inscrire</Link>
                </Typography>
            </Paper>
        </Box>
    )
}