"use client"
import { Box, Menu, MenuItem, InputAdornment, TextField, Badge, Avatar, Drawer, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, Person, Menu as MenuIcon, Close } from '@mui/icons-material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from "../context/CartContext"

export default function Navbar() {
    const { data: session, status } = useSession()
    const [anchorEl, setAnchorEl] = useState(null)
    const [search, setSearch] = useState('')
    const [avatar, setAvatar] = useState<string | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const router = useRouter()
    const { count } = useCart()

    useEffect(() => {
        if (status === 'authenticated') {
            fetch('/api/user/profile').then(r => r.json()).then(d => setAvatar(d.avatar))
        } else {
            setAvatar(null)
        }
    }, [status])

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && search.trim()) {
            router.push(`/frontend/products?search=${search}`)
        }
    }

    const navLinks = [
        { label: 'Accueil', href: '/frontend' },
        { label: 'Nos meilleurs ventes', href: '/frontend/page/frontend-products' },
        { label: 'Promotions', href: '/frontend/promotions' },
        { label: 'Produits récents', href: '/frontend/recent' },
        { label: 'À propos', href: '/frontend/about' },
    ]

    return (
        <Box sx={{ backgroundColor: '#0F3D1F', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: { xs: '12px 16px', md: '14px 60px' }, gap: '20px' }}>
                
                {/* Logo */}
                <Link href="/frontend" style={{ textDecoration: 'none' }}>
                    <Box sx={{ fontWeight: 'bold', color: '#fff', fontSize: { xs: '16px', md: '20px' }, whiteSpace: 'nowrap' }}>
                        High Tech 241
                    </Box>
                </Link>

                {/* Search bar - desktop only */}
                <TextField
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    size="small"
                    sx={{
                        flex: 1, maxWidth: 400,
                        display: { xs: 'none', md: 'flex' },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            fontSize: '13px',
                            '& fieldset': { border: 'none' }
                        }
                    }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Search sx={{ color: '#0F3D1F', cursor: 'pointer' }} onClick={() => search.trim() && router.push(`/frontend/products?search=${search}`)} />
                                </InputAdornment>
                            )
                        }
                    }}
                />

                {/* Right icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '16px', md: '20px' } }}>
                    <Link href="/frontend/panier">
                        <Badge badgeContent={count} color="error">
                            <ShoppingCart sx={{ color: '#fff' }} />
                        </Badge>
                    </Link>

                    {/* Desktop: account */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        {status === 'loading' ? (
                            <Person sx={{ fontSize: 22, color: '#fff', opacity: 0.5 }} />
                        ) : session ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                    onClick={(e: any) => setAnchorEl(e.currentTarget)}>
                                    <Avatar src={avatar || undefined} sx={{ width: 40, height: 40, backgroundColor: '#168039', fontSize: 13, border: '2px solid #168039' }}>
                                        {session.user?.name?.[0]?.toUpperCase()}
                                    </Avatar>
                                    <span style={{ fontSize: '13px' }}>{session.user?.name || 'Mon compte'}</span>
                                </Box>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                    <MenuItem disabled sx={{ fontSize: '13px' }}>{session.user?.email}</MenuItem>
                                    <MenuItem sx={{ fontSize: '13px' }} onClick={() => router.push('/frontend/commandes')}>Mes commandes</MenuItem>
                                    <MenuItem sx={{ fontSize: '13px' }} onClick={() => router.push('/frontend/profile')}>Mon profil</MenuItem>
                                    <MenuItem sx={{ fontSize: '13px' }} onClick={() => signOut({ callbackUrl: '/frontend' })}>Se déconnecter</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Link href="/frontend/login" style={{ textDecoration: 'none' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#fff' }}>
                                    <Person sx={{ fontSize: 22 }} />
                                    <span style={{ fontSize: '13px' }}>Connexion</span>
                                </Box>
                            </Link>
                        )}
                    </Box>

                    {/* Mobile: person icon + hamburger */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: '8px' }}>
                        {session ? (
                            <Avatar src={avatar || undefined} sx={{ width: 28, height: 28, backgroundColor: '#168039', fontSize: 12 }}
                                onClick={(e: any) => setAnchorEl(e.currentTarget)}>
                                {session.user?.name?.[0]?.toUpperCase()}
                            </Avatar>
                        ) : (
                            <Link href="/frontend/login">
                                <Person sx={{ fontSize: 22, color: '#fff' }} />
                            </Link>
                        )}
                        {session && (
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                <MenuItem disabled sx={{ fontSize: '13px' }}>{session.user?.email}</MenuItem>
                                <MenuItem sx={{ fontSize: '13px' }} onClick={() => router.push('/frontend/commandes')}>Mes commandes</MenuItem>
                                <MenuItem sx={{ fontSize: '13px' }} onClick={() => router.push('/frontend/profile')}>Mon profil</MenuItem>
                                <MenuItem sx={{ fontSize: '13px' }} onClick={() => signOut({ callbackUrl: '/frontend' })}>Se déconnecter</MenuItem>
                            </Menu>
                        )}
                        <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#fff', padding: '4px' }}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Box>

            {/* Nav links - desktop only */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: '50px', padding: '0 60px', backgroundColor: '#168039' }}>
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                        <Box sx={{ padding: '10px 16px', color: '#fff', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                            {link.label}
                        </Box>
                    </Link>
                ))}
            </Box>

            {/* Mobile Drawer */}
<Drawer
    anchor="right"
    open={drawerOpen}
    onClose={() => setDrawerOpen(false)}
    slotProps={{ paper: { sx: { width: 260, backgroundColor: '#0F3D1F', color: '#fff' } } }}
>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#fff' }}>
                        <Close />
                    </IconButton>
                </Box>

            

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                <List>
                    {navLinks.map((link) => (
                        <ListItem key={link.href} component={Link} href={link.href} onClick={() => setDrawerOpen(false)}
                            sx={{ color: '#fff', textDecoration: 'none', '&:hover': { backgroundColor: '#168039' } }}>
                            <ListItemText primary={link.label}/>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    )
}