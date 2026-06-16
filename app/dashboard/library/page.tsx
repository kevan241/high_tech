"use client"
import { Box, Button, CircularProgress, IconButton } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { useState, useEffect } from 'react'

export default function Library() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/upload')
            const data = await res.json()
            setImages(data.images || [])
        } catch (e) {
            setImages([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchImages()
    }, [])

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        await fetch('/api/upload', { method: 'POST', body: formData })
        await fetchImages()
        setUploading(false)
    }

    const handleDelete = async (key: string) => {
        if (!confirm('Supprimer cette image ?')) return
        setDeleting(key)
        await fetch('/api/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        })
        await fetchImages()
        setDeleting(null)
    }

    return (
        <Box className="library_parent" sx={{
            padding: '40px 60px',
            background: `radial-gradient(circle, rgba(15, 61, 31, 0.37) 1px, transparent 1px)`,
            backgroundColor: '#ffffff',
            backgroundSize: '25px 25px',
            minHeight: '100%',overflow:'hidden',height:'100%'
            }}>

            <Box className="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <Box sx={{ color: '#0F3D1F' }}>
                    <h2>Bibliothèque Médias</h2>
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{images?.length || 0} fichier(s)</p>
                </Box>
                <Button
                    component="label"
                    variant="contained"
                    disabled={uploading}
                    sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '12px' }}
                >
                    {uploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Importer une image'}
                    <input type="file" accept="image/*" hidden onChange={handleUpload} />
                </Button>
            </Box>
            <Box className="library_child" sx={{overflowY: 'auto',height:'500px'}}>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                    <CircularProgress sx={{ color: '#0F3D1F' }} />
                </Box>
            ) : images?.length === 0 ? (
                <Box sx={{ textAlign: 'center', marginTop: '100px', color: '#888' }}>
                    <p>Aucune image dans la bibliothèque</p>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                    {(images || []).map((image: any) => (
                        <Box key={image.key} sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'relative', '&:hover .delete-btn': { opacity: 1 },padding:'20px' }}>
                            <Box sx={{ height: '140px', overflow: 'hidden' }}>
                                <img src={image.url} alt={image.key} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>

                            {/* Bouton supprimer au hover */}
                            <IconButton
                                className="delete-btn"
                                onClick={() => handleDelete(image.key)}
                                disabled={deleting === image.key}
                                sx={{
                                    position: 'absolute', top: 6, right: 6,
                                    backgroundColor: 'rgba(0,0,0,0.55)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    padding: '4px',
                                    '&:hover': { backgroundColor: '#cc0000' }
                                }}
                            >
                                {deleting === image.key
                                    ? <CircularProgress size={16} sx={{ color: '#fff' }} />
                                    : <Delete sx={{ color: '#fff', fontSize: 18 }} />
                                }
                            </IconButton>

                            <Box sx={{ padding: '8px 10px' }}>
                                <p style={{ fontSize: '11px', color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {image.key.replace('products/', '')}
                                </p>
                                <p style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                                    {image.size ? `${Math.round(image.size / 1024)} KB` : ''}
                                </p>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
            </Box>
        </Box>
    )
}