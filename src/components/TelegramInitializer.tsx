import { useEffect } from 'react'

export function TelegramInitializer() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return
    tg.ready?.()
    tg.expand?.()
    try {
      tg.setHeaderColor?.('#000000')
      tg.setBackgroundColor?.('#000000')
      if (tg.isVersionAtLeast?.('7.7')) {
        tg.disableVerticalSwipes?.()
      }
    } catch {
      console.log('Telegram styling features not supported')
    }
    const fallbackExpand = setTimeout(() => {
      tg.expand?.()
      console.log('Telegram: Fallback expand executed.')
    }, 500)
    return () => clearTimeout(fallbackExpand)
  }, [])
  return null
}
