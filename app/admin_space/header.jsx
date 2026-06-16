"use client"
import {Box, Menu, MenuItem} from '@mui/material'
import { useState } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import User from '../front_assets/icones/user.png'
import Notification from '../front_assets/icones/notification.png'

export default function Header() {
    const { data: session } = useSession()
    const [anchorEl, setAnchorEl] = useState(null)

    return (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 50px', backgroundColor: '#0F3D1F', color: '#fff'}}>
            <Box sx={{fontWeight: 'bold'}}>
                <h1>High Tech 241 Admin</h1>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                {session && (
                    <>
                        <Box sx={{cursor: 'pointer'}} onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <Image src={User} alt="User" width={24} height={24} />
                        </Box>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem disabled>{session.user?.email}</MenuItem>
                            <MenuItem onClick={() => signOut({ callbackUrl: '/' })}>Se déconnecter</MenuItem>
                        </Menu>
                        <Box>
                            <Image src={Notification} alt="Notification" width={24} height={24} />
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    )
}