import { useEffect } from 'react'

export function TelegramInitializer() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
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
