"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

export type CartItem = {
    id: string
    name: string
    imageUrl: string
    price: number
    pricePromo: number | null
    promoActive: boolean
    quantity: number
    maxQty: number
}

type CartContextType = {
    items: CartItem[]
    addToCart: (product: CartItem) => void
    removeFromCart: (id: string) => void
    updateQty: (id: string, qty: number) => void
    clearCart: () => void
    total: number
    count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession()
    const [items, setItems] = useState<CartItem[]>([])

    // Charge le panier depuis la BDD quand connecté
useEffect(() => {
    if (status === 'authenticated') {
        fetch('/api/cart').then(r => r.json()).then(data => {
            if (Array.isArray(data)) setItems(data)
        })
    } else if (status === 'unauthenticated') {
        setItems([])
    }
}, [status, session?.user?.email]) // 👈 ajoute session?.user?.email

    const syncItem = async (productId: string, quantity: number) => {
        await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        })
    }

    const addToCart = (product: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id)
            let newItems
            if (existing) {
                const newQty = Math.min(existing.maxQty, existing.quantity + product.quantity)
                newItems = prev.map(i => i.id === product.id ? { ...i, quantity: newQty } : i)
                if (session) syncItem(product.id, newQty)
            } else {
                newItems = [...prev, product]
                if (session) syncItem(product.id, product.quantity)
            }
            return newItems
        })
    }

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
        if (session) fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id })
        })
    }

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) return removeFromCart(id)
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.min(i.maxQty, qty) } : i))
        if (session) syncItem(id, qty)
    }

    const clearCart = () => {
        setItems([])
        if (session) fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
    }

    const total = items.reduce((sum, i) => sum + (i.promoActive && i.pricePromo ? i.pricePromo : i.price) * i.quantity, 0)
    const count = items.reduce((sum, i) => sum + i.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used within CartProvider')
    return ctx
}