import { useState, useEffect, useCallback } from 'react'
import { ClipboardList, Plus, Trash2, Save, X, Search, Stethoscope, Clock, MapPin, Check, XCircle, Clock2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { canCreate } from '../lib/permissions'
import type { DoctorSchedule, ConsultationRequest } from '../lib/supabase'

const STATUS_META: Record<string, { label: string; color: string; dot: string; icon: any }> = {
  pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400', icon: Clock2 },
  approved: { label: 'Disetujui', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400', icon: Check },
  rejected: { label: 'Ditolak', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400', icon: XCircle },
}

export default function ConsultationRequests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ConsultationRequest[]>([])
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientMr, setPatientMr] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedSession, setSelectedSession] = useState('1')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const role = user?.role || ''
  const canCreateReq = canCreate('consultation_requests', role)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [reqsRes, docsRes] = await Promise.all([
      supabase.from('consultation_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('doctor_schedules').select('*').eq('is_active', true).order('specialty', { ascending: true }).order('name', { ascending: true }),
    ])
    if (reqsRes.data) setRequests(reqsRes.data)
    if (docsRes.data) setDoctors(docsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!patientName.trim() || !patientMr.trim() || !selectedDoctor) return
    const doc = doctors.find(d => d.id === selectedDoctor)
    if (!doc) return
    setSaving(true)
    const { error } = await supabase.from('consultation_requests').insert({
      requester_name: user?.name || '',
      requester_role: user?.role || '',
      patient_name: patientName.trim(),
      patient_mr: patientMr.trim(),
      doctor_id: doc.id,
      doctor_name: doc.name,
      specialty: doc.specialty,
      session: selectedSession,
      note: note.trim() || null,
    })
    if (!error) {
      await fetchData()
      setCreating(false)
      setPatientName('')
      setPatientMr('')
      setSelectedDoctor('')
      setSelectedSession('1')
      setNote('')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('consultation_requests').delete().eq('id', id)
    if (!error) await fetchData()
  }

  const updateStatus = async (id: string, status: string) => {
    const update: Record<string, any> = { status, updated_at: new Date().toISOString() }
    if (status === 'approved') {
      update.approved_by_name = user?.name || ''
    }
    const { error } = await supabase.from('consultation_requests').update(update).eq('id', id)
    if (!error) await fetchData()
  }

  const filtered = requests.filter(r =>
    r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    r.patient_mr.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    r.specialty.toLowerCase().includes(search.toLowerCase()) ||
    r.requester_name.toLowerCase().includes(search.toLowerCase())
  )

  const getDoctor = (id: string) => doctors.find(d => d.id === id)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Request Konsul Dokter</h1>
            <p className="text-xs text-slate-400">Pengajuan konsul antar bagian ke dokter</p>
          </div>
        </div>
        {canCreateReq && (
          <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 active:scale-95 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Request Baru
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-4 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{requests.length}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-lg">
          <span className="text-sm font-semibold text-amber-600">{requests.filter(r => r.status === 'pending').length}</span>
          <span className="text-xs text-amber-600">Menunggu</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-lg">
          <span className="text-sm font-semibold text-emerald-600">{requests.filter(r => r.status === 'approved').length}</span>
          <span className="text-xs text-emerald-600">Disetujui</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari request..."
          className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all w-64"
        />
      </div>

      {/* Create Form */}
      {creating && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-slate-700">Request Konsul Baru</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Nama Pasien</label>
              <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Nama lengkap pasien" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">No. MR</label>
              <input value={patientMr} onChange={e => setPatientMr(e.target.value)} placeholder="MR-2026-001" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Pilih Dokter</label>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {doctors.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Tidak ada dokter aktif</p>
                ) : (
                  doctors.map(doc => {
                    const isSelected = selectedDoctor === doc.id
                    return (
                      <button key={doc.id} onClick={() => setSelectedDoctor(isSelected ? '' : doc.id)} className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${isSelected ? 'bg-teal-50' : 'hover:bg-slate-50'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                            {doc.is_on_leave && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full shrink-0">Cuti</span>}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> {doc.specialty}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Sesi</label>
              <div className="flex gap-2">
                {['1', '2'].map(s => {
                  const isSel = selectedSession === s
                  const doc = getDoctor(selectedDoctor)
                  const sess = s === '1' ? doc?.session_1 : doc?.session_2
                  return (
                    <button key={s} onClick={() => setSelectedSession(s)} disabled={!sess} className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${isSel ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>
                      Sesi {s}
                      {sess && <span className="block text-[10px] font-normal opacity-80">{sess}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Keterangan (opsional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Alasan konsul..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving || !patientName.trim() || !patientMr.trim() || !selectedDoctor} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 disabled:opacity-50 active:scale-95 transition-all">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-sm">Belum ada request konsul</p>
          <p className="text-xs mt-1">Klik "Request Baru" untuk mengajukan</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-400 text-xs uppercase">
                <th className="px-4 py-3 text-left font-medium">Pasien</th>
                <th className="px-4 py-3 text-left font-medium">Dokter</th>
                <th className="px-4 py-3 text-left font-medium">Sesi</th>
                <th className="px-4 py-3 text-left font-medium">Pengaju</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Disetujui Oleh</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS_META[r.status] || STATUS_META.pending
                return (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{r.patient_name}</p>
                        <p className="text-xs text-slate-400">{r.patient_mr}</p>
                        {r.note && <p className="text-xs text-slate-500 mt-1">{r.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{r.doctor_name}</p>
                      <p className="text-xs text-slate-400">{r.specialty}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">Sesi {r.session}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{r.requester_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{r.requester_role?.replace('_', ' ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${st.color}`}>
                        <span className={`inline-block w-2 h-2 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {r.approved_by_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(r.id, 'approved')} className="w-7 h-7 rounded-md flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-all" title="Setujui">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStatus(r.id, 'rejected')} className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-all" title="Tolak">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(r.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
