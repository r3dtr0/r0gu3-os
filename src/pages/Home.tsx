import { useNavigate } from 'react-router'
import {
  Globe, FileText, Code2, Music, CalendarDays,
  CheckSquare, Shield, Braces, Palette, Hash,
  Terminal, Settings, FolderOpen, Info
} from 'lucide-react'
import { useEffect, useState } from 'react'

const DESKTOP_APPS = [
  { name: 'Web Browser', icon: <Globe size={28} />, path: '/browser', color: '#38bdf8' },
  { name: 'Notes', icon: <FileText size={28} />, path: '/notes', color: '#f59e0b' },
  { name: 'Code Editor', icon: <Code2 size={28} />, path: '/editor', color: '#22c55e' },
  { name: 'Music Player', icon: <Music size={28} />, path: '/music', color: '#e879f9' },
  { name: 'Calendar', icon: <CalendarDays size={28} />, path: '/calendar', color: '#8b5cf6' },
  { name: 'Todo', icon: <CheckSquare size={28} />, path: '/todo', color: '#14b8a6' },
  { name: 'Passwords', icon: <Shield size={28} />, path: '/passwords', color: '#f43f5e' },
  { name: 'JSON Tool', icon: <Braces size={28} />, path: '/json', color: '#6366f1' },
  { name: 'Color Picker', icon: <Palette size={28} />, path: '/color', color: '#ec4899' },
  { name: 'Hash Gen', icon: <Hash size={28} />, path: '/hash', color: '#f97316' },
]

const DESKTOP_SHORTCUTS = [
  { name: 'Terminal', icon: <Terminal size={24} />, color: '#00f0ff', action: () => {} },
  { name: 'Files', icon: <FolderOpen size={24} />, color: '#f59e0b', action: () => {} },
  { name: 'Settings', icon: <Settings size={24} />, path: '/settings', color: '#8b5cf6' },
  { name: 'About', icon: <Info size={24} />, path: '/settings', color: '#39ff14' },
]

function ClockWidget() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return (
    <div className="absolute top-4 right-4 px-4 py-3 rounded-2xl text-right select-none"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', zIndex: 10 }}>
      <div className="text-3xl font-light tracking-tight tabular-nums" style={{ color: '#fff', fontFamily: 'var(--font-mono, monospace)' }}>
        {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

function SystemWidget() {
  return (
    <div className="absolute bottom-4 right-4 px-4 py-3 rounded-2xl select-none"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', zIndex: 10 }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
        <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>System Online</span>
      </div>
      <div className="space-y-0.5">
        <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Kernel 6.8.0-r0gu3</div>
        <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Mem: 128MB / 2GB</div>
        <div className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Uptime: 01:23:45</div>
      </div>
    </div>
  )
}

function DesktopIcon({ name, icon, color, onClick }: { name: string; icon: React.ReactNode; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center gap-1.5 w-20 p-2 rounded-xl transition-all hover:scale-105"
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)`, border: `1px solid ${color}30`, boxShadow: `0 4px 20px ${color}20` }}>
        <span style={{ color, filter: `drop-shadow(0 0 4px ${color}80)` }}>{icon}</span>
      </div>
      <span className="text-[10px] font-medium text-center leading-tight max-w-full truncate px-0.5"
        style={{ color: 'rgba(255,255,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{name}</span>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      <ClockWidget />
      <SystemWidget />
      <div className="absolute top-4 left-4 flex flex-col gap-1" style={{ zIndex: 10 }}>
        {DESKTOP_APPS.map((app) => (
          <DesktopIcon key={app.path} name={app.name} icon={app.icon} color={app.color} onClick={() => navigate(app.path)} />
        ))}
        <div className="w-full h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        {DESKTOP_SHORTCUTS.map((shortcut) => (
          <DesktopIcon key={shortcut.name} name={shortcut.name} icon={shortcut.icon} color={shortcut.color}
            onClick={() => 'path' in shortcut && shortcut.path ? navigate(shortcut.path) : shortcut.action?.()} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
        <div className="text-center opacity-20">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.3), rgba(255,0,160,0.3))', border: '1px solid rgba(0,240,255,0.2)' }}>
            <Terminal size={40} style={{ color: '#00f0ff' }} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>R0GU3 OS</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>v2.0 — Desktop Environment</p>
        </div>
      </div>
    </div>
  )
}
