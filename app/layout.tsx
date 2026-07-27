import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Roboto_Flex } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Request Management System',
  description: 'Request Management System',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${robotoFlex.variable} bg-background`}>
        <body className="font-sans antialiased">
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}