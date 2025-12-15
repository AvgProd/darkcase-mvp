import { useEffect } from 'react'

export function TelegramInitializer() {
  useEffect(() => {
    type TelegramWebApp = {
      setHeaderColor?: (c: string) => void
      setBackgroundColor?: (c: string) => void
      isVersionAtLeast?: (v: string) => boolean
      disableVerticalSwipes?: () => void
    }
    const tg =
      (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp
    if (!tg) return
    try {
      tg.setHeaderColor?.('#000000')
      tg.setBackgroundColor?.('#000000')
      if (tg.isVersionAtLeast?.('7.7')) {
        tg.disableVerticalSwipes?.()
      }
    } catch {
      console.log('Telegram styling features not supported')
    }
    return
  }, [])
  return null
}
