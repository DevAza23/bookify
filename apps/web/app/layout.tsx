import type { Metadata } from 'next'
import './globals.css'
import { TelegramProvider } from './providers/telegram-provider'

export const metadata: Metadata = {
  title: 'Telegram Events',
  description: 'Event registration platform for Telegram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TelegramProvider>{children}</TelegramProvider>
      </body>
    </html>
  )
}

