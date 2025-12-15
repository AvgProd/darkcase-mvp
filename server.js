import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { fetchCatalogItems } from './supabase-server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'
const distPath = path.join(__dirname, 'dist')

app.get('/api/user/library', (req, res) => {
  const libraryItems = [
    { title: 'Черная икра: 1 сезон 1 серия', progress: 'Осталось 50 минут', image: '/images/black_caviar.jpg' },
    { title: 'Таргет: 1 сезон 1 серия', progress: 'Осталось 23 минуты', image: '/images/target.jpg' },
    { title: 'Qumalaq', progress: 'Осталось 38 минут', image: '/images/qumalaq.jpg' },
    { title: 'Слово пацана. Кровь на асфальте: 1 сезон 8 серия', progress: 'Осталось 57 минут', image: '/images/pacan_slovo.jpg' },
  ]
  res.json({ success: true, items: libraryItems })
})

app.get('/api/catalog', async (req, res) => {
  const items = await fetchCatalogItems()
  if (items) {
    return res.json({ success: true, items })
  }
  const fallback = [
    { id: 1, title: 'Черная икра', category: 'Сериалы', image: '/images/black_caviar.jpg' },
    { id: 2, title: 'Таргет', category: 'Сериалы', image: '/images/target.jpg' },
    { id: 3, title: 'Qumalaq', category: 'Документальные', image: '/images/qumalaq.jpg' }
  ]
  res.json({ success: true, items: fallback })
})

app.use(express.static(distPath, { index: 'index.html', extensions: ['html'] }))

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`)
})
