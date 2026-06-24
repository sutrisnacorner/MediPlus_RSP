import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Note = {
  id: string
  title: string
  content: string
  color: string
  created_at: string
  updated_at: string
}

export type AppUser = {
  id: string
  name: string
  email: string
  role: string
  phone: string | null
  password: string | null
  photo: string | null
  auth_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ChatTemplate = {
  id: string
  name: string
  content: string
  category: string
  reschedule_time: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Patient = {
  id: string
  mr_no: string
  name: string
  phone: string
  status: string
  doctor_name: string
  specialty: string
  appointment_time: string
  appointment_date: string
  created_at: string
  updated_at: string
}

export type DoctorSchedule = {
  id: string
  name: string
  specialty: string
  session_1: string | null
  session_2: string | null
  room: string | null
  is_on_leave: boolean
  leave_note: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DoctorLeave = {
  id: string
  doctor_id: string
  doctor_name: string
  start_date: string
  end_date: string
  note: string
  created_at: string
}

export type StaffMessage = {
  id: string
  sender_id: string
  sender_name: string
  content: string
  recipient_id: string | null
  is_broadcast: boolean
  is_read: boolean
  created_at: string
}

export type StaffPresence = {
  user_id: string
  name: string
  role: string
  photo: string | null
  is_online: boolean
  last_seen: string
}

export type ConsultationRequest = {
  id: string
  requester_name: string
  requester_role: string
  patient_name: string
  patient_mr: string
  doctor_id: string
  doctor_name: string
  specialty: string
  session: string
  status: string
  note: string
  created_at: string
  updated_at: string
}
