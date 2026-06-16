import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import AIAgent from "@/app/admin_space/ai_agent"
import Providers from "./providers"
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "High Tech 241",
  description: "Votre boutique tech au Gabon",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AppRouterCacheProvider>
          <Providers>
            {children}
            <AIAgent />
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}