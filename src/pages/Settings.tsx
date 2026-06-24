import { useState, useEffect, useCallback } from 'react'
import {
  Settings as SettingsIcon, Users, MessageSquare, Plus,
  Trash2, PenLine, Save, ToggleRight, ToggleLeft,
  Search, ChevronDown, Eye, EyeOff, Stethoscope,
  Clock, MapPin, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { AppUser, ChatTemplate, DoctorSchedule, DoctorLeave } from '../lib/supabase'

const ROLES = [
  { key: 'super_admin', label: 'Super Admin', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { key: 'admin', label: 'Admin', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'staff', label: 'Staff', color: 'bg-slate-50 text-slate-600 border-slate-200' },
]

const TEMPLATE_CATEGORIES = [
  { key: 'konfirmasi', label: 'Konfirmasi', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { key: 'batal_praktek', label: 'Batal Praktek', color: 'bg-red-50 text-red-600 border-red-200' },
  { key: 'reschedule', label: 'Reschedule', color: 'bg-amber-50 text-amber-600 border-amber-200' },
]

const PLACEHOLDERS = [
  { key: '{{nama_pasien}}', label: 'Nama Pasien', example: 'Ahmad Fauzi' },
  { key: '{{nama_dokter}}', label: 'Nama Dokter', example: 'dr. Andi Kurniawan' },
  { key: '{{nama_petugas}}', label: 'Nama Petugas', example: 'Siti Aminah' },
  { key: '{{poli}}', label: 'Poli', example: 'Poli Jantung' },
  { key: '{{tanggal}}', label: 'Tanggal', example: '20 Juni 2026' },
  { key: '{{jam}}', label: 'Jam', example: '08:00 - 12:00' },
  { key: '{{no_mr}}', label: 'No. MR', example: 'MR-2026-001' },
  { key: '{{jam_baru}}', label: 'Jam Baru', example: '10:00 - 14:00' },
]

type Tab = 'users' | 'templates' | 'doctors' | 'leaves'

export default function Settings() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Pengaturan</h1>
          <p className="text-xs text-slate-400">Kelola user, template chat, jadwal dokter, dan cuti dokter</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> Manajemen User
        </button>
        <button
          onClick={() => setTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'templates' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Chat Template
        </button>
        <button
          onClick={() => setTab('doctors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'doctors' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Jadwal Dokter
        </button>
        <button
          onClick={() => setTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            tab === 'leaves' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Cuti Dokter
        </button>
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'doctors' && <DoctorsTab />}
      {tab === 'leaves' && <LeavesTab />}
    </div>
  )
}

/* UsersTab */

function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AppUser | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('app_users').select('*').order('created_at', { ascending: false })
    if (!error && data) setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'staff', phone: '', password: '' })
    setEditing(null)
    setCreating(false)
    setShowPassword(false)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    const payload: any = { name: form.name, email: form.email, role: form.role, phone: form.phone || null }
    if (form.password.trim()) payload.password = form.password.trim()
    if (editing) {
      const { error } = await supabase.from('app_users').update(payload).eq('id', editing.id)
      if (!error) { await fetchUsers(); resetForm() }
    } else {
      if (!form.password.trim()) { setSaving(false); return }
      const { error } = await supabase.from('app_users').insert({ ...payload, password: form.password.trim() })
      if (!error) { await fetchUsers(); resetForm() }
    }
    setSaving(false)
  }

  const toggleActive = async (user: AppUser) => {
    const { error } = await supabase.from('app_users').update({ is_active: !user.is_active }).eq('id', user.id)
    if (!error) await fetchUsers()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('app_users').delete().eq('id', id)
    if (!error) await fetchUsers()
  }

  const startEdit = (u: AppUser) => {
    setForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', password: '' })
    setEditing(u)
    setCreating(false)
  }

  const startCreate = () => { resetForm(); setCreating(true) }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const roleMeta = (key: string) => ROLES.find(r => r.key === key) || ROLES[2]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari user..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all w-64" />
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {(creating || editing) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{editing ? 'Edit User' : 'User Baru'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nama</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Role</label>
              <div className="relative">
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all appearance-none bg-white">
                  {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Telepon (WhatsApp)</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="08123456789" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">{editing ? 'Password Baru (kosongkan jika tidak diganti)' : 'Password'}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.email.trim() || (!editing && !form.password.trim())} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : editing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Users className="w-12 h-12 mb-3 text-slate-300" /><p className="text-sm">Belum ada user</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-400 text-xs uppercase">
                <th className="px-4 py-3 text-left font-medium">Nama</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Telepon</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const r = roleMeta(u.role)
                return (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">{u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                        <span className="text-slate-800 font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${r.color}`}>{r.label}</span></td>
                    <td className="px-4 py-3 text-slate-500">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(u)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${u.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {u.is_active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}{u.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(u)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><PenLine className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* TemplatesTab */

function TemplatesTab() {
  const [templates, setTemplates] = useState<ChatTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<ChatTemplate | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', content: '', category: 'konfirmasi', reschedule_time: '' })
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('chat_templates').select('*').order('created_at', { ascending: false })
    if (!error && data) setTemplates(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const resetForm = () => {
    setForm({ name: '', content: '', category: 'konfirmasi', reschedule_time: '' })
    setEditing(null)
    setCreating(false)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) return
    setSaving(true)
    const payload: any = { name: form.name, content: form.content, category: form.category }
    if (form.category === 'reschedule' && form.reschedule_time.trim()) {
      payload.reschedule_time = form.reschedule_time.trim()
    }
    if (editing) {
      const { error } = await supabase.from('chat_templates').update(payload).eq('id', editing.id)
      if (!error) { await fetchTemplates(); resetForm() }
    } else {
      const { error } = await supabase.from('chat_templates').insert(payload)
      if (!error) { await fetchTemplates(); resetForm() }
    }
    setSaving(false)
  }

  const toggleActive = async (t: ChatTemplate) => {
    const { error } = await supabase.from('chat_templates').update({ is_active: !t.is_active }).eq('id', t.id)
    if (!error) await fetchTemplates()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('chat_templates').delete().eq('id', id)
    if (!error) await fetchTemplates()
  }

  const insertPlaceholder = (placeholder: string) => {
    setForm({ ...form, content: form.content + placeholder })
  }

  const startEdit = (t: ChatTemplate) => {
    setForm({ name: t.name, content: t.content, category: t.category, reschedule_time: t.reschedule_time || '' })
    setEditing(t)
    setCreating(false)
  }

  const startCreate = () => { resetForm(); setCreating(true) }

  const filtered = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const groupedByCategory = TEMPLATE_CATEGORIES.map(cat => ({
    ...cat,
    templates: filtered.filter(t => t.category === cat.key),
  })).filter(g => categoryFilter === 'all' || g.key === categoryFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari template..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all w-64" />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setCategoryFilter('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${categoryFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semua</button>
            {TEMPLATE_CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategoryFilter(c.key)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${categoryFilter === c.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{c.label}</button>
            ))}
          </div>
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Template Baru
        </button>
      </div>

      {(creating || editing) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{editing ? 'Edit Template' : 'Template Baru'}</h2>
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Nama Template</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Konfirmasi Pagi - Formal" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Kategori</label>
            <div className="relative">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all appearance-none bg-white">
                {TEMPLATE_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {form.category === 'reschedule' && (
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Jadwal/Jam Praktek Baru</label>
              <input value={form.reschedule_time} onChange={e => setForm({ ...form, reschedule_time: e.target.value })} placeholder="Contoh: 10:00 - 14:00" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
              <p className="text-[10px] text-slate-400 mt-1">Jadwal ini akan digunakan untuk placeholder {'{jam_baru}'}</p>
            </div>
          )}
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">Isi Template</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Tulis template chat..." rows={5} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all resize-none" />
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 mb-2 block">Placeholder (klik untuk sisipkan)</label>
            <div className="flex gap-2 flex-wrap">
              {PLACEHOLDERS.map(p => (
                <button key={p.key} onClick={() => insertPlaceholder(p.key)} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">{p.label}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.content.trim()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : editing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <MessageSquare className="w-12 h-12 mb-3 text-slate-300" /><p className="text-sm">Belum ada template</p><p className="text-xs mt-1">Klik "Template Baru" untuk membuat</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByCategory.map(group => (
            <div key={group.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${group.color}`}>{group.label}</span>
                <span className="text-xs text-slate-400">{group.templates.length} template</span>
              </div>
              <div className="space-y-3">
                {group.templates.map(t => (
                  <div key={t.id} className={`bg-white border rounded-xl p-4 transition-all ${t.is_active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">{t.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${t.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{t.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(t)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${t.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>{t.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                        <button onClick={() => startEdit(t)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><PenLine className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    {t.reschedule_time && (
                      <div className="mb-2 text-xs text-amber-600 font-medium">Jadwal baru: {t.reschedule_time}</div>
                    )}
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{t.content}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {PLACEHOLDERS.filter(p => t.content.includes(p.key)).map(p => (
                        <span key={p.key} className="px-2 py-0.5 bg-blue-50 text-blue-500 text-[10px] rounded-full border border-blue-100">{p.label}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* DoctorsTab */

function DoctorsTab() {
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<DoctorSchedule | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', specialty: '', session_1: '', session_2: '', room: '', is_on_leave: false, leave_note: '' })
  const [saving, setSaving] = useState(false)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('doctor_schedules').select('*').order('specialty', { ascending: true }).order('name', { ascending: true })
    if (!error && data) setDoctors(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  const resetForm = () => {
    setForm({ name: '', specialty: '', session_1: '', session_2: '', room: '', is_on_leave: false, leave_note: '' })
    setEditing(null)
    setCreating(false)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.specialty.trim()) return
    setSaving(true)
    const payload = {
      name: form.name,
      specialty: form.specialty,
      session_1: form.session_1 || null,
      session_2: form.session_2 || null,
      room: form.room || null,
      is_on_leave: form.is_on_leave,
      leave_note: form.leave_note || null,
    }
    if (editing) {
      const { error } = await supabase.from('doctor_schedules').update(payload).eq('id', editing.id)
      if (!error) { await fetchDoctors(); resetForm() }
    } else {
      const { error } = await supabase.from('doctor_schedules').insert(payload)
      if (!error) { await fetchDoctors(); resetForm() }
    }
    setSaving(false)
  }

  const toggleActive = async (doc: DoctorSchedule) => {
    const { error } = await supabase.from('doctor_schedules').update({ is_active: !doc.is_active }).eq('id', doc.id)
    if (!error) await fetchDoctors()
  }

  const toggleLeave = async (doc: DoctorSchedule) => {
    const { error } = await supabase.from('doctor_schedules').update({ is_on_leave: !doc.is_on_leave }).eq('id', doc.id)
    if (!error) await fetchDoctors()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('doctor_schedules').delete().eq('id', id)
    if (!error) await fetchDoctors()
  }

  const startEdit = (d: DoctorSchedule) => {
    setForm({
      name: d.name,
      specialty: d.specialty,
      session_1: d.session_1 || '',
      session_2: d.session_2 || '',
      room: d.room || '',
      is_on_leave: d.is_on_leave,
      leave_note: d.leave_note || '',
    })
    setEditing(d)
    setCreating(false)
  }

  const startCreate = () => { resetForm(); setCreating(true) }

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  )

  const groupedBySpecialty = [...new Set(filtered.map(d => d.specialty))].map(spec => ({
    specialty: spec,
    doctors: filtered.filter(d => d.specialty === spec),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari dokter..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all w-64" />
        </div>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Dokter
        </button>
      </div>

      {(creating || editing) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{editing ? 'Edit Dokter' : 'Dokter Baru'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nama Dokter</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="dr. Nama Dokter, Sp." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Spesialisasi</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all bg-white">
                <option value="">Pilih Spesialisasi</option>
                <option value="Dokter Umum">Dokter Umum</option>
                <option value="Spesialis Anak">Spesialis Anak</option>
                <option value="Spesialis Gigi">Spesialis Gigi</option>
                <option value="Spesialis Jantung">Spesialis Jantung</option>
                <option value="Spesialis Kulit & Kelamin">Spesialis Kulit & Kelamin</option>
                <option value="Spesialis Mata">Spesialis Mata</option>
                <option value="Spesialis Saraf">Spesialis Saraf</option>
                <option value="Spesialis THT">Spesialis THT</option>
                <option value="Spesialis Kandungan">Spesialis Kandungan</option>
                <option value="Spesialis Penyakit Dalam">Spesialis Penyakit Dalam</option>
                <option value="Spesialis Bedah">Spesialis Bedah</option>
                <option value="Spesialis Orthopedi">Spesialis Orthopedi</option>
                <option value="Spesialis Paru">Spesialis Paru</option>
                <option value="Spesialis Jiwa">Spesialis Jiwa</option>
                <option value="Spesialis Rehabilitasi Medik">Spesialis Rehabilitasi Medik</option>
                <option value="Spesialis Radiologi">Spesialis Radiologi</option>
                <option value="Spesialis Anestesi">Spesialis Anestesi</option>
                <option value="Spesialis Patologi">Spesialis Patologi</option>
                <option value="Spesialis Lainnya">Spesialis Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Sesi 1 (Pagi)</label>
              <input value={form.session_1} onChange={e => setForm({ ...form, session_1: e.target.value })} placeholder="08:00 - 12:00" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Sesi 2 (Sore)</label>
              <input value={form.session_2} onChange={e => setForm({ ...form, session_2: e.target.value })} placeholder="13:00 - 17:00" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Ruangan</label>
              <input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} placeholder="Contoh: R. 3A" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_on_leave} onChange={e => setForm({ ...form, is_on_leave: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-200" />
                <span className="text-sm text-slate-700">Sedang Cuti</span>
              </label>
            </div>
            {form.is_on_leave && (
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Keterangan Cuti</label>
                <input value={form.leave_note} onChange={e => setForm({ ...form, leave_note: e.target.value })} placeholder="Contoh: Cuti tahunan 1 minggu" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all" />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.specialty.trim()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : editing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Stethoscope className="w-12 h-12 mb-3 text-slate-300" /><p className="text-sm">Belum ada jadwal dokter</p><p className="text-xs mt-1">Klik "Tambah Dokter" untuk membuat</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dokter Umum — always at top */}
          {(() => {
            const umumDoctors = filtered.filter(d => d.specialty === 'Dokter Umum')
            if (umumDoctors.length === 0) return null
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-slate-700">Dokter Umum</span>
                  <span className="text-xs text-slate-400">{umumDoctors.length} dokter</span>
                </div>
                {/* Pagi */}
                {umumDoctors.filter(d => d.session_1).length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Dokter Umum Pagi</div>
                    <div className="space-y-3">
                      {umumDoctors.filter(d => d.session_1).map(doc => (
                        <div key={doc.id} className={`bg-white border rounded-xl p-4 transition-all ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                  {doc.is_on_leave && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                                </div>
                                {doc.is_on_leave && doc.leave_note && (
                                  <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => toggleActive(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>{doc.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                              <button onClick={() => toggleLeave(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_on_leave ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`} title="Toggle cuti"><X className="w-4 h-4" /></button>
                              <button onClick={() => startEdit(doc)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><PenLine className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Sore */}
                {umumDoctors.filter(d => d.session_2).length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Dokter Umum Sore</div>
                    <div className="space-y-3">
                      {umumDoctors.filter(d => d.session_2).map(doc => (
                        <div key={doc.id} className={`bg-white border rounded-xl p-4 transition-all ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                  {doc.is_on_leave && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                                </div>
                                {doc.is_on_leave && doc.leave_note && (
                                  <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => toggleActive(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>{doc.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                              <button onClick={() => toggleLeave(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_on_leave ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`} title="Toggle cuti"><X className="w-4 h-4" /></button>
                              <button onClick={() => startEdit(doc)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><PenLine className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
          {groupedBySpecialty.filter(g => g.specialty !== 'Dokter Umum').map(group => (
            <div key={group.specialty}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-slate-700">{group.specialty}</span>
                <span className="text-xs text-slate-400">{group.doctors.length} dokter</span>
              </div>
              <div className="space-y-3">
                {group.doctors.map(doc => (
                  <div key={doc.id} className={`bg-white border rounded-xl p-4 transition-all ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                            {doc.is_on_leave && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                          </div>
                          {doc.is_on_leave && doc.leave_note && (
                            <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>{doc.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                        <button onClick={() => toggleLeave(doc)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${doc.is_on_leave ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-slate-100'}`} title="Toggle cuti">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => startEdit(doc)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"><PenLine className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(doc.id)} className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* LeavesTab */

function LeavesTab() {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([])
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ doctor_id: '', start_date: '', end_date: '', note: '' })
  const [saving, setSaving] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const prevDays = Array.from({ length: startDayOfWeek }, (_, i) => prevMonthLastDay - startDayOfWeek + 1 + i)
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const totalSlots = prevDays.length + currentDays.length
  const nextDaysCount = (7 - (totalSlots % 7)) % 7
  const nextDays = Array.from({ length: nextDaysCount }, (_, i) => i + 1)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('doctor_leaves').select('*').order('start_date', { ascending: false })
    if (!error && data) setLeaves(data)
    setLoading(false)
  }, [])

  const fetchDoctors = useCallback(async () => {
    const { data, error } = await supabase.from('doctor_schedules').select('*').order('name', { ascending: true })
    if (!error && data) setDoctors(data)
  }, [])

  useEffect(() => {
    fetchLeaves()
    fetchDoctors()
  }, [fetchLeaves, fetchDoctors])

  const resetForm = () => {
    setForm({ doctor_id: '', start_date: '', end_date: '', note: '' })
    setCreating(false)
  }

  const handleSave = async () => {
    if (!form.doctor_id.trim() || !form.start_date.trim()) return
    const doctor = doctors.find(d => d.id === form.doctor_id)
    if (!doctor) return
    setSaving(true)
    const payload = {
      doctor_id: form.doctor_id,
      doctor_name: doctor.name,
      start_date: form.start_date,
      end_date: form.end_date || form.start_date,
      note: form.note || '',
    }
    const { error } = await supabase.from('doctor_leaves').insert(payload)
    if (!error) { await fetchLeaves(); resetForm() }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('doctor_leaves').delete().eq('id', id)
    if (!error) await fetchLeaves()
  }

  const startCreate = (dateStr?: string) => {
    resetForm()
    if (dateStr) {
      setForm({ doctor_id: '', start_date: dateStr, end_date: dateStr, note: '' })
    }
    setCreating(true)
  }

  const hasLeaveOnDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves.some(l => {
      const start = l.start_date
      const end = l.end_date || l.start_date
      return dateStr >= start && dateStr <= end
    })
  }

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-semibold text-slate-700 w-32 text-center">
            {monthNames[month]} {year}
          </div>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => startCreate()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Tambah Cuti
        </button>
      </div>

      {creating && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Tambah Cuti Dokter</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Dokter</label>
              <div className="relative">
                <select value={form.doctor_id} onChange={e => setForm({ ...form, doctor_id: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all appearance-none bg-white">
                  <option value="">Pilih dokter...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tanggal Mulai</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tanggal Selesai</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Keterangan</label>
              <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Contoh: Cuti tahunan" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all resize-none" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.doctor_id.trim() || !form.start_date.trim()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 disabled:opacity-50 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar - smaller, fixed width */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm h-fit">
              <div className="grid grid-cols-7 gap-px mb-1">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {prevDays.map((d, i) => (
                  <div key={`prev-${i}`} className="h-8 flex items-center justify-center text-xs text-slate-300 rounded-md">{d}</div>
                ))}
                {currentDays.map(d => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  const hasLeave = hasLeaveOnDate(d)
                  return (
                    <button key={d} onClick={() => startCreate(dateStr)} className="h-8 flex flex-col items-center justify-center text-xs text-slate-700 rounded-md hover:bg-slate-50 transition-all relative">
                      <span>{d}</span>
                      {hasLeave && <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
                    </button>
                  )
                })}
                {nextDays.map((d, i) => (
                  <div key={`next-${i}`} className="h-8 flex items-center justify-center text-xs text-slate-300 rounded-md">{d}</div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-2">Klik tanggal untuk buat cuti</p>
            </div>

            {/* Leave List - takes remaining space */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left font-medium">Dokter</th>
                  <th className="px-4 py-3 text-left font-medium">Tanggal Mulai</th>
                  <th className="px-4 py-3 text-left font-medium">Tanggal Selesai</th>
                  <th className="px-4 py-3 text-left font-medium">Keterangan</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">Belum ada data cuti dokter</td>
                  </tr>
                ) : (
                  leaves.map(l => (
                    <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-800 font-medium">{l.doctor_name}</td>
                      <td className="px-4 py-3 text-slate-600">{l.start_date}</td>
                      <td className="px-4 py-3 text-slate-600">{l.end_date || l.start_date}</td>
                      <td className="px-4 py-3 text-slate-600">{l.note || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(l.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
