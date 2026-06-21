import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import Sidebar from './components/Sidebar'
import JadwalDokter from './pages/JadwalDokter'
import Notes from './pages/Notes'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ConsultationRequests from './pages/ConsultationRequests'
import CutiDokter from './pages/CutiDokter'

export default function App() {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Routes>
            <Route path="/" element={<JadwalDokter />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/consultation-requests" element={<ConsultationRequests />} />
            <Route path="/cuti-dokter" element={<CutiDokter />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
