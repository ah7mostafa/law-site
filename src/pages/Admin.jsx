import { useState, useEffect, useRef } from 'react'
import { getSections, saveAllSections } from '../api'

const SECTION_LABELS = {
  hero: 'القسم الرئيسي (Hero)',
  about: 'عن الشركة',
  teams: 'فريق العمل',
  services: 'الخدمات',
  why_choose_us: 'لماذا مؤثرون',
  success_partners: 'شركاء النجاح',
  testimonials: 'آراء العملاء',
  faqs: 'الأسئلة الشائعة',
  contact: 'التواصل',
  footer: 'التذييل (Footer)'
}

function Input({ label, value, onChange, multiline, maxLength }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#444' }}>{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={onChange} rows={3} maxLength={maxLength}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
      ) : (
        <input value={value || ''} onChange={onChange} maxLength={maxLength}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }} />
      )}
    </div>
  )
}

function ListEditor({ items, onChange, label, maxItems }) {
  const count = (items || []).length
  const addItem = () => onChange([...(items || []), ''])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, val) => {
    const copy = [...(items || [])]
    copy[i] = val
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>{label}{maxItems ? ` (${count}/${maxItems})` : ''}</span>
        <button onClick={addItem} disabled={maxItems && count >= maxItems} style={{ background: maxItems && count >= maxItems ? '#ccc' : '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: maxItems && count >= maxItems ? 'not-allowed' : 'pointer', fontSize: 12 }}>+ إضافة</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          <input value={item} onChange={(e) => updateItem(i, e.target.value)}
            style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'inherit' }} />
          <button onClick={() => removeItem(i)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>حذف</button>
        </div>
      ))}
    </div>
  )
}

function CardsEditor({ cards, onChange, fields }) {
  const addCard = () => {
    const obj = {}
    fields.forEach(f => obj[f.key] = '')
    onChange([...(cards || []), obj])
  }
  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i))
  const updateCard = (i, key, val) => {
    const copy = cards.map(c => ({ ...c }))
    copy[i][key] = val
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>{fields[0]?.label || 'عناصر'}</span>
        <button onClick={addCard} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}>+ إضافة</button>
      </div>
      {(cards || []).map((card, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 12, color: '#666' }}>عنصر {i + 1}</span>
            <button onClick={() => removeCard(i)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>حذف</button>
          </div>
          {fields.map(f => (
            <Input key={f.key} label={f.label} value={card[f.key]} onChange={(e) => updateCard(i, f.key, e.target.value)} multiline={f.multiline} />
          ))}
        </div>
      ))}
    </div>
  )
}

function FaqEditor({ items, onChange }) {
  const count = (items || []).length
  const addItem = () => onChange([...(items || []), { question: '', answer: '' }])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => {
    const copy = items.map(c => ({ ...c }))
    copy[i][key] = val
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>الأسئلة والأجوبة ({count}/10)</span>
        <button onClick={addItem} disabled={count >= 10} style={{ background: count >= 10 ? '#ccc' : '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: count >= 10 ? 'not-allowed' : 'pointer', fontSize: 12 }}>+ إضافة</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 12, color: '#666' }}>سؤال {i + 1}</span>
            <button onClick={() => removeItem(i)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>حذف</button>
          </div>
          <Input label="السؤال" value={item.question} onChange={(e) => updateItem(i, 'question', e.target.value)} />
          <Input label="الإجابة" value={item.answer} onChange={(e) => updateItem(i, 'answer', e.target.value)} multiline />
        </div>
      ))}
    </div>
  )
}

function FixedCardsEditor({ items, onChange, fields, count }) {
  const updateItem = (i, key, val) => {
    const copy = (items || []).map(c => ({ ...c }))
    copy[i] = { ...copy[i], [key]: val }
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginBottom: 12 }}>
        {fields[0]?.label || 'عناصر'} ({count} عناصر ثابتة)
      </div>
      {(items || Array(count).fill(null)).map((item, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#666', marginBottom: 6 }}>عنصر {i + 1}</div>
          {fields.map(f => (
            <Input key={f.key} label={f.label} value={item?.[f.key] || ''} onChange={(e) => updateItem(i, f.key, e.target.value)} multiline={f.multiline} />
          ))}
        </div>
      ))}
    </div>
  )
}

function SimpleImageUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      onChange(data.url)
    } catch (err) {
      alert('فشل رفع الصورة')
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>{label}</div>
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={value} alt="" style={{ height: 48, borderRadius: 6, border: '1px solid #ddd' }} />
          <button onClick={() => onChange('')} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>إزالة</button>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
            {uploading ? 'جاري الرفع...' : 'اختيار صورة'}
          </button>
        </div>
      )}
    </div>
  )
}

function TestimonialsEditor({ items, onChange }) {
  const addItem = () => onChange([...(items || []), { image: '', logo: '', quote: '', author: '', author_title: '' }])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, key, val) => {
    const copy = (items || []).map(c => ({ ...c }))
    copy[i] = { ...copy[i], [key]: val }
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>آراء العملاء</span>
        <button onClick={addItem} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}>+ إضافة</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 12, color: '#666' }}>رأي {i + 1}</span>
            <button onClick={() => removeItem(i)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>حذف</button>
          </div>
          <ImageUpload label="الصورة الشخصية (يمين)" value={item.image || ''} onChange={(v) => updateItem(i, 'image', v)} ratio={4/3} />
          <div style={{ marginTop: 8 }}>
            <SimpleImageUpload label="اللوجو (فوق الرأي)" value={item.logo || ''} onChange={(v) => updateItem(i, 'logo', v)} />
          </div>
          <div style={{ marginTop: 8 }}>
            <Input label="النص" value={item.quote || ''} onChange={(e) => updateItem(i, 'quote', e.target.value)} multiline maxLength={89} />
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>حد أقصى 89 حرف</div>
          </div>
          <Input label="اسم العميل" value={item.author || ''} onChange={(e) => updateItem(i, 'author', e.target.value)} maxLength={26} />
          <Input label="منصب العميل" value={item.author_title || ''} onChange={(e) => updateItem(i, 'author_title', e.target.value)} maxLength={26} />
        </div>
      ))}
    </div>
  )
}

function LogosEditor({ items, onChange }) {
  const addItem = () => onChange([...(items || []), ''])
  const removeItem = (i) => onChange(items.filter((_, idx) => idx !== i))
  const updateItem = (i, val) => {
    const copy = [...(items || [])]
    copy[i] = val
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>الشعارات</span>
        <button onClick={addItem} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}>+ إضافة</button>
      </div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ marginBottom: 12, padding: 12, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>شعار {i + 1}</span>
            <button onClick={() => removeItem(i)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>حذف</button>
          </div>
          <SimpleImageUpload
            label="رفع الشعار"
            value={item || ''}
            onChange={(v) => updateItem(i, v)}
          />
        </div>
      ))}
    </div>
  )
}

function ServicesEditor({ items, onChange }) {
  const updateItem = (i, field, val) => {
    const copy = (items || []).map(c => ({ ...c }))
    copy[i] = { ...copy[i], [field]: val }
    onChange(copy)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginBottom: 12 }}>
        الخدمات (8 خدمات ثابتة)
      </div>
      {(items || Array(8).fill(null)).map((item, i) => (
        <div key={i} style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: 600 }}>خدمة {i + 1}</div>
          <input
            value={item?.name || ''}
            onChange={(e) => updateItem(i, 'name', e.target.value)}
            placeholder="اسم الخدمة"
            style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, fontFamily: 'inherit', marginBottom: 8 }}
          />
          <ImageUpload
            label="الصورة (تظهر عند التمرير)"
            value={item?.image || ''}
            onChange={(v) => updateItem(i, 'image', v)}
            ratio={200/144}
          />
        </div>
      ))}
    </div>
  )
}

function SectionCard({ title, children, isOpen, onToggle }) {
  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 12, marginBottom: 12, overflow: 'hidden', background: '#fff' }}>
      <div onClick={onToggle} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#f8f8f8', borderBottom: isOpen ? '1px solid #e0e0e0' : 'none', userSelect: 'none' }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{title}</span>
        <span style={{ fontSize: 18, color: '#999', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>
      {isOpen && <div style={{ padding: 16 }}>{children}</div>}
    </div>
  )
}

function ImageUpload({ value, onChange, label, ratio }) {
  const [editing, setEditing] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [imageNatural, setImageNatural] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [uploading, setUploading] = useState(false)
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const fileRef = useRef(null)

  const PREVIEW_W = 480
  const RATIO = ratio || (1280 / 600)
  const PREVIEW_H = PREVIEW_W / RATIO

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setOriginalImage(ev.target.result)
      setOffset({ x: 0, y: 0 })
      setZoom(1)
      setImageNatural(null)
      setEditing(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const constrainOffset = (x, y, displayW, displayH) => ({
    x: Math.min(0, Math.max(-(displayW - PREVIEW_W), x)),
    y: Math.min(0, Math.max(-(displayH - PREVIEW_H), y))
  })

  const handleMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !imageNatural) return
    const scale = getImageScale(imageNatural.w, imageNatural.h)
    const displayW = imageNatural.w * scale * zoom
    const displayH = imageNatural.h * scale * zoom
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    setOffset(constrainOffset(newX, newY, displayW, displayH))
  }
  const handleMouseUp = () => setDragging(false)

  const handleWheel = (e) => {
    e.preventDefault()
    if (!imageNatural) return
    const oldZoom = zoom
    const newZoom = Math.max(0.3, Math.min(5, zoom - e.deltaY * 0.003))
    setZoom(newZoom)
    const scale = getImageScale(imageNatural.w, imageNatural.h)
    const oldW = imageNatural.w * scale * oldZoom
    const oldH = imageNatural.h * scale * oldZoom
    const newW = imageNatural.w * scale * newZoom
    const newH = imageNatural.h * scale * newZoom
    const dW = newW - oldW
    const dH = newH - oldH
    const centerX = -offset.x / oldW
    const centerY = -offset.y / oldH
    setOffset(constrainOffset(-centerX * newW, -centerY * newH, newW, newH))
  }

  const getImageScale = (imgW, imgH) => {
    const scaleX = PREVIEW_W / imgW
    const scaleY = PREVIEW_H / imgH
    return Math.max(scaleX, scaleY)
  }

  const handleSaveCrop = async () => {
    if (!originalImage || !imageNatural) return
    const scale = getImageScale(imageNatural.w, imageNatural.h)
    const displayW = imageNatural.w * scale * zoom
    const displayH = imageNatural.h * scale * zoom
    const sx = Math.abs(offset.x) / (scale * zoom)
    const sy = Math.abs(offset.y) / (scale * zoom)
    const sw = PREVIEW_W / (scale * zoom)
    const sh = PREVIEW_H / (scale * zoom)

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sw)
    canvas.height = Math.round(sh)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = async () => {
      ctx.drawImage(img, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh), 0, 0, Math.round(sw), Math.round(sh))
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92)
      setUploading(true)
      try {
        const res = await fetch('/api/upload-base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: croppedDataUrl })
        })
        const data = await res.json()
        onChange(data.url)
        setEditing(false)
        setOriginalImage(null)
        setImageNatural(null)
      } catch {
        alert('فشل رفع الصورة')
      }
      setUploading(false)
    }
    img.src = originalImage
  }

  const handleCancel = () => {
    setEditing(false)
    setOriginalImage(null)
    setImageNatural(null)
  }

  const initCrop = () => {
    if (!imageRef.current) return
    const nw = imageRef.current.naturalWidth
    const nh = imageRef.current.naturalHeight
    if (!nw || !nh) return
    setImageNatural({ w: nw, h: nh })
    const scale = getImageScale(nw, nh)
    const displayW = nw * scale * zoom
    const displayH = nh * scale * zoom
    setOffset(constrainOffset(-(displayW - PREVIEW_W) / 2, -(displayH - PREVIEW_H) / 2, displayW, displayH))
  }

  if (editing) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#444' }}>{label}</label>

        <div ref={containerRef} style={{ position: 'relative', width: PREVIEW_W, marginBottom: 8, userSelect: 'none' }}
          onWheel={handleWheel}>
          {/* Full image */}
          <img ref={imageRef} src={originalImage} draggable={false}
            style={{
              width: '100%', display: 'block', borderRadius: 8, pointerEvents: 'none',
              transform: `scale(${zoom})`, transformOrigin: '0 0',
              position: 'relative', left: offset.x, top: offset.y,
              maxWidth: 'none'
            }}
            onLoad={initCrop}
          />

          {/* Dark overlay */}
          {imageNatural && (() => {
            const scale = getImageScale(imageNatural.w, imageNatural.h)
            const displayW = imageNatural.w * scale * zoom
            const displayH = imageNatural.h * scale * zoom
            const ox = offset.x, oy = offset.y
            const l = Math.max(0, -ox)
            const t = Math.max(0, -oy)
            const rClip = Math.max(0, ox + displayW - PREVIEW_W)
            const bClip = Math.max(0, oy + displayH - PREVIEW_H)
            return (
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: t, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: bClip, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', top: t, bottom: bClip, left: 0, width: l, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', top: t, bottom: bClip, right: 0, width: rClip, background: 'rgba(0,0,0,0.55)' }} />
                <div style={{ position: 'absolute', left: l, top: t, width: PREVIEW_W, height: PREVIEW_H, border: '2px solid #fff', boxSizing: 'border-box' }} />
              </div>
            )
          })()}

          {/* Drag handle */}
          {imageNatural && (
            <div style={{
              position: 'absolute',
              left: Math.max(0, -offset.x), top: Math.max(0, -offset.y),
              width: PREVIEW_W, height: PREVIEW_H,
              cursor: dragging ? 'grabbing' : 'grab'
            }}
              onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            />
          )}
        </div>

        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
          اسحب داخل الإطار الأبيض لتحريك الصورة · عجلة الماوس للتكبير والتصغير · المنطقة المظلمة هي اللي هتتقص
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSaveCrop} disabled={uploading}
            style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {uploading ? 'جاري الرفع...' : '💾 حفظ'}
          </button>
          <button onClick={handleCancel}
            style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}>
            إلغاء
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13, color: '#444' }}>{label}</label>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      <div onClick={() => fileRef.current.click()}
        style={{
          border: '2px dashed #ddd', borderRadius: 8, padding: 12, textAlign: 'center', cursor: 'pointer',
          background: value ? '#f5f5f5' : '#fff', minHeight: 120,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
        {value ? (
          <img src={value} style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 4, objectFit: 'contain' }} />
        ) : (
          <span style={{ color: '#999', fontSize: 14 }}>+ اضغط لاختيار صورة</span>
        )}
      </div>
      {value && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={() => { fileRef.current.click() }}
            style={{ background: '#eee', color: '#555', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 12 }}>
            تغيير الصورة
          </button>
          <button onClick={() => onChange('')}
            style={{ background: 'transparent', color: '#e74c3c', border: 'none', cursor: 'pointer', fontSize: 12 }}>
            🗑 حذف
          </button>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const [data, setData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSections()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const update = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const updateList = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }))
  }

  const updateCards = (section, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], cards: value }
    }))
  }

  const updateFaqs = (value) => {
    setData(prev => ({
      ...prev,
      faqs: { ...prev.faqs, items: value }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      await saveAllSections(data)
      setMsg('✅ تم الحفظ بنجاح')
    } catch {
      setMsg('❌ فشل الحفظ')
    }
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleUpload = async (e, section, field) => {
    const file = e.target.files[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      update(section, field, json.url)
    } catch {
      alert('فشل رفع الصورة')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, fontFamily: 'Cairo' }}>جاري التحميل...</div>

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo', background: '#f4f4f4', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#222', margin: 0 }}>لوحة التحكم</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <a href="/" target="_blank" style={{ color: '#222', fontSize: 14, textDecoration: 'underline' }}>عرض الموقع</a>
            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? '#999' : '#222', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              {saving ? 'جاري الحفظ...' : '💾 حفظ الكل'}
            </button>
          </div>
        </div>

        {msg && <div style={{ textAlign: 'center', padding: 10, borderRadius: 8, marginBottom: 16, fontWeight: 600, background: msg.includes('✅') ? '#d4edda' : '#f8d7da', color: msg.includes('✅') ? '#155724' : '#721c24' }}>{msg}</div>}

        {!data && <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>⚠️ لم يتم تحميل البيانات. تأكد من تشغيل السيرفر.</div>}

        {data && Object.keys(data).map(sectionKey => (
          <SectionCard key={sectionKey} title={SECTION_LABELS[sectionKey] || sectionKey} isOpen={openSections[sectionKey]} onToggle={() => toggleSection(sectionKey)}>
            {sectionKey === 'hero' && (
              <>
                <ImageUpload label="صورة الهيرو (2880×1600)" value={data.hero?.image} onChange={(v) => update('hero', 'image', v)} ratio={2880/1600} />
                <div style={{ marginTop: 8 }}>
                  <SimpleImageUpload label="أيقونة التبويب (Favicon)" value={data.hero?.favicon || ''} onChange={(v) => update('hero', 'favicon', v)} />
                </div>
                <Input label="وسام (Badge)" value={data.hero?.badge} onChange={(e) => update('hero', 'badge', e.target.value)} />
                <Input label="العنوان الرئيسي" value={data.hero?.title} onChange={(e) => update('hero', 'title', e.target.value)} multiline />
                <Input label="الوصف" value={data.hero?.description} onChange={(e) => update('hero', 'description', e.target.value)} multiline />
                <Input label="زر (استشارة مجانية)" value={data.hero?.btn_free} onChange={(e) => update('hero', 'btn_free', e.target.value)} />
                <Input label="زر (احجز استشارة)" value={data.hero?.btn_book} onChange={(e) => update('hero', 'btn_book', e.target.value)} />
                <Input label="نص الإثبات الاجتماعي" value={data.hero?.social_proof} onChange={(e) => update('hero', 'social_proof', e.target.value)} />
              </>
            )}

            {sectionKey === 'about' && (
              <>
                <ImageUpload label="صورة القسم" value={data.about?.image} onChange={(v) => update('about', 'image', v)} />
                <Input label="العنوان" value={data.about?.title} onChange={(e) => update('about', 'title', e.target.value)} />
                <Input label="النص الأول" value={data.about?.text1} onChange={(e) => update('about', 'text1', e.target.value)} multiline />
                <Input label="النص الثاني" value={data.about?.text2} onChange={(e) => update('about', 'text2', e.target.value)} multiline />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginBottom: 8 }}>العناصر (4 عناصر)</div>
                  {[0, 1, 2, 3].map(i => {
                    const card = (data.about?.stats || [])[i] || {}
                    const updateCard = (key, val) => {
                      const copy = (data.about?.stats || []).map(c => ({ ...c }))
                      while (copy.length < 4) copy.push({ value: '', label: '' })
                      copy[i] = { ...copy[i], [key]: val }
                      updateList('about', 'stats', copy)
                    }
                    return (
                      <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: '#666', marginBottom: 6 }}>عنصر {i + 1}</div>
                        <Input label="القيمة (مثال: +500)" value={card.value || ''} onChange={(e) => updateCard('value', e.target.value)} />
                        <Input label="التسمية" value={card.label || ''} onChange={(e) => updateCard('label', e.target.value)} />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {sectionKey === 'teams' && (
              <>
                <Input label="العنوان" value={data.teams?.title} onChange={(e) => update('teams', 'title', e.target.value)} multiline />
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#444' }}>أعضاء الفريق</span>
                    <button onClick={() => {
                      const copy = (data.teams?.members || []).map(c => ({ ...c }))
                      copy.push({ name: '', title: '', image: '' })
                      updateList('teams', 'members', copy)
                    }} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 10px', cursor: 'pointer', fontSize: 12 }}>+ إضافة</button>
                  </div>
                  {(data.teams?.members || []).map((member, i) => (
                    <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: '#666' }}>موظف {i + 1}</span>
                        <button onClick={() => {
                          const copy = (data.teams?.members || []).filter((_, idx) => idx !== i)
                          updateList('teams', 'members', copy)
                        }} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>حذف</button>
                      </div>
                      <Input label="الاسم" value={member.name || ''} onChange={(e) => {
                        const copy = (data.teams?.members || []).map(c => ({ ...c }))
                        copy[i] = { ...copy[i], name: e.target.value }
                        updateList('teams', 'members', copy)
                      }} />
                      <Input label="المسمى الوظيفي" value={member.title || ''} onChange={(e) => {
                        const copy = (data.teams?.members || []).map(c => ({ ...c }))
                        copy[i] = { ...copy[i], title: e.target.value }
                        updateList('teams', 'members', copy)
                      }} />
                      <ImageUpload label="الصورة الشخصية (مربعة)" ratio={1} value={member.image || ''} onChange={(url) => {
                        const copy = (data.teams?.members || []).map(c => ({ ...c }))
                        copy[i] = { ...copy[i], image: url }
                        updateList('teams', 'members', copy)
                      }} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {sectionKey === 'services' && (
              <>
                <Input label="وسام (Badge)" value={data.services?.badge} onChange={(e) => update('services', 'badge', e.target.value)} />
                <Input label="العنوان" value={data.services?.title} onChange={(e) => update('services', 'title', e.target.value)} />
                <ServicesEditor items={data.services?.items} onChange={(v) => update('services', 'items', v)} />
              </>
            )}

            {sectionKey === 'why_choose_us' && (
              <>
                <Input label="وسام (Badge)" value={data.why_choose_us?.badge} onChange={(e) => update('why_choose_us', 'badge', e.target.value)} />
                <Input label="العنوان" value={data.why_choose_us?.title} onChange={(e) => update('why_choose_us', 'title', e.target.value)} />
                <FixedCardsEditor items={data.why_choose_us?.cards} onChange={(v) => updateCards('why_choose_us', v)} fields={[
                  { key: 'title', label: 'العنوان' },
                  { key: 'text', label: 'النص', multiline: true }
                ]} count={6} />
              </>
            )}

            {sectionKey === 'success_partners' && (
              <>
                <Input label="وسام (Badge)" value={data.success_partners?.badge} onChange={(e) => update('success_partners', 'badge', e.target.value)} />
                <Input label="العنوان" value={data.success_partners?.title} onChange={(e) => update('success_partners', 'title', e.target.value)} />
                <LogosEditor items={data.success_partners?.logos} onChange={(v) => update('success_partners', 'logos', v)} />
              </>
            )}

            {sectionKey === 'testimonials' && (
              <TestimonialsEditor items={data.testimonials} onChange={(v) => setData(prev => ({ ...prev, testimonials: v }))} />
            )}

            {sectionKey === 'faqs' && (
              <>
                <Input label="وسام (Badge)" value={data.faqs?.badge} onChange={(e) => update('faqs', 'badge', e.target.value)} />
                <Input label="العنوان" value={data.faqs?.title} onChange={(e) => update('faqs', 'title', e.target.value)} />
                <Input label="الوصف" value={data.faqs?.description} onChange={(e) => update('faqs', 'description', e.target.value)} multiline />
                <FaqEditor items={data.faqs?.items} onChange={updateFaqs} />
              </>
            )}

            {sectionKey === 'contact' && (
              <>
                <Input label="رابط واتساب" value={data.contact?.whatsapp_link} onChange={(e) => update('contact', 'whatsapp_link', e.target.value)} />
                <Input label="رقم الهاتف" value={data.contact?.whatsapp_number} onChange={(e) => update('contact', 'whatsapp_number', e.target.value)} />
              </>
            )}

            {sectionKey === 'footer' && (
              <>
                <Input label="عنوان البانر" value={data.footer?.banner_title} onChange={(e) => update('footer', 'banner_title', e.target.value)} />
                <Input label="نص البانر" value={data.footer?.banner_text} onChange={(e) => update('footer', 'banner_text', e.target.value)} multiline maxLength={129} />
                <Input label="زر البانر" value={data.footer?.banner_btn} onChange={(e) => update('footer', 'banner_btn', e.target.value)} />
                <Input label="البريد الإلكتروني" value={data.footer?.contact_email} onChange={(e) => update('footer', 'contact_email', e.target.value)} />
                <Input label="رقم الهاتف" value={data.footer?.contact_phone} onChange={(e) => update('footer', 'contact_phone', e.target.value)} />
                <Input label="تسمية التواصل" value={data.footer?.contact_label} onChange={(e) => update('footer', 'contact_label', e.target.value)} />
                <Input label="عنوان الخدمات" value={data.footer?.services_title} onChange={(e) => update('footer', 'services_title', e.target.value)} />
                <Input label="عنوان الروابط السريعة" value={data.footer?.quick_links_title} onChange={(e) => update('footer', 'quick_links_title', e.target.value)} />
                <ListEditor label="الروابط السريعة" items={data.footer?.quick_links} onChange={(v) => updateList('footer', 'quick_links', v)} maxItems={5} />
                <div style={{ marginTop: 8 }}>
                  <SimpleImageUpload label="لوجو الفوتر" value={data.footer?.logo || ''} onChange={(v) => update('footer', 'logo', v)} />
                </div>
                <Input label="نص الشعار" value={data.footer?.logo_text} onChange={(e) => update('footer', 'logo_text', e.target.value)} multiline />
                <Input label="حقوق النشر" value={data.footer?.copyright} onChange={(e) => update('footer', 'copyright', e.target.value)} />
                <div style={{ fontWeight: 600, fontSize: 13, color: '#444', marginTop: 16, marginBottom: 8 }}>روابط السوشيال ميديا</div>
                <Input label="Facebook" value={data.footer?.social_links?.facebook || ''} onChange={(e) => update('footer', 'social_links', { ...data.footer?.social_links, facebook: e.target.value })} />
                <Input label="Instagram" value={data.footer?.social_links?.instagram || ''} onChange={(e) => update('footer', 'social_links', { ...data.footer?.social_links, instagram: e.target.value })} />
                <Input label="WhatsApp" value={data.footer?.social_links?.whatsapp || ''} onChange={(e) => update('footer', 'social_links', { ...data.footer?.social_links, whatsapp: e.target.value })} />
                <Input label="LinkedIn" value={data.footer?.social_links?.linkedin || ''} onChange={(e) => update('footer', 'social_links', { ...data.footer?.social_links, linkedin: e.target.value })} />
                <Input label="Youtube" value={data.footer?.social_links?.youtube || ''} onChange={(e) => update('footer', 'social_links', { ...data.footer?.social_links, youtube: e.target.value })} />
              </>
            )}
          </SectionCard>
        ))}
      </div>
    </div>
  )
}
