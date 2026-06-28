import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'data.json')
const UPLOADS_DIR = join(__dirname, 'uploads')

if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, `${uuidv4()}.${ext}`)
  }
})
const upload = multer({ storage })

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(UPLOADS_DIR))

function readData() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

app.get('/api/sections', (req, res) => {
  const data = readData()
  res.json(data)
})

app.put('/api/sections', (req, res) => {
  const data = req.body
  writeData(data)
  res.json({ success: true })
})

app.put('/api/sections/:section', (req, res) => {
  const data = readData()
  data[req.params.section] = req.body
  writeData(data)
  res.json({ success: true })
})

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  res.json({ url: `/uploads/${req.file.filename}` })
})

app.post('/api/upload-base64', express.json({ limit: '10mb' }), (req, res) => {
  const { image } = req.body
  if (!image) return res.status(400).json({ error: 'No image data' })
  const matches = image.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) return res.status(400).json({ error: 'Invalid image data' })
  const ext = matches[1]
  const data = Buffer.from(matches[2], 'base64')
  const filename = `${uuidv4()}.${ext}`
  writeFileSync(join(UPLOADS_DIR, filename), data)
  res.json({ url: `/uploads/${filename}` })
})

// In production, serve the built frontend
const distPath = join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.use((req, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
