import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, Activity, Heart, HeartPulse } from 'lucide-react'
import { useAuth } from '../lib/auth'

function VitalLogo() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-emerald-200/60 animate-pulse" />
      <div className="absolute inset-2 rounded-full border border-emerald-100/40" />
      {/* Center icon */}
      <div className="relative z-10 w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200/50">
        <Activity className="w-6 h-6 text-white" />
      </div>
      {/* Floating vital dots */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 animate-pulse" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

function VitalCard({ icon: Icon, label, value, color, delay }: any) {
  const bgClass = color === 'red' ? 'bg-red-50' : color === 'blue' ? 'bg-blue-50' : color === 'amber' ? 'bg-amber-50' : 'bg-emerald-50'
  const textClass = color === 'red' ? 'text-red-600' : color === 'blue' ? 'text-blue-600' : color === 'amber' ? 'text-amber-600' : 'text-emerald-600'
  const dotClass = color === 'red' ? 'bg-red-400' : color === 'blue' ? 'bg-blue-400' : color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div className={`${bgClass} rounded-lg px-3 py-2 flex items-center gap-2 transition-all duration-500`} style={{ animationDelay: delay + 'ms' }}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${bgClass}`}>
        <Icon className={`w-3.5 h-3.5 ${textClass}`} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className={`text-xs font-bold ${textClass}`}>{value}</p>
      </div>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse ml-1`} style={{ animationDelay: delay + 'ms' }} />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm mx-4 border border-slate-100">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <VitalLogo />
          <div className="flex items-center gap-2 mt-4">
            <HeartPulse className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-800">MedPlus</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Sistem Manajemen Jadwal Dokter</p>
        </div>

        {/* Vital Signs Cards */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <VitalCard icon={Heart} label="Heart Rate" value="72 bpm" color="red" delay={0} />
          <VitalCard icon={Activity} label="SpO2" value="98%" color="blue" delay={150} />
          <VitalCard icon={HeartPulse} label="Systolic" value="120 mmHg" color="amber" delay={300} />
          <VitalCard icon={Activity} label="Diastolic" value="80 mmHg" color="emerald" delay={450} />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@medplus.id"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm shadow-emerald-200"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400">
            MedPlus v1.0 — Sistem Manajemen Rumah Sakit
          </p>
        </div>
      </div>
    </div>
  )
}
