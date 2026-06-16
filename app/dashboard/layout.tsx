"use client"
import { Box } from "@mui/material"
import { SessionProvider } from "next-auth/react"
import Header from "@/app/admin_space/header"
import Menu from "@/app/admin_space/menu"
import AIAgent from "@/app/admin_space/ai_agent"

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header />
        <Box sx={{ display: 'flex', flex: 1 }}>
          <Menu />
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0, padding: '0px' }}>
            {children}
          </Box>
        </Box>
      </Box>
      <AIAgent />
    </SessionProvider>
  )
}