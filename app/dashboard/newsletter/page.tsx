"use client"
import { Box, CircularProgress } from '@mui/material'
import { useEffect, useState } from 'react'

export default function NewsletterPage() {
    const [emails, setEmails] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/newsletter').then(r => r.json()).then(data => {
            setEmails(data)
            setLoading(false)
        })
    }, [])

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress sx={{ color: '#0F3D1F' }} />
        </Box>
    )

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, padding: '16px 60px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
                <h2 style={{ color: '#0F3D1F', margin: 0 }}>Newsletter ({emails.length} inscrits)</h2>
            </Box>
            <Box className="product_grid_scroll" sx={{ padding: '30px 60px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0F3D1F', color: '#fff' }}>
                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px' }}>Email</th>
                            <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px' }}>Date d'inscription</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emails.map((e: any, i: number) => (
                            <tr key={e.id} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#333' }}>{e.email}</td>
                                <td style={{ padding: '12px 20px', fontSize: '13px', color: '#888' }}>
                                    {new Date(e.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    )
}