export default function Footer() {
    return (
        <div style={{ backgroundColor: '#0F3D1F', padding: '50px 0px 20px 0px', justifyContent: 'space-around', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '90px', marginBottom: '40px' }}>
                <div>
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>A propos de High Tech 241</p>
                    {['Plan du site', 'Qui sommes nous ?', 'Nos nouveautés', 'Carrières', 'Publicité'].map(item => (
                        <p key={item} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer' }}>{item}</p>
                    ))}
                </div>
                <div>
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Informations légales</p>
                    {["Conditions générales d'utilisations", 'Politique de confidentialités', 'Gestion des cookies'].map(item => (
                        <p key={item} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer' }}>{item}</p>
                    ))}
                </div>
                <div>
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Foire aux questions</p>
                    {['Aide', 'Politique de livraison', 'Politique de réservation de produits', 'Politique de retour de produits'].map(item => (
                        <p key={item} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer' }}>{item}</p>
                    ))}
                </div>
                <div>
                    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>Liens utiles</p>
                    {['Contactez nous', 'Nos occasions'].map(item => (
                        <p key={item} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 8px', cursor: 'pointer' }}>{item}</p>
                    ))}
                </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', textAlign: 'center', width: '100%' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: '0 0 4px', fontWeight: 'bold' }}>Made by Novus</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>All right reserved by High Tech 241</p>
            </div>
        </div>
    )
}