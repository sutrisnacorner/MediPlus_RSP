import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, HeartPulse, Calendar, Users, Clock, Shield } from 'lucide-react'
import { useAuth } from '../lib/auth'

function MedicalTeamIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-400 rounded-full blur-3xl" />
      </div>

      <svg viewBox="0 0 400 300" className="w-full h-auto relative z-10">
        {/* Floor/Platform */}
        <ellipse cx="200" cy="280" rx="150" ry="15" fill="#e2e8f0" />

        {/* Doctor 1 (Left) */}
        <g transform="translate(60, 100)">
          {/* Body */}
          <rect x="20" y="60" width="50" height="100" rx="8" fill="#10b981" />
          {/* Head */}
          <circle cx="45" cy="35" r="28" fill="#fbbf24" />
          {/* Face */}
          <circle cx="38" cy="30" r="3" fill="#1e293b" />
          <circle cx="52" cy="30" r="3" fill="#1e293b" />
          <path d="M40 42 Q45 47 50 42" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Stethoscope */}
          <path d="M35 90 Q20 100 25 120" stroke="#64748b" strokeWidth="3" fill="none" />
          <circle cx="25" cy="125" r="8" fill="#64748b" />
          {/* Coat details */}
          <rect x="30" y="65" width="30" height="40" rx="2" fill="#059669" opacity="0.5" />
          {/* Arms */}
          <rect x="-5" y="65" width="25" height="12" rx="6" fill="#10b981" />
          <rect x="65" y="65" width="25" height="12" rx="6" fill="#10b981" />
        </g>

        {/* Doctor 2 (Center) */}
        <g transform="translate(160, 80)">
          {/* Body */}
          <rect x="20" y="70" width="55" height="110" rx="8" fill="#0ea5e9" />
          {/* Head */}
          <circle cx="47" cy="40" r="32" fill="#fcd34d" />
          {/* Face */}
          <circle cx="38" cy="35" r="3.5" fill="#1e293b" />
          <circle cx="56" cy="35" r="3.5" fill="#1e293b" />
          <path d="M40 48 Q47 55 54 48" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Clipboard */}
          <rect x="80" y="80" width="20" height="30" rx="2" fill="#f1f5f9" stroke="#cbd5e1" />
          <line x1="85" y1="88" x2="95" y2="88" stroke="#94a3b8" strokeWidth="1" />
          <line x1="85" y1="94" x2="92" y2="94" stroke="#94a3b8" strokeWidth="1" />
          {/* Arms */}
          <rect x="-5" y="80" width="28" height="14" rx="7" fill="#0ea5e9" />
          <rect x="72" y="80" width="28" height="14" rx="7" fill="#0ea5e9" />
        </g>

        {/* Admin Staff (Right) */}
        <g transform="translate(270, 110)">
          {/* Body */}
          <rect x="15" y="55" width="45" height="90" rx="8" fill="#8b5cf6" />
          {/* Head */}
          <circle cx="37" cy="30" r="26" fill="#fbbf24" />
          {/* Hair */}
          <path d="M15 25 Q20 5 37 5 Q54 5 59 25" fill="#7c3aed" />
          {/* Face */}
          <circle cx="30" cy="27" r="2.5" fill="#1e293b" />
          <circle cx="44" cy="27" r="2.5" fill="#1e293b" />
          <path d="M32 38 Q37 42 42 38" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Tablet/Laptop */}
          <rect x="55" y="75" width="35" height="25" rx="3" fill="#e2e8f0" stroke="#cbd5e1" />
          <rect x="58" y="78" width="29" height="18" rx="1" fill="#bfdbfe" />
          {/* Arms */}
          <rect x="-5" y="60" width="22" height="12" rx="6" fill="#8b5cf6" />
          <rect x="53" y="60" width="22" height="12" rx="6" fill="#8b5cf6" />
        </g>

        {/* Floating medical icons */}
        <g className="animate-pulse">
          <circle cx="45" cy="65" r="12" fill="#fef3c7" />
          <path d="M42 65h6M45 62v6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="animate-pulse" style={{ animationDelay: '0.5s' }}>
          <circle cx="355" cy="75" r="12" fill="#dbeafe" />
          <path d="M350 75 C350 71, 354 68, 358 71 C360 68, 365 70, 365 75 C365 79, 361 82, 357 80 C353 82, 350 79, 350 75" fill="#3b82f6" />
        </g>

        <g className="animate-pulse" style={{ animationDelay: '1s' }}>
          <circle cx="195" cy="40" r="12" fill="#dcfce7" />
          <path d="M188 40 L192 44 L202 34" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  const iconBg = color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Gagal masuk')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-blue-50/30">
      {/* Responsive Grid Layout */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Panel - Illustration & Features (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 xl:p-12 bg-gradient-to-br from-emerald-500/5 to-blue-500/5">
          <div className="w-full max-w-xl">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">MedPlus</h1>
                <p className="text-xs text-slate-500">Sistem Manajemen Klinik</p>
              </div>
            </div>

            {/* Illustration */}
            <MedicalTeamIllustration />

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <FeatureCard
                icon={Calendar}
                title="Jadwal Dokter"
                description="Kelola jadwal praktek dengan mudah"
                color="emerald"
              />
              <FeatureCard
                icon={Users}
                title="Manajemen Pasien"
                description="Data pasien terorganisir"
                color="blue"
              />
              <FeatureCard
                icon={Clock}
                title="Konsultasi"
                description="Permintaan konsultasi real-time"
                color="amber"
              />
              <FeatureCard
                icon={Shield}
                title="Keamanan"
                description="Data terenkripsi & aman"
                color="purple"
              />
            </div>

            {/* Trust Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Dilindungi dengan enkripsi end-to-end</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex flex-col justify-center items-center p-4 sm:p-6 md:p-8">
          {/* Mobile Logo (Visible on mobile/tablet) */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/50 mb-3">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">MedPlus</h1>
            <p className="text-xs text-slate-500 mt-1">Sistem Manajemen Klinik</p>
          </div>

          {/* Mobile Illustration (Simplified) */}
          <div className="lg:hidden w-full max-w-xs mb-6">
            <MedicalTeamIllustration />
          </div>

          {/* Login Card */}
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-100">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Selamat Datang</h2>
                <p className="text-sm text-slate-500 mt-1">Masuk ke akun Anda untuk melanjutkan</p>
              </div>

              {/* Quick Login Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setEmail('superadmin@klinik.com'); setPassword('admin123') }}
                  className="px-2 py-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@klinik.com'); setPassword('admin123') }}
                  className="px-2 py-1.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('ahmad@klinik.com'); setPassword('staff123') }}
                  className="px-2 py-1.5 text-[10px] font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Staff
                </button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400">atau masuk manual</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@klinik.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-emerald-200/50"
                >
                  <LogIn className="w-5 h-5" />
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : 'Masuk'}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-center text-[10px] text-slate-400">
                  MedPlus v1.0 — Sistem Manajemen Rumah Sakit
                </p>
              </div>
            </div>

            {/* Bottom info */}
            <p className="text-center text-[10px] text-slate-400 mt-4 px-4">
              Dengan masuk, Anda menyetujui syarat dan ketentuan penggunaan sistem
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
