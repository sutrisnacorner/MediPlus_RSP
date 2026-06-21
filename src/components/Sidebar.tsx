import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Calendar, Stethoscope, Settings, ChevronRight, StickyNote, LogIn, LogOut, ShieldCheck, PenLine, X, Save, ClipboardList, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { canView } from '../lib/permissions'

const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']
const calendarDates = [
  [0, 0, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 0, 0, 0],
]

const today = 20

export default function Sidebar() {
  const [pagesOpen, setPagesOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const { user, logout } = useAuth()
  const role = user?.role || ''

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <div className="px-4 py-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-800 text-sm">RS Harapan Medika</span>
        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
      </div>

      {/* Pages section */}
      <div className="px-4 mt-2">
        <button
          onClick={() => setPagesOpen(!pagesOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 hover:text-slate-600 transition-colors"
        >
          <span>Halaman</span>
        </button>
        {pagesOpen && (
          <nav className="space-y-1">
            {canView('jadwal_dokter', role) && (
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Calendar className="w-4 h-4" />
                Jadwal Dokter
              </NavLink>
            )}
            {canView('notes', role) && (
              <NavLink
                to="/notes"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <StickyNote className="w-4 h-4" />
                Notes
              </NavLink>
            )}
            {canView('consultation_requests', role) && (
              <NavLink
                to="/consultation-requests"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <ClipboardList className="w-4 h-4" />
                Request Konsul
              </NavLink>
            )}
            {canView('cuti_dokter', role) && (
              <NavLink
                to="/cuti-dokter"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <XCircle className="w-4 h-4" />
                Cuti Dokter
              </NavLink>
            )}
            {canView('settings_users', role) && (
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-800 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Settings className="w-4 h-4" />
                Pengaturan
                {user?.role === 'super_admin' && (
                  <ShieldCheck className="w-3 h-3 text-purple-400 ml-auto" />
                )}
              </NavLink>
            )}
          </nav>
        )}
      </div>

      {/* Calendar */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-xs font-semibold text-slate-800 mb-3">Juni 2026</h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d, i) => (
              <div key={i} className="text-[10px] text-slate-400 font-medium py-1">
                {d}
              </div>
            ))}
            {calendarDates.flat().map((d, i) => (
              <div
                key={i}
                className={`text-[10px] py-1 rounded-md cursor-pointer transition-colors ${
                  d === today
                    ? 'bg-blue-500 text-white font-semibold'
                    : d === 0
                    ? 'text-transparent'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d || ''}
              </div>
            ))}
          </div>
          <button className="w-full mt-2 text-[10px] text-blue-500 font-medium hover:text-blue-600 transition-colors">
            Kembali ke hari ini
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="mt-auto border-t border-slate-200 p-4">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                onClick={() => { setProfileOpen(true); setEditName(user.name); setPhotoUrl(user.photo || '') }}
              >
                {user.photo ? <img src={user.photo} alt="" className="w-full h-full object-cover" /> : user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(true); setEditName(user.name); setPhotoUrl(user.photo || '') }}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <PenLine className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Masuk
          </NavLink>
        )}
      </div>

      {/* Profile Modal */}
      {profileOpen && user && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800">Profil Pengguna</h2>
              <button onClick={() => setProfileOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 text-lg font-bold flex items-center justify-center overflow-hidden border-2 border-slate-200">
                  {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : editName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">URL Foto Profil</label>
                  <input
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                  />
                </div>
              </div>
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Nama</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                />
              </div>
              {/* Email (readonly) */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
                <input value={user.email} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              {/* Role (readonly) */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Role</label>
                <input value={user.role.replace('_', ' ').toUpperCase()} readOnly className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed" />
              </div>
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setProfileOpen(false)} className="flex-1 px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all">Batal</button>
                <button
                  onClick={async () => {
                    setSaving(true)
                    const { error } = await supabase.from('app_users').update({ name: editName, photo: photoUrl || null }).eq('id', user.id)
                    if (!error) {
                      setProfileOpen(false)
                      window.location.reload()
                    }
                    setSaving(false)
                  }}
                  disabled={saving || !editName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
