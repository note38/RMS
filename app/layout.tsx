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
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

// Global post-sign-in destination — /sync routes by role (admins to
// /dashboard, requesters to /request-form). Applies to any flow that
// doesn't pass an explicit redirect, e.g. the Google OAuth callback.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/sync"
      signUpFallbackRedirectUrl="/sync"
    >
      <html lang="en" className={`${robotoFlex.variable} bg-background`} suppressHydrationWarning>
        <body className="font-sans antialiased" suppressHydrationWarning>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
