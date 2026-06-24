import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, X, Send, Circle, Bell, User, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { StaffMessage, StaffPresence, AppUser } from '../lib/supabase'

const ChatMessage = ({ msg, isMe }: { msg: StaffMessage; isMe: boolean }) => (
  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
    <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-1'}`}>
      {!isMe && (
        <p className="text-[10px] text-slate-400 mb-0.5 ml-1">{msg.sender_name}</p>
      )}
      <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
        isMe
          ? 'bg-blue-500 text-white rounded-br-sm'
          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
      }`}>
        {msg.content}
      </div>
      <p className={`text-[10px] text-slate-400 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
        {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
)

export default function ChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'staff'>('chat')
  const [messages, setMessages] = useState<StaffMessage[]>([])
  const [onlineStaff, setOnlineStaff] = useState<StaffPresence[]>([])
  const [allUsers, setAllUsers] = useState<AppUser[]>([])
  const [input, setInput] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [toastSender, setToastSender] = useState('')
  const [searchStaff, setSearchStaff] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch messages and online staff
  const fetchData = useCallback(async () => {
    const [msgRes, presenceRes, usersRes] = await Promise.all([
      supabase.from('staff_messages').select('*').order('created_at', { ascending: true }).limit(200),
      supabase.from('staff_presence').select('*').order('name', { ascending: true }),
      supabase.from('app_users').select('*').eq('is_active', true),
    ])
    if (msgRes.data) {
      setMessages(msgRes.data)
      if (!isOpen) {
        const unread = msgRes.data.filter(m => !m.is_read && m.sender_id !== user?.id).length
        setUnreadCount(unread)
      }
    }
    if (presenceRes.data) setOnlineStaff(presenceRes.data)
    if (usersRes.data) setAllUsers(usersRes.data)
  }, [isOpen, user?.id])

  // Mark messages as read when opening
  const markAsRead = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase.from('staff_messages').select('*').eq('is_read', false).neq('sender_id', user.id)
    if (data && data.length > 0) {
      await supabase.from('staff_messages').update({ is_read: true }).in('id', data.map(m => m.id))
      setUnreadCount(0)
    }
  }, [user?.id])

  // Update presence on mount
  useEffect(() => {
    if (!user?.id) return
    const updatePresence = async () => {
      await supabase.from('staff_presence').upsert({
        user_id: user.id,
        name: user.name,
        role: user.role,
        photo: user.photo,
        is_online: true,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }
    updatePresence()
    const interval = setInterval(updatePresence, 30000)
    return () => clearInterval(interval)
  }, [user?.id, user?.name, user?.role, user?.photo])

  // Set offline on page unload
  useEffect(() => {
    const setOffline = () => {
      if (user?.id) {
        supabase.from('staff_presence').update({ is_online: false, last_seen: new Date().toISOString() }).eq('user_id', user.id)
      }
    }
    window.addEventListener('beforeunload', setOffline)
    return () => window.removeEventListener('beforeunload', setOffline)
  }, [user?.id])

  // Fetch initial data
  useEffect(() => { if (user?.id) fetchData() }, [fetchData, user?.id])

  // Subscribe to new messages
  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel('staff_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'staff_messages' }, (payload: any) => {
        const newMsg = payload.new as StaffMessage
        setMessages(prev => [...prev, newMsg])
        if (newMsg.sender_id !== user.id) {
          if (!isOpen) {
            setUnreadCount(prev => prev + 1)
            setToast(newMsg.content)
            setToastSender(newMsg.sender_name)
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
            toastTimerRef.current = setTimeout(() => setToast(null), 5000)
          }
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, isOpen])

  // Subscribe to presence changes
  useEffect(() => {
    const channel = supabase
      .channel('staff_presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_presence' }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  // Mark as read when opening
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      markAsRead()
      scrollToBottom()
    }
  }, [isOpen, activeTab, markAsRead, scrollToBottom])

  // Scroll to bottom when new messages arrive while open
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom()
    }
  }, [messages, isOpen, activeTab, scrollToBottom])

  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return
    const { error } = await supabase.from('staff_messages').insert({
      sender_id: user.id,
      sender_name: user.name,
      content: input.trim(),
      is_broadcast: true,
      is_read: false,
    })
    if (!error) {
      setInput('')
      scrollToBottom()
    }
  }

  const isOnline = (userId: string) => {
    const p = onlineStaff.find(s => s.user_id === userId)
    if (!p) return false
    // Consider online if last_seen within 2 minutes
    const lastSeen = new Date(p.last_seen).getTime()
    return p.is_online && (Date.now() - lastSeen < 120000)
  }

  const filteredStaff = allUsers.filter(u => {
    if (u.id === user?.id) return false
    const term = searchStaff.toLowerCase()
    return u.name.toLowerCase().includes(term) || u.role.toLowerCase().includes(term)
  })

  if (!user?.id) return null

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-20 right-4 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 max-w-xs w-full animate-in slide-in-from-right-4 fade-in duration-300 cursor-pointer"
          onClick={() => { setToast(null); setIsOpen(true); setActiveTab('chat') }}
        >
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700">Pesan dari {toastSender}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{toast}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-40 w-96 h-[500px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${activeTab === 'chat' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${activeTab === 'staff' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Circle className="w-3.5 h-3.5" /> Online
              </button>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageCircle className="w-10 h-10 mb-2 text-slate-300" />
                    <p className="text-xs">Belum ada pesan</p>
                    <p className="text-[10px] mt-1">Mulai percakapan</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <ChatMessage key={msg.id} msg={msg} isMe={msg.sender_id === user.id} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-3 py-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder="Tulis pesan..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  value={searchStaff}
                  onChange={e => setSearchStaff(e.target.value)}
                  placeholder="Cari petugas..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                />
              </div>
              <div className="space-y-2">
                {filteredStaff.map(u => {
                  const online = isOnline(u.id)
                  return (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center overflow-hidden">
                          {u.photo ? <img src={u.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{u.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )
                })}
                {filteredStaff.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Tidak ada petugas</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) { setActiveTab('chat'); markAsRead() } }}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-slate-700 text-white' : 'bg-blue-500 text-white shadow-blue-200'
        }`}
        title={isOpen ? 'Tutup chat' : 'Buka chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-95">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>
    </>
  )
}
