import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, Save, PenLine, StickyNote,
  Palette, Search, Check, ArrowLeft
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Note } from '../lib/supabase'

const NOTE_COLORS = [
  { key: 'white', bg: 'bg-white', border: 'border-slate-200', accent: 'bg-slate-400', label: 'Putih', preview: 'bg-slate-100' },
  { key: 'red', bg: 'bg-note-red', border: 'border-note-red-accent/30', accent: 'bg-note-red-accent', label: 'Merah', preview: 'bg-note-red-accent' },
  { key: 'yellow', bg: 'bg-note-yellow', border: 'border-note-yellow-accent/30', accent: 'bg-note-yellow-accent', label: 'Kuning', preview: 'bg-note-yellow-accent' },
  { key: 'green', bg: 'bg-note-green', border: 'border-note-green-accent/30', accent: 'bg-note-green-accent', label: 'Hijau', preview: 'bg-note-green-accent' },
  { key: 'blue', bg: 'bg-note-blue', border: 'border-note-blue-accent/30', accent: 'bg-note-blue-accent', label: 'Biru', preview: 'bg-note-blue-accent' },
  { key: 'purple', bg: 'bg-note-purple', border: 'border-note-purple-accent/30', accent: 'bg-note-purple-accent', label: 'Ungu', preview: 'bg-note-purple-accent' },
  { key: 'orange', bg: 'bg-note-orange', border: 'border-note-orange-accent/30', accent: 'bg-note-orange-accent', label: 'Oranye', preview: 'bg-note-orange-accent' },
  { key: 'pink', bg: 'bg-note-pink', border: 'border-note-pink-accent/30', accent: 'bg-note-pink-accent', label: 'Pink', preview: 'bg-note-pink-accent' },
]

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Note | null>(null)
  const [creating, setCreating] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formColor, setFormColor] = useState('yellow')
  const [saving, setSaving] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (!error && data) setNotes(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const resetForm = () => {
    setFormTitle('')
    setFormContent('')
    setFormColor('yellow')
    setEditing(null)
    setCreating(false)
  }

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) return
    setSaving(true)
    if (editing) {
      const { error } = await supabase
        .from('notes')
        .update({ title: formTitle, content: formContent, color: formColor, updated_at: new Date().toISOString() })
        .eq('id', editing.id)
      if (!error) {
        await fetchNotes()
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('notes')
        .insert({ title: formTitle, content: formContent, color: formColor })
      if (!error) {
        await fetchNotes()
        resetForm()
      }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (!error) await fetchNotes()
  }

  const startEdit = (note: Note) => {
    setFormTitle(note.title)
    setFormContent(note.content)
    setFormColor(note.color)
    setEditing(note)
    setCreating(false)
  }

  const startCreate = () => {
    resetForm()
    setCreating(true)
  }

  const filteredNotes = notes.filter(
    n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  )

  const isFormOpen = creating || editing !== null

  const colorMeta = (key: string) => NOTE_COLORS.find(c => c.key === key) || NOTE_COLORS[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <StickyNote className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notes</h1>
          <p className="text-xs text-slate-400">Catatan pribadi Anda</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all w-64"
            />
          </div>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-sm shadow-amber-200"
          >
            <Plus className="w-4 h-4" />
            Catatan Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{notes.length}</span>
          <span className="text-xs text-slate-500">Total Catatan</span>
        </div>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-slate-700">
              {editing ? 'Edit Catatan' : 'Catatan Baru'}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Judul</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="Masukkan judul..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Isi</label>
              <textarea
                value={formContent}
                onChange={e => setFormContent(e.target.value)}
                placeholder="Tulis catatan Anda..."
                rows={5}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Warna
              </label>
              <div className="flex gap-2 flex-wrap">
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setFormColor(c.key)}
                    className={`w-8 h-8 rounded-full ${c.preview} border-2 transition-all flex items-center justify-center ${
                      formColor === c.key ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    title={c.label}
                  >
                    {formColor === c.key && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formTitle.trim() || !formContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : editing ? 'Perbarui' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <StickyNote className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">Belum ada catatan</p>
          <p className="text-xs mt-1">Klik "Catatan Baru" untuk membuat</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredNotes.map(note => {
            const c = colorMeta(note.color)
            return (
              <div
                key={note.id}
                className={`relative group ${c.bg} border ${c.border} rounded-xl p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                onClick={() => startEdit(note)}
              >
                {/* Top color bar */}
                <div className={`absolute top-0 left-4 right-4 h-1 rounded-b-full ${c.accent}`} />

                <div className="flex items-start justify-between mb-2 mt-2">
                  <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 pr-2">{note.title}</h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); startEdit(note) }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-all"
                    >
                      <PenLine className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white/60 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed mb-3">{note.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${c.preview}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
