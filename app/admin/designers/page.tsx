'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/admin/AuthProvider'
import { DataTable, Column } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

type Template = {
  id: number
  name: string
  description: string | null
  dxfFilePath: string
  createdAt: string
  _count: { products: number }
}

export default function AdminDesignersPage() {
  const { authHeader } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', dxfFilePath: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/designers', { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setTemplates(d.templates); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uploadDxf = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'dxf')
    const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeader(), body: fd })
    const data = await res.json()
    if (data.url) setForm((f) => ({ ...f, dxfFilePath: data.url }))
  }

  const create = async () => {
    setSaving(true)
    await fetch('/api/admin/designers', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        zoneConfig: {
          zones: [{ id: 'line1', insertX: 100, insertY: 100, layerName: 'TEXT', height: 10 }]
        },
      }),
    })
    setShowCreate(false)
    setForm({ name: '', description: '', dxfFilePath: '' })
    load()
    setSaving(false)
  }

  const deleteTemplate = async (id: number) => {
    if (!confirm('Delete this DXF template?')) return
    const res = await fetch(`/api/admin/designers/${id}`, { method: 'DELETE', headers: authHeader() })
    if (res.ok) load()
    else {
      const d = await res.json()
      alert(d.error)
    }
  }

  const columns: Column<Template>[] = [
    {
      key: 'name',
      header: 'Template',
      render: (t) => (
        <div>
          <p className="font-bold text-white">{t.name}</p>
          {t.description && <p className="text-brand-steel text-xs">{t.description}</p>}
        </div>
      ),
    },
    {
      key: 'file',
      header: 'File',
      render: (t) => <span className="text-brand-steel font-mono text-xs">{t.dxfFilePath}</span>,
    },
    {
      key: 'products',
      header: 'Products',
      render: (t) => <span className="text-white">{t._count.products}</span>,
    },
    {
      key: 'date',
      header: 'Added',
      render: (t) => <span className="text-brand-steel text-sm">{new Date(t.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <Button variant="danger" size="sm" onClick={() => deleteTemplate(t.id)}>Delete</Button>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">DXF TEMPLATES</h1>
          <p className="text-brand-steel text-sm">Manage design file templates for production</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Template</Button>
      </div>

      <DataTable
        columns={columns}
        data={templates}
        keyExtractor={(t) => t.id}
        loading={loading}
        emptyMessage="No DXF templates yet."
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New DXF Template">
        <div className="flex flex-col gap-4">
          <Input label="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <div>
            <label className="text-sm font-semibold text-brand-steel-light tracking-wider uppercase block mb-2">DXF File</label>
            <label className="cursor-pointer inline-flex items-center gap-2 border border-dashed border-brand-steel-dark rounded px-4 py-3 text-brand-steel hover:border-brand-yellow hover:text-brand-yellow transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload .dxf file
              <input type="file" accept=".dxf" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadDxf(file)
              }} />
            </label>
            {form.dxfFilePath && (
              <p className="text-green-400 text-sm mt-2">✓ {form.dxfFilePath}</p>
            )}
          </div>

          <p className="text-brand-steel text-xs">
            After creating, configure the text zone coordinates (x, y positions) by editing the template.
          </p>

          <Button loading={saving} onClick={create} disabled={!form.name}>
            Create Template
          </Button>
        </div>
      </Modal>
    </div>
  )
}
