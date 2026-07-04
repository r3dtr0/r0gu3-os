import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import {
  Globe, FileText, Code2, Music, CalendarDays,
  CheckSquare, Shield, Braces, Palette, Hash,
  Terminal, Cpu, Wifi, BatteryMedium, Volume2,
  Settings, Power, Home
} from 'lucide-react'
import AnimatedBackground from './AnimatedBackground'
import Particles from './Particles'

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return (
    <span className="font-mono text-[10px] tracking-wider tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  )
}

function StatusBar() {
  const navigate = useNavigate()
  return (
    <div className="fixed top-0 left-0 right-0 h-7 flex items-center justify-between px-3 select-none"
      style={{ zIndex: 100, background: 'rgba(8,8,16,0.75)', backdropFilter: 'blur(20px) saturate(1.2)', borderBottom: '1px solid rgba(0,240,255,0.08)' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 hover:opacity-80 transition">
          <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00a0)' }}>
            <Terminal size={8} className="text-white" />
          </div>
          <span className="text-[10px] font-bold tracking-wider" style={{ color: '#00f0ff' }}>R0GU3</span>
        </button>
        <div className="hidden sm:flex items-center gap-2.5">
          {['File', 'Edit', 'View', 'System'].map(m => (
            <span key={m} className="text-[10px] cursor-default hover:text-white transition" style={{ color: 'rgba(255,255,255,0.4)' }}>{m}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1">
          <Cpu size={9} style={{ color: '#39ff14' }} />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>8%</span>
        </div>
        <div className="flex items-center gap-1"><Wifi size={9} style={{ color: '#00f0ff' }} /></div>
        <div className="flex items-center gap-1"><Volume2 size={9} style={{ color: 'rgba(255,255,255,0.4)' }} /></div>
        <div className="flex items-center gap-1">
          <BatteryMedium size={9} style={{ color: '#39ff14' }} />
          <span className="text-[9px] font-mono hidden sm:inline" style={{ color: 'rgba(255,255,255,0.35)' }}>91%</span>
        </div>
        <LiveClock />
      </div>
    </div>
  )
}

const TASKBAR_APPS = [
  { icon: <Globe size={16} />, path: '/browser', color: '#38bdf8', label: 'Browser' },
  { icon: <FileText size={16} />, path: '/notes', color: '#f59e0b', label: 'Notes' },
  { icon: <Code2 size={16} />, path: '/editor', color: '#22c55e', label: 'Editor' },
  { icon: <Music size={16} />, path: '/music', color: '#e879f9', label: 'Music' },
  { icon: <CalendarDays size={16} />, path: '/calendar', color: '#8b5cf6', label: 'Calendar' },
  { icon: <CheckSquare size={16} />, path: '/todo', color: '#14b8a6', label: 'Todo' },
  { icon: <Shield size={16} />, path: '/passwords', color: '#f43f5e', label: 'Passwords' },
  { icon: <Braces size={16} />, path: '/json', color: '#6366f1', label: 'JSON' },
  { icon: <Palette size={16} />, path: '/color', color: '#ec4899', label: 'Colors' },
  { icon: <Hash size={16} />, path: '/hash', color: '#f97316', label: 'Hash' },
]

function Taskbar() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 flex items-center justify-center px-3 gap-1 select-none"
      style={{ zIndex: 100, background: 'rgba(8,8,16,0.8)', backdropFilter: 'blur(20px) saturate(1.2)', borderTop: '1px solid rgba(0,240,255,0.12)' }}>
      <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 mr-1"
        style={{ background: location.pathname === '/' ? 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(255,0,160,0.25))' : 'rgba(255,255,255,0.05)', border: location.pathname === '/' ? '1px solid rgba(0,240,255,0.4)' : '1px solid rgba(255,255,255,0.08)' }}>
        <Home size={15} style={{ color: location.pathname === '/' ? '#00f0ff' : 'rgba(255,255,255,0.5)' }} />
      </button>
      <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
      {TASKBAR_APPS.map((app, i) => {
        const isActive = location.pathname === app.path
        return (
          <button key={i} onClick={() => navigate(app.path)} className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 group"
            style={{ background: isActive ? `${app.color}20` : 'rgba(255,255,255,0.04)', border: isActive ? `1px solid ${app.color}50` : '1px solid transparent' }} title={app.label}>
            <span style={{ color: isActive ? app.color : 'rgba(255,255,255,0.55)' }}>{app.icon}</span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none"
              style={{ background: 'rgba(20,20,30,0.9)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{app.label}</span>
            {isActive && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: app.color }} />}
          </button>
        )
      })}
      <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <button onClick={() => navigate('/settings')} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ background: location.pathname === '/settings' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', border: location.pathname === '/settings' ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent' }} title="Settings">
        <Settings size={14} style={{ color: location.pathname === '/settings' ? '#8b5cf6' : 'rgba(255,255,255,0.55)' }} />
      </button>
      <button className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ml-0.5" style={{ background: 'rgba(255,255,255,0.04)' }} title="Power">
        <Power size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
      </button>
    </div>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isDesktop = location.pathname === '/'
  return (
    <div className="min-h-screen relative" style={{ background: '#080810' }}>
      {isDesktop && <AnimatedBackground />}
      {isDesktop && <Particles />}
      <StatusBar />
      <div className="relative pt-7 pb-12 min-h-screen" style={{ zIndex: 2 }}>{children}</div>
      <Taskbar />
    </div>
  )
}
