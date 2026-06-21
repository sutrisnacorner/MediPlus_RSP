import { useState, useEffect, useCallback } from 'react'
import { X as XIcon, Calendar, Stethoscope, Clock, Search, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { DoctorLeave, DoctorSchedule } from '../lib/supabase'

export default function CutiDokter() {
  const [leaves, setLeaves] = useState<DoctorLeave[]>([])
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [leavesRes, docsRes] = await Promise.all([
      supabase.from('doctor_leaves').select('*').order('start_date', { ascending: false }),
      supabase.from('doctor_schedules').select('*').eq('is_active', true),
    ])
    if (leavesRes.data) setLeaves(leavesRes.data)
    if (docsRes.data) setDoctors(docsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const isActive = (leave: DoctorLeave) => {
    const today = new Date().toISOString().split('T')[0]
    return today >= leave.start_date && today <= leave.end_date
  }

  const getDoctor = (id: string) => doctors.find(d => d.id === id)

  const filtered = leaves.filter(l => {
    const d = getDoctor(l.doctor_id)
    return (
      l.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
      (d?.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
      l.note.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <XIcon className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Cuti Dokter</h1>
          <p className="text-xs text-slate-400">Daftar jadwal cuti dokter</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{leaves.length}</span>
          <span className="text-xs text-slate-500">Total Cuti</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg">
          <span className="text-sm font-semibold text-red-600">{leaves.filter(l => isActive(l)).length}</span>
          <span className="text-xs text-red-600">Sedang Cuti</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari dokter..."
          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all w-64"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Calendar className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">Belum ada jadwal cuti</p>
          <p className="text-xs mt-1">Kelola cuti di menu Pengaturan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(l => {
            const doc = getDoctor(l.doctor_id)
            const active = isActive(l)
            return (
              <div key={l.id} className={`bg-white border rounded-xl p-4 transition-all ${active ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center shrink-0 ${active ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {l.doctor_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800">{l.doctor_name}</p>
                      {active && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Sedang Cuti
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {doc?.specialty || '-'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc?.session_1 || '-'}{doc?.session_2 ? ' / ' + doc.session_2 : ''}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{l.start_date}</span>
                      <span className="text-slate-400">sampai</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{l.end_date}</span>
                      <span className="text-slate-400 ml-1">({Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} hari)</span>
                    </div>
                    {l.note && <p className="text-xs text-slate-500 mt-2">{l.note}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
