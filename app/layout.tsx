import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import Script from "next/script";

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF Annotator",
  description: "Annotate and draw on PDF documents with ease",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased bg-gray-50">
        <Script
          src="/nutrient-viewer.js"
          // Load before the page becomes interactive to reference `window.NutrientViewer` in the client.
          strategy="beforeInteractive"
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
