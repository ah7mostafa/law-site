const API = '/api/sections'

export async function getSections() {
  const res = await fetch(API)
  return res.json()
}

export async function saveAllSections(data) {
  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function saveSection(key, data) {
  const res = await fetch(`${API}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function uploadImage(file) {
  const form = new FormData()
  form.append('image', file)
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  return res.json()
}
