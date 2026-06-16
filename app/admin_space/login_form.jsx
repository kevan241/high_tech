"use client"
import {Box, TextField, Button, InputAdornment, IconButton} from '@mui/material'
import { useState } from 'react'
import Image from 'next/image'
import IconLogin from '../front_assets/icones/admin_icon.png'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await signIn('credentials', {
            email: username,
            password: password,
            redirect: false
        })

        if (result?.error) {
            setError('Accès refusé. Compte non autorisé ou identifiants incorrects.')
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '16px', padding: '40px 40px', backgroundColor: '#f5f5f5', borderRadius: '8px',width:'100%', maxWidth: '400px', margin: '0 auto',position:'absolute', top: '30%', left: '50%', transform: 'translate(-50%)',boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)'}}>
            <Box sx={{display:'flex', flexDirection: 'column', alignItems: 'center',color: '#0F3D1F',fontWeight: 'bold',gap: '20px'}}>
                <Box sx={{backgroundColor: '#168039', width: '50px',height: '50px',borderRadius: '10%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                    <Image src={IconLogin} alt="Admin Icon" width={35} height={35} />
                </Box>
                <Box sx={{fontSize:'20px',fontWeight:'bold'}}><h2>Bienvenue administrateur</h2></Box>
            </Box>
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
            />
            <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }
                }}
            />
            {error && <Box sx={{color: 'error.main', fontSize: '13px', textAlign: 'center'}}>{error}</Box>}
            <Button variant="contained" onClick={handleSubmit} sx={{backgroundColor: '#168039', '&:hover': {backgroundColor: '#0a2a14'}}}>
                Login
            </Button>
        </Box>
    )
}