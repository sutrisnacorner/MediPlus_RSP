import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, MapPin, ChevronDown, Plus, User, MessageCircle, X, Phone, Send, Copy, Check, LogIn, Printer, CheckSquare, Square, Eye, MessageSquare, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { canEdit, canSend, canPrint } from '../lib/permissions'
import type { ChatTemplate, Patient, DoctorSchedule } from '../lib/supabase'

const PATIENT_STATUSES = [
  { key: 'menunggu', label: 'Sudah di WA', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  { key: 'belum_jawab', label: 'Belum Jawab', color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  { key: 'jadi_datang', label: 'Jadi Datang', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400' },
  { key: 'batal', label: 'Batal', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-400' },
  { key: 'reschedule', label: 'Reschedule', color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
]

const TEMPLATE_CATEGORIES = [
  { key: 'konfirmasi', label: 'Konfirmasi', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { key: 'batal_praktek', label: 'Batal Praktek', color: 'bg-red-50 text-red-600 border-red-200' },
  { key: 'reschedule', label: 'Reschedule', color: 'bg-orange-50 text-orange-600 border-orange-200' },
]

const PAPER_SIZES = [
  { label: 'A4', width: '210mm', height: '297mm' },
  { label: 'A5', width: '148mm', height: '210mm' },
  { label: 'Letter', width: '216mm', height: '279mm' },
  { label: 'Legal', width: '216mm', height: '356mm' },
  { label: 'Custom', width: '', height: '' },
]

export default function JadwalDokter() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [expanded, setExpanded] = useState<number[]>([])
  const [templates, setTemplates] = useState<ChatTemplate[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientsLoading, setPatientsLoading] = useState(true)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const [statusDropdownPos, setStatusDropdownPos] = useState({ top: 0, left: 0 })
  const [search, setSearch] = useState('')
  // Print
  const [printOpen, setPrintOpen] = useState(false)
  const [printStep, setPrintStep] = useState<'select' | 'preview'>('select')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [paperSize, setPaperSize] = useState('A4')
  const [customW, setCustomW] = useState('')
  const [customH, setCustomH] = useState('')
  const [printMode, setPrintMode] = useState<'with_patients' | 'doctors_only'>('with_patients')
  const [printSession, setPrintSession] = useState<'all' | '1' | '2'>('all')
  // Chat
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const chatSub = useRef<any>(null)

  const role = user?.role || ''
  const canEditPatient = canEdit('patient_status', role)
  const canSendWA = canSend('whatsapp', role)
  const canPrintJD = canPrint('jadwal_dokter', role)

  const fetchData = useCallback(async () => {
    const [tplsRes, schedsRes, ptsRes] = await Promise.all([
      supabase.from('chat_templates').select('*').eq('is_active', true),
      supabase.from('doctor_schedules').select('*').eq('is_active', true).order('specialty', { ascending: true }).order('name', { ascending: true }),
      supabase.from('patients').select('*').order('created_at', { ascending: true }),
    ])
    if (tplsRes.data) setTemplates(tplsRes.data)
    if (schedsRes.data) {
      setSchedules(schedsRes.data)
      const specs = [...new Set(schedsRes.data.map(s => s.specialty))]
      setSpecialties(specs)
    }
    if (ptsRes.data) setPatients(ptsRes.data)
    setPatientsLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Chat realtime
  useEffect(() => {
    const setup = async () => {
      const { data } = await supabase.from('staff_messages').select('*').order('created_at', { ascending: true }).limit(100)
      if (data) setMessages(data)
      chatSub.current = supabase.channel('staff_messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_messages' }, payload => {
        setMessages(prev => [...prev, payload.new])
      }).subscribe()
    }
    setup()
    return () => { chatSub.current?.unsubscribe() }
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, chatOpen])

  const sendChat = async () => {
    if (!chatInput.trim() || !user) return
    await supabase.from('staff_messages').insert({
      sender_id: user.id,
      sender_name: user.name,
      content: chatInput.trim(),
    })
    setChatInput('')
  }

  const toggle = (idx: number) => {
    setExpanded(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
  }

  const openWhatsapp = (patient: Patient, doctor: any) => {
    if (!canSendWA) return
    setSelectedPatient(patient)
    setSelectedDoctor(doctor)
    setWhatsappOpen(true)
    setSelectedCategory('')
    setSelectedTemplate('')
    setGeneratedMessage('')
    setCopied(false)
    setRescheduleTime('')
  }

  const generateMessage = () => {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template || !user || !selectedPatient || !selectedDoctor) return
    const date = selectedPatient.appointment_date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    let msg = template.content
    msg = msg.replace(/{{nama_pasien}}/g, selectedPatient.name)
    msg = msg.replace(/{{nama_dokter}}/g, selectedDoctor.name)
    msg = msg.replace(/{{nama_petugas}}/g, user.name)
    msg = msg.replace(/{{poli}}/g, selectedDoctor.specialty || '')
    msg = msg.replace(/{{tanggal}}/g, date)
    msg = msg.replace(/{{jam}}/g, selectedPatient.appointment_time || '')
    msg = msg.replace(/{{no_mr}}/g, selectedPatient.mr_no || '')
    msg = msg.replace(/{{jam_baru}}/g, rescheduleTime || template.reschedule_time || '')
    setGeneratedMessage(msg)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsApp = () => {
    const phone = selectedPatient?.phone?.replace(/[^0-9]/g, '')
    if (!phone) return
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(generatedMessage)}`
    window.open(url, '_blank')
  }

  const updatePatientStatus = async (patientId: string, newStatus: string) => {
    const { error } = await supabase.from('patients').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', patientId)
    if (!error) await fetchData()
    setStatusDropdown(null)
  }

  const openStatusDropdown = (patientId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setStatusDropdownPos({ top: rect.bottom + 4, left: rect.left })
    setStatusDropdown(patientId)
  }

  const templatesByCategory = (cat: string) => templates.filter(t => t.category === cat)
  const statusMeta = (key: string) => PATIENT_STATUSES.find(s => s.key === key) || PATIENT_STATUSES[0]
  const getPatientsForDoctor = (doctorName: string) => patients.filter(p => p.doctor_name === doctorName)

  const parseSessionStart = (sessionStr: string | null) => {
    if (!sessionStr) return null
    const match = sessionStr.match(/(\d{1,2})[:.]?(\d{2})?/)
    if (!match) return null
    return parseInt(match[1], 10)
  }

  // Print
  const openPrint = () => {
    setPrintOpen(true)
    setPrintStep('select')
    setSelectedDocs(schedules.filter(s => !s.is_on_leave).map(s => s.id))
    setPrintMode('with_patients')
    setPrintSession('all')
  }
  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }
  const selectAllDocs = () => {
    const all = schedules.map(s => s.id)
    setSelectedDocs(selectedDocs.length === all.length ? [] : all)
  }
  const goToPreview = () => setPrintStep('preview')
  const goToSelect = () => setPrintStep('select')

  const getPaperDim = () => {
    const paper = PAPER_SIZES.find(p => p.label === paperSize) || PAPER_SIZES[0]
    const w = paperSize === 'Custom' && customW ? customW : paper.width
    const h = paperSize === 'Custom' && customH ? customH : paper.height
    return { w, h }
  }

  const buildPrintHTML = () => {
    const { w, h } = getPaperDim()
    let printDocs = schedules.filter(s => selectedDocs.includes(s.id))
    if (printMode === 'doctors_only') {
      if (printSession !== 'all') {
        printDocs = printDocs.filter(doc => {
          const sessionStr = printSession === '1' ? doc.session_1 : doc.session_2
          const hour = parseSessionStart(sessionStr)
          if (hour === null) return false
          return printSession === '1' ? hour < 12 : hour >= 12
        })
      }
    }
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const rows = printDocs.map(doc => {
      const docPatients = getPatientsForDoctor(doc.name)
      const patientsHtml = docPatients.length === 0 ? '<p style="color:#94a3b8;font-size:12px;margin:0;">Tidak ada pasien</p>' :
        docPatients.map((p, i) => {
          const st = statusMeta(p.status)
          const stColor = st.key === 'jadi_datang' ? '#059669' : st.key === 'batal' ? '#dc2626' : st.key === 'reschedule' ? '#ea580c' : st.key === 'belum_jawab' ? '#64748b' : '#d97706'
          return `<tr>
            <td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;">${i + 1}</td>
            <td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;">${p.mr_no}</td>
            <td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;">${p.name}</td>
            <td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;">${p.phone}</td>
            <td style="border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;color:${stColor};font-weight:600;">${st.label}</td>
          </tr>`
        }).join('')
      const leaveBadge = doc.is_on_leave ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;margin-left:8px;">CUTI</span>` : ''
      const leaveNote = doc.is_on_leave ? `<p style="color:#dc2626;font-size:11px;margin:4px 0 0 0;">Keterangan: ${doc.leave_note || 'Dokter sedang cuti'}</p>` : ''
      const patientTable = printMode === 'doctors_only' ? '' :
        `<div style="padding:10px 14px;">
          ${docPatients.length === 0 ? patientsHtml : `<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#f8fafc;">
              <th style="border:1px solid #e2e8f0;padding:6px 10px;font-size:10px;text-align:left;color:#94a3b8;font-weight:600;text-transform:uppercase;">No</th>
              <th style="border:1px solid #e2e8f0;padding:6px 10px;font-size:10px;text-align:left;color:#94a3b8;font-weight:600;text-transform:uppercase;">No. MR</th>
              <th style="border:1px solid #e2e8f0;padding:6px 10px;font-size:10px;text-align:left;color:#94a3b8;font-weight:600;text-transform:uppercase;">Nama</th>
              <th style="border:1px solid #e2e8f0;padding:6px 10px;font-size:10px;text-align:left;color:#94a3b8;font-weight:600;text-transform:uppercase;">Telepon</th>
              <th style="border:1px solid #e2e8f0;padding:6px 10px;font-size:10px;text-align:left;color:#94a3b8;font-weight:600;text-transform:uppercase;">Status</th>
            </tr></thead>
            <tbody>${patientsHtml}</tbody>
          </table>`}
        </div>`
      return `<div style="margin-bottom:20px;break-inside:avoid;">
        <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          <div style="background:#f8fafc;padding:10px 14px;border-bottom:1px solid #e2e8f0;">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:32px;height:32px;border-radius:50%;background:#fef3c7;color:#b45309;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">
                ${doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p style="font-size:13px;font-weight:600;margin:0;color:#1e293b;">${doc.name}${leaveBadge}</p>
                <p style="font-size:11px;color:#64748b;margin:0;">${doc.specialty} · ${doc.session_1 || '-'}${doc.session_2 ? ' / ' + doc.session_2 : ''} · ${doc.room || '-'}</p>
                ${leaveNote}
              </div>
            </div>
          </div>
          ${patientTable}
        </div>
      </div>`
    }).join('')
    return `<!DOCTYPE html>
<html><head><title>Jadwal Dokter - ${dateStr}</title><style>
      @page { size: ${w} ${h}; margin: 10mm; }
      body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 10mm; color: #334155; }
    </style></head><body>
      <div style="text-align:center;margin-bottom:16px;">
        <h2 style="font-size:16px;font-weight:700;margin:0;color:#1e293b;">MedPlus</h2>
        <p style="font-size:12px;color:#64748b;margin:4px 0 0 0;">Jadwal Dokter & Daftar Pasien</p>
        <p style="font-size:11px;color:#94a3b8;margin:2px 0 0 0;">${dateStr}</p>
      </div>
      ${rows}
      <div style="margin-top:20px;padding-top:12px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="font-size:10px;color:#94a3b8;margin:0;">Dicetak oleh ${user?.name || 'Sistem'} · ${new Date().toLocaleString('id-ID')}</p>
      </div>
    </body></html>`
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(buildPrintHTML())
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => printWindow.print(), 300)
    setPrintOpen(false)
  }

  const searchQuery = search.toLowerCase()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Jadwal Dokter</h1>
          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">Hari Ini</span>
        </div>
        {canPrintJD && (
          <button onClick={openPrint} className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all shadow-sm">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-6">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{specialties.length}</span>
          <span className="text-xs text-slate-500">Spesialisasi</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{schedules.length}</span>
          <span className="text-xs text-slate-500">Dokter</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg">
          <span className="text-sm font-semibold text-slate-800">{patients.length}</span>
          <span className="text-xs text-slate-500">Pasien</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari pasien, No. MR, dokter, atau spesialisasi..."
          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
        />
      </div>

      {/* Specialties */}
      {patientsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dokter Umum — always at top */}
          {(() => {
            const umumDoctors = schedules.filter(s => s.specialty === 'Dokter Umum' && s.is_active)
            if (umumDoctors.length === 0) return null
            return (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => toggle(999)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded.includes(999) ? '' : '-rotate-90'}`} />
                  <span className="font-semibold text-sm text-slate-800">Dokter Umum</span>
                  <span className="text-xs text-slate-400">{umumDoctors.length} dokter</span>
                </button>
                {expanded.includes(999) && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Pagi */}
                    {umumDoctors.filter(d => d.session_1).length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Dokter Umum Pagi</div>
                        <div className="space-y-3">
                          {umumDoctors.filter(d => d.session_1).map((doc, di) => {
                            const docPatients = getPatientsForDoctor(doc.name)
                            return (
                              <div key={`umum-pagi-${di}`} className={`border rounded-lg ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-3 px-4 py-3">
                                  <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                      {doc.is_on_leave && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                                    </div>
                                    {doc.is_on_leave && doc.leave_note && (
                                      <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <User className="w-3 h-3" />
                                    <span>{docPatients.length}</span>
                                  </div>
                                </div>
                                {docPatients.length > 0 && (
                                  <div className="px-4 pb-3">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                      <span>📋</span> Daftar Antrean Pasien Reguler
                                    </div>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead className="bg-slate-50">
                                          <tr className="text-slate-400 text-[10px] uppercase">
                                            <th className="px-3 py-2 text-left font-medium">No</th>
                                            <th className="px-3 py-2 text-left font-medium">No. MR</th>
                                            <th className="px-3 py-2 text-left font-medium">Nama Pasien</th>
                                            <th className="px-3 py-2 text-left font-medium">Telepon</th>
                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                            <th className="px-3 py-2 text-left font-medium">Aksi</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {docPatients.map((p, pi) => {
                                            const s = statusMeta(p.status)
                                            return (
                                              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-2 text-slate-600">{String(pi + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-slate-600 font-medium">{p.mr_no}</td>
                                                <td className="px-3 py-2 text-slate-800 font-medium">{p.name}</td>
                                                <td className="px-3 py-2 text-slate-500">
                                                  <button onClick={() => openWhatsapp(p, { ...doc, specialty: 'Dokter Umum' })} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
                                                    <Phone className="w-3 h-3" /> {p.phone}
                                                  </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <button onClick={(e) => canEditPatient ? openStatusDropdown(p.id, e) : undefined} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${s.color}`}>
                                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`} /> {s.label}
                                                    {canEditPatient && <ChevronDown className="w-3 h-3" />}
                                                  </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <button onClick={() => openWhatsapp(p, { ...doc, specialty: 'Dokter Umum' })} disabled={!canSendWA} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50" title="Kirim WhatsApp">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {/* Sore */}
                    {umumDoctors.filter(d => d.session_2).length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Dokter Umum Sore</div>
                        <div className="space-y-3">
                          {umumDoctors.filter(d => d.session_2).map((doc, di) => {
                            const docPatients = getPatientsForDoctor(doc.name)
                            return (
                              <div key={`umum-sore-${di}`} className={`border rounded-lg ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                                <div className="flex items-center gap-3 px-4 py-3">
                                  <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                      {doc.is_on_leave && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                                    </div>
                                    {doc.is_on_leave && doc.leave_note && (
                                      <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <User className="w-3 h-3" />
                                    <span>{docPatients.length}</span>
                                  </div>
                                </div>
                                {docPatients.length > 0 && (
                                  <div className="px-4 pb-3">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                      <span>📋</span> Daftar Antrean Pasien Reguler
                                    </div>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead className="bg-slate-50">
                                          <tr className="text-slate-400 text-[10px] uppercase">
                                            <th className="px-3 py-2 text-left font-medium">No</th>
                                            <th className="px-3 py-2 text-left font-medium">No. MR</th>
                                            <th className="px-3 py-2 text-left font-medium">Nama Pasien</th>
                                            <th className="px-3 py-2 text-left font-medium">Telepon</th>
                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                            <th className="px-3 py-2 text-left font-medium">Aksi</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {docPatients.map((p, pi) => {
                                            const s = statusMeta(p.status)
                                            return (
                                              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="px-3 py-2 text-slate-600">{String(pi + 1).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-slate-600 font-medium">{p.mr_no}</td>
                                                <td className="px-3 py-2 text-slate-800 font-medium">{p.name}</td>
                                                <td className="px-3 py-2 text-slate-500">
                                                  <button onClick={() => openWhatsapp(p, { ...doc, specialty: 'Dokter Umum' })} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
                                                    <Phone className="w-3 h-3" /> {p.phone}
                                                  </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <button onClick={(e) => canEditPatient ? openStatusDropdown(p.id, e) : undefined} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${s.color}`}>
                                                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`} /> {s.label}
                                                    {canEditPatient && <ChevronDown className="w-3 h-3" />}
                                                  </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <button onClick={() => openWhatsapp(p, { ...doc, specialty: 'Dokter Umum' })} disabled={!canSendWA} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50" title="Kirim WhatsApp">
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            )
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
          {specialties.map((specName, si) => {
            const isOpen = expanded.includes(si)
            const specDoctors = schedules.filter(s => s.specialty === specName)
            const filteredDocs = specDoctors.filter(doc => {
              const docPatients = getPatientsForDoctor(doc.name)
              if (!searchQuery) return true
              if (specName.toLowerCase().includes(searchQuery)) return true
              if (doc.name.toLowerCase().includes(searchQuery)) return true
              return docPatients.some(p =>
                p.name.toLowerCase().includes(searchQuery) ||
                (p.mr_no || '').toLowerCase().includes(searchQuery)
              )
            })
            if (filteredDocs.length === 0) return null
            return (
              <div key={si} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button onClick={() => toggle(si)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                  <span className="font-semibold text-sm text-slate-800">{specName}</span>
                  <span className="text-xs text-slate-400">{filteredDocs.length} dokter</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3">
                    {filteredDocs.map((doc, di) => {
                      const docPatients = getPatientsForDoctor(doc.name)
                      return (
                        <div key={di} className={`border rounded-lg ${doc.is_on_leave ? 'border-red-200 bg-red-50/30' : 'border-slate-100'}`}>
                          {/* Doctor header */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            <div className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${doc.is_on_leave ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {doc.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                                {doc.is_on_leave && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full border border-red-200">CUTI</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {doc.room || '-'}</span>
                              </div>
                              {doc.is_on_leave && doc.leave_note && (
                                <p className="text-[10px] text-red-500 mt-1">{doc.leave_note}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <User className="w-3 h-3" />
                              <span>{docPatients.length}</span>
                            </div>
                            {canEditPatient && (
                              <button className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors opacity-50 cursor-not-allowed" title="Tambah pasien dinonaktifkan">
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {/* Patient table */}
                          {docPatients.length > 0 && (
                            <div className="px-4 pb-3">
                              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>📋</span>
                                Daftar Antrean Pasien Reguler
                              </div>
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-50">
                                    <tr className="text-slate-400 text-[10px] uppercase">
                                      <th className="px-3 py-2 text-left font-medium">No</th>
                                      <th className="px-3 py-2 text-left font-medium">No. MR</th>
                                      <th className="px-3 py-2 text-left font-medium">Nama Pasien</th>
                                      <th className="px-3 py-2 text-left font-medium">Telepon</th>
                                      <th className="px-3 py-2 text-left font-medium">Status</th>
                                      <th className="px-3 py-2 text-left font-medium">Aksi</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {docPatients.map((p, pi) => {
                                      const s = statusMeta(p.status)
                                      return (
                                        <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                                          <td className="px-3 py-2 text-slate-600">{String(pi + 1).padStart(2, '0')}</td>
                                          <td className="px-3 py-2 text-slate-600 font-medium">{p.mr_no}</td>
                                          <td className="px-3 py-2 text-slate-800 font-medium">{p.name}</td>
                                          <td className="px-3 py-2 text-slate-500">
                                            <button onClick={() => openWhatsapp(p, { ...doc, specialty: specName })} className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors">
                                              <Phone className="w-3 h-3" /> {p.phone}
                                            </button>
                                          </td>
                                          <td className="px-3 py-2">
                                            <button onClick={(e) => canEditPatient ? openStatusDropdown(p.id, e) : undefined} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${s.color}`}>
                                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.dot}`} />
                                              {s.label}
                                              {canEditPatient && <ChevronDown className="w-3 h-3" />}
                                            </button>
                                          </td>
                                          <td className="px-3 py-2">
                                            <button onClick={() => openWhatsapp(p, { ...doc, specialty: specName })} disabled={!canSendWA} className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all disabled:opacity-50" title="Kirim WhatsApp">
                                              <MessageCircle className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Global Status Dropdown */}
      {statusDropdown && canEditPatient && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setStatusDropdown(null)} />
          <div className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-xl w-44 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150" style={{ top: statusDropdownPos.top, left: statusDropdownPos.left }}>
            {PATIENT_STATUSES.map(st => (
              <button key={st.key} onClick={() => updatePatientStatus(statusDropdown, st.key)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center gap-3">
                <span className={`inline-block w-3 h-3 rounded-full ${st.dot}`} />{st.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Print Dialog */}
      {printOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <Printer className="w-4 h-4 text-slate-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Print Jadwal Dokter</h2>
              </div>
              <button onClick={() => setPrintOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-200 px-5 py-2">
                <button onClick={goToSelect} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${printStep === 'select' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>1. Pilih Dokter & Kertas</button>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <button onClick={goToPreview} disabled={selectedDocs.length === 0} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${printStep === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-50'}`}>2. Preview</button>
              </div>
              {printStep === 'select' && (
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Mode Cetak</label>
                    <div className="flex gap-2">
                      <button onClick={() => setPrintMode('with_patients')} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${printMode === 'with_patients' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        Dengan Daftar Pasien
                      </button>
                      <button onClick={() => setPrintMode('doctors_only')} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${printMode === 'doctors_only' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                        Hanya Dokter Praktek
                      </button>
                    </div>
                  </div>
                  {printMode === 'doctors_only' && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-2 block">Sesi</label>
                      <div className="flex gap-2">
                        <button onClick={() => setPrintSession('all')} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${printSession === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                          Semua
                        </button>
                        <button onClick={() => setPrintSession('1')} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${printSession === '1' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                          Sesi 1
                        </button>
                        <button onClick={() => setPrintSession('2')} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${printSession === '2' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                          Sesi 2
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-slate-500">Pilih Dokter</label>
                      <button onClick={selectAllDocs} className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                        {selectedDocs.length === schedules.length ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                        {selectedDocs.length === schedules.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {schedules.map(doc => (
                        <button key={doc.id} onClick={() => toggleDoc(doc.id)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left">
                          {selectedDocs.includes(doc.id) ? <CheckSquare className="w-4 h-4 text-blue-500 shrink-0" /> : <Square className="w-4 h-4 text-slate-300 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400">{doc.specialty} · {doc.session_1 || '-'}{doc.session_2 ? ' / ' + doc.session_2 : ''}</p>
                          </div>
                          {doc.is_on_leave && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full shrink-0">Cuti</span>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{selectedDocs.length} dokter dipilih</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-2 block">Ukuran Kertas</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAPER_SIZES.map(p => (
                        <button key={p.label} onClick={() => setPaperSize(p.label)} className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${paperSize === p.label ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {paperSize === 'Custom' && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 mb-1 block">Lebar (mm)</label>
                        <input value={customW} onChange={e => setCustomW(e.target.value)} placeholder="210" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] text-slate-400 mb-1 block">Tinggi (mm)</label>
                        <input value={customH} onChange={e => setCustomH(e.target.value)} placeholder="297" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all" />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button onClick={goToPreview} disabled={selectedDocs.length === 0} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 active:scale-95 transition-all">
                      <Eye className="w-4 h-4" /> Lihat Preview
                    </button>
                  </div>
                </div>
              )}
              {printStep === 'preview' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 bg-slate-100 p-4 overflow-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mx-auto" style={{ maxWidth: paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : paperSize === 'Letter' ? '216mm' : paperSize === 'Legal' ? '216mm' : customW ? customW + 'mm' : '210mm' }}>
                      <div className="p-4">
                        <iframe srcDoc={buildPrintHTML()} className="w-full border-0" style={{ height: '500px' }} />
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
                    <button onClick={goToSelect} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all">Kembali</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition-all">
                      <Printer className="w-4 h-4" /> Print Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Popup */}
      {whatsappOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Kirim WhatsApp</h2>
              </div>
              <button onClick={() => setWhatsappOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-amber-700 mb-2">Silakan masuk untuk mengirim pesan WhatsApp</p>
                  <a href="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 active:scale-95 transition-all">
                    <LogIn className="w-4 h-4" /> Masuk
                  </a>
                </div>
              )}
              {user && (
                <>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Kepada</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedPatient?.name}</p>
                    <p className="text-xs text-slate-500">{selectedPatient?.phone} · {selectedPatient?.mr_no}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">{user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <p className="text-xs text-slate-500">Petugas</p>
                      <p className="text-sm font-medium text-slate-800">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    {TEMPLATE_CATEGORIES.map(cat => {
                      const count = templatesByCategory(cat.key).length
                      const isActive = selectedCategory === cat.key
                      return (
                        <button key={cat.key} onClick={() => { setSelectedCategory(isActive ? '' : cat.key); setSelectedTemplate(''); setGeneratedMessage(''); setRescheduleTime('') }} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                          <span className={`inline-block w-2 h-2 rounded-full ${cat.key === 'konfirmasi' ? 'bg-emerald-400' : cat.key === 'batal_praktek' ? 'bg-red-400' : 'bg-orange-400'}`} />
                          {cat.label}
                          <span className="text-[10px] text-slate-400">({count})</span>
                        </button>
                      )
                    })}
                  </div>
                  {selectedCategory && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {templatesByCategory(selectedCategory).length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">Tidak ada template</p>
                      ) : (
                        <div className="space-y-2">
                          {templatesByCategory(selectedCategory).map(t => {
                            const isSelected = selectedTemplate === t.id
                            return (
                              <button key={t.id} onClick={() => { setSelectedTemplate(isSelected ? '' : t.id); setGeneratedMessage('') }} className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${isSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-slate-800">{t.name}</span>
                                  {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{t.content}</p>
                                {t.reschedule_time && <p className="text-[10px] text-amber-600 mt-1">Jadwal: {t.reschedule_time}</p>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedCategory === 'reschedule' && selectedTemplate && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Jadwal/Jam Praktek Baru</label>
                      <input value={rescheduleTime} onChange={e => { setRescheduleTime(e.target.value); setGeneratedMessage('') }} placeholder="Contoh: 10:00 - 14:00" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
                      <p className="text-[10px] text-slate-400 mt-1">Isi jadwal baru untuk reschedule pasien</p>
                    </div>
                  )}
                  <button onClick={generateMessage} disabled={!selectedTemplate || (selectedCategory === 'reschedule' && !rescheduleTime)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all">
                    <Send className="w-4 h-4" /> Generate Pesan
                  </button>
                  {generatedMessage && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 relative">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{generatedMessage}</p>
                        <button onClick={copyToClipboard} className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-emerald-500 hover:bg-emerald-100 transition-all">
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <button onClick={openWhatsApp} className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 active:scale-95 transition-all">
                        <MessageCircle className="w-4 h-4" /> Buka WhatsApp
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat */}
      {user && (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
          {chatOpen && (
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-80 max-w-[90vw] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 flex flex-col" style={{ height: '400px' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Chat Petugas</p>
                    <p className="text-[10px] text-blue-100">{messages.length} pesan</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="w-6 h-6 rounded-md flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>Belum ada pesan</p>
                    <p className="text-[10px] mt-1">Mulai percakapan dengan tim</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.sender_id === user?.id
                    return (
                      <div key={i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isMe ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          {m.sender_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 text-xs ${isMe ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <p className="text-[10px] font-semibold opacity-80 mb-0.5">{m.sender_name}</p>
                          <p className="leading-relaxed">{m.content}</p>
                          <p className={`text-[9px] mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="px-3 py-2 border-t border-slate-200">
                <div className="flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat() }} placeholder="Ketik pesan..." className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all" />
                  <button onClick={sendChat} disabled={!chatInput.trim()} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 active:scale-95 transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          <button onClick={() => setChatOpen(!chatOpen)} className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all">
            {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  )
}
