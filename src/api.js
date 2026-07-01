const IS_DEV = import.meta.env.DEV
const API = IS_DEV ? '/api/sections' : '/data.json'

export async function getSections() {
  const res = await fetch(API)
  return res.json()
}

export async function saveAllSections(data) {
  if (!IS_DEV) throw new Error('Read-only in production')
  const res = await fetch('/api/sections', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function saveSection(key, data) {
  if (!IS_DEV) throw new Error('Read-only in production')
  const res = await fetch(`/api/sections/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function uploadImage(file) {
  if (!IS_DEV) throw new Error('Read-only in production')
  const form = new FormData()
  form.append('image', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  return res.json()
}
