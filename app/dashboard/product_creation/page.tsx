"use client"
import { Box, TextField, Button, Modal, CircularProgress } from '@mui/material'
import { useState } from 'react'

export default function ProductCreation() {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [ficheTechnique, setFicheTechnique] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [imagePreview, setImagePreview] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [libraryImages, setLibraryImages] = useState<any[]>([])
    const [loadingLibrary, setLoadingLibrary] = useState(false)
    const [uploading, setUploading] = useState(false)

    const fetchLibrary = async () => {
        setLoadingLibrary(true)
        try {
            const res = await fetch('/api/upload')
            const data = await res.json()
            setLibraryImages(data.images || [])
        } catch {
            setLibraryImages([])
        } finally {
            setLoadingLibrary(false)
        }
    }

    const handleOpenModal = () => {
        setModalOpen(true)
        fetchLibrary()
    }

    const handleSelectImage = (image: any) => {
        setImageUrl(image.url)
        setImagePreview(image.url)
        setModalOpen(false)
    }

    const handleUploadFromModal = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        await fetch('/api/upload', { method: 'POST', body: formData })
        await fetchLibrary()
        setUploading(false)
    }

    const handleSubmit = async () => {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                description: description || "",
                price: parseFloat(price),
                fiche_technique: ficheTechnique || "",
                imageUrl: imageUrl || "",
                quantity: 1
            })
        })
        if (res.ok) {
            alert('Produit créé !')
        } else {
            const data = await res.json()
            console.log('Erreur:', data)
        }
    }

    return (
        <Box sx={{ 
            display: 'flex', 
            gap: '70px', 
            padding: '100px 20px 20px 100px', 
            background: `radial-gradient(circle, rgba(15, 61, 31, 0.37) 1px, transparent 1px)`,
            backgroundColor: '#ffffff',
            backgroundSize: '25px 25px',
            height: '100%' 
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(0,0,0,0.1)', width: '300px', height: 'fit-content' }}>
                <Box
                    onClick={handleOpenModal}
                    sx={{ backgroundColor: '#e0e0e0', height: '160px', borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '12px', color: '#888' }}>Choisir depuis la bibliothèque</span>
                    )}
                </Box>
                <TextField label="Titre du produit" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
                <TextField label="Montant du produit" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth size="small" />
                <TextField label="Description (optionnel)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth size="small" />
                <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '10px' }}>
                    Créer le produit
                </Button>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '50px' }}>
                <Box>
                    <Box sx={{ fontWeight: 'bold', fontSize: '16px', color: '#0F3D1F', marginBottom: '15px' }}>
                        <h3>Description techniques :</h3>
                    </Box>
                    <TextField multiline rows={4} value={ficheTechnique} onChange={(e) => setFicheTechnique(e.target.value)} sx={{ width: '70%', backgroundColor: '#ffffff', borderRadius: '8px' }} />
                </Box>
                <Box sx={{ fontSize: '14px', color: '#333' }}>
                    <p><strong>Format d'images recommandé :</strong></p>
                    <p>WebP. Le format WebP offre une meilleure qualité d'image pour un fichier plus léger.</p>
                    <br />
                    <p><strong>Formats acceptés :</strong></p>
                    <p>WebP, JPG, PNG</p>
                    <br />
                    <p><strong>Poids maximum :</strong></p>
                    <p>2 MB. Visez entre 200KB et 500KB pour un résultat optimal.</p>
                </Box>
            </Box>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '70vw', maxHeight: '80vh', overflow: 'auto', boxShadow: '0px 8px 24px rgba(0,0,0,0.2)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ color: '#0F3D1F' }}>Bibliothèque Médias</h3>
                        <Button component="label" variant="contained" disabled={uploading} sx={{ backgroundColor: '#0F3D1F', '&:hover': { backgroundColor: '#0a2a14' }, fontSize: '12px' }}>
                            {uploading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Importer'}
                            <input type="file" accept="image/*" hidden onChange={handleUploadFromModal} />
                        </Button>
                    </Box>
                    {loadingLibrary ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <CircularProgress sx={{ color: '#0F3D1F' }} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                            {libraryImages.map((image: any) => (
                                <Box key={image.key} onClick={() => handleSelectImage(image)} sx={{ borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '2px solid transparent', '&:hover': { border: '2px solid #0F3D1F' } }}>
                                    <img src={image.url} alt={image.key} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    )
}