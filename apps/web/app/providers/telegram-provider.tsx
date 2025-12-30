'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { initDataRaw, initData, themeParams, viewport } from '@telegram-apps/sdk'

interface TelegramContextType {
  initData: any
  themeParams: any
  viewport: any
  isReady: boolean
}

const TelegramContext = createContext<TelegramContextType | null>(null)

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [telegramData, setTelegramData] = useState<TelegramContextType>({
    initData: null,
    themeParams: null,
    viewport: null,
    isReady: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Initialize Telegram WebApp SDK
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.ready()
        tg.expand()

        setTelegramData({
          initData: tg.initData || null,
          themeParams: tg.themeParams || null,
          viewport: tg.viewportStableHeight || null,
          isReady: true,
        })

        // Apply theme colors
        if (tg.themeParams) {
          document.documentElement.style.setProperty(
            '--tg-theme-bg-color',
            tg.themeParams.bg_color || '#ffffff'
          )
          document.documentElement.style.setProperty(
            '--tg-theme-text-color',
            tg.themeParams.text_color || '#000000'
          )
          document.documentElement.style.setProperty(
            '--tg-theme-button-color',
            tg.themeParams.button_color || '#2481cc'
          )
          document.documentElement.style.setProperty(
            '--tg-theme-button-text-color',
            tg.themeParams.button_text_color || '#ffffff'
          )
        }
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <TelegramContext.Provider value={telegramData}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  const context = useContext(TelegramContext)
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider')
  }
  return context
}

