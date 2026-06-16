"use client"
import {Box} from '@mui/material'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DashboardIcon from '../front_assets/icones/dashboard_hover.png'
import GestionProduits from '../front_assets/icones/gestion_produits_hover.png'
import CreationProduits from '../front_assets/icones/cree_produits_hover.png'
import GestionCommandes from '../front_assets/icones/commande_hover.png'
import GestionCategories from '../front_assets/icones/categories_hover.png'
import BibliothequeIcon from '../front_assets/icones/bibliotheque_hover.png'
import NewsletterIcon from '../front_assets/icones/newsletter_hover.png'
import HeroConfigIcon from '../front_assets/icones/website_hover.png'
import DashboardIconFocus from '../front_assets/icones/dashboard.png'
import GestionProduitsFocus from '../front_assets/icones/gestion_produits.png'
import CreationProduitsFocus from '../front_assets/icones/cree_produits.png'
import GestionCommandesFocus from '../front_assets/icones/commande.png'
import BibliothequeIconFocus from '../front_assets/icones/bibliotheque.png'
import GestionCategoriesFocus from '../front_assets/icones/categories.png'
import HeroConfigIconFocus from '../front_assets/icones/website.png'
import NewsletterIconFocus from '../front_assets/icones/newsletter.png'

export default function Menu() {
    const pathname = usePathname()

    const menuStyle = (path) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        backgroundColor: pathname === path ? '#0f3d1f8e' : 'transparent',
        color: pathname === path ? '#fff' : '#0f3d1f',
        padding: '8px 12px',
        borderRadius: '5px',
        textDecoration: 'none'
    })

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px', backgroundColor: '#F8F8F8', color: '#0F3D1F', height: '100vh', paddingTop: '30px'}}>
            <Box className="admin_menu_title" sx={{color:'#0F3D1F', fontWeight:'bold', marginBottom: '30px'}}><h2>Gestionaire du site</h2></Box>
            <Link href="/dashboard" style={menuStyle('/dashboard')}>
                <Image src={pathname === '/dashboard' ? DashboardIconFocus : DashboardIcon} alt="Dashboard" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Tableau de bord</span>
            </Link>
            <Link href="/dashboard/product_gestion" style={menuStyle('/dashboard/product_gestion')}>
                <Image src={pathname === '/dashboard/product_gestion' ? GestionProduitsFocus : GestionProduits} alt="Gestion Produits" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Gestion des produits</span>
            </Link>
            <Link href="/dashboard/product_creation" style={menuStyle('/dashboard/product_creation')}>
                <Image src={pathname === '/dashboard/product_creation' ? CreationProduitsFocus : CreationProduits} alt="Création Produits" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Création de produits</span>
            </Link>
            <Link href="/dashboard/product_order" style={menuStyle('/dashboard/product_order')}>
                <Image src={pathname === '/dashboard/product_order' ? GestionCommandesFocus : GestionCommandes} alt="Gestion Commandes" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Gestion des commandes</span>
            </Link>
            <Link href="/dashboard/product_category" style={menuStyle('/dashboard/product_category')}>
                <Image src={pathname === '/dashboard/product_category' ? GestionCategoriesFocus : GestionCategories} alt="Gestion Catégories" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Gestion des catégories</span>
            </Link>
            <Link href="/dashboard/library" style={menuStyle('/dashboard/library')}>
                <Image src={pathname === '/dashboard/library' ? BibliothequeIconFocus : BibliothequeIcon} alt="Bibliothèque" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Bibliothèque</span>
            </Link>
            <Link href="/dashboard/hero_config" style={menuStyle('/dashboard/hero_config')}>
                <Image src={pathname === '/dashboard/hero_config' ? HeroConfigIconFocus : HeroConfigIcon} alt="Configuration Hero" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Configuration Hero</span>
            </Link>
            <Link href="/dashboard/newsletter" style={menuStyle('/dashboard/newsletter')}>
                <Image src={pathname === '/dashboard/newsletter' ? NewsletterIconFocus : NewsletterIcon} alt="Newsletter" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Newsletter</span>
            </Link>
            <Link href="/dashboard/store_pages" style={menuStyle('/dashboard/store_pages')}>
                <Image src={pathname === '/dashboard/store_pages' ? HeroConfigIconFocus : HeroConfigIcon} alt="Pages du site" width={20} height={20} />
                <span style={{fontSize:'14px'}}>Pages du site</span>
            </Link>

        </Box>
    )
}