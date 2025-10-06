import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bitcoin DNS Portal',
  description: 'Decentralized DNS on BSV blockchain with shareholder governance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}