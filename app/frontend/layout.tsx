"use client"
import { Inter } from "next/font/google"
import Navbar from "./components/navbar"
import Footer from "./components/footer"
import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { CartProvider } from "./context/CartContext"

const inter = Inter({ subsets: ["latin"] })

export default function FrontendLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
            <CartProvider>
            <div className={inter.className} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                    {children}
                </main>
                <Footer />
            </div>
            </CartProvider>
        </SessionProvider>
    )
}