import { useState } from 'react'
import {
  Globe, FileText, Code2, Music, CalendarDays,
  CheckSquare, Shield, Braces, Palette, Hash,
  ArrowRight, Zap, Terminal, Cpu, Info,
  Settings as SettingsIcon, Monitor, Volume2,
  User, HardDrive, Wifi, ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router'

const APPS = [
  { name: 'Web Browser', description: 'Browse with tabs, bookmarks & history', icon: <Globe size={28} />, path: '/browser', gradient: 'from-cyan-400 to-blue-600', glow: 'rgba(6,182,212,0.5)', shadow: '0 8px 32px rgba(6,182,212,0.3)' },
  { name: 'Notes', description: 'Rich text notes with search & pinning', icon: <FileText size={28} />, path: '/notes', gradient: 'from-amber-400 to-orange-600', glow: 'rgba(245,158,11,0.5)', shadow: '0 8px 32px rgba(245,158,11,0.3)' },
  { name: 'Code Editor', description: 'Monaco-style editor with syntax highlight', icon: <Code2 size={28} />, path: '/editor', gradient: 'from-emerald-400 to-green-600', glow: 'rgba(34,197,94,0.5)', shadow: '0 8px 32px rgba(34,197,94,0.3)' },
  { name: 'Music Player', description: 'Visualizer, playlists & playback', icon: <Music size={28} />, path: '/music', gradient: 'from-fuchsia-400 to-pink-600', glow: 'rgba(232,121,249,0.5)', shadow: '0 8px 32px rgba(232,121,249,0.3)' },
  { name: 'Calendar', description: 'Month view, events & reminders', icon: <CalendarDays size={28} />, path: '/calendar', gradient: 'from-violet-400 to-purple-600', glow: 'rgba(139,92,246,0.5)', shadow: '0 8px 32px rgba(139,92,246,0.3)' },
  { name: 'Todo', description: 'Task management with priorities', icon: <CheckSquare size={28} />, path: '/todo', gradient: 'from-teal-400 to-cyan-600', glow: 'rgba(20,184,166,0.5)', shadow: '0 8px 32px rgba(20,184,166,0.3)' },
  { name: 'Passwords', description: 'Encrypted vault with generator', icon: <Shield size={28} />, path: '/passwords', gradient: 'from-red-400 to-rose-600', glow: 'rgba(244,63,94,0.5)', shadow: '0 8px 32px rgba(244,63,94,0.3)' },
  { name: 'JSON Tool', description: 'Prettify, validate & tree view', icon: <Braces size={28} />, path: '/json', gradient: 'from-indigo-400 to-blue-600', glow: 'rgba(99,102,241,0.5)', shadow: '0 8px 32px rgba(99,102,241,0.3)' },
  { name: 'Color Picker', description: 'HSL/RGB/HEX palette generator', icon: <Palette size={28} />, path: '/color', gradient: 'from-pink-400 to-rose-500', glow: 'rgba(236,72,153,0.5)', shadow: '0 8px 32px rgba(236,72,153,0.3)' },
  { name: 'Hash Gen', description: 'MD5, SHA-1, SHA-256, SHA-512', icon: <Hash size={28} />, path: '/hash', gradient: 'from-orange-400 to-red-500', glow: 'rgba(249,115,22,0.5)', shadow: '0 8px 32px rgba(249,115,22,0.3)' },
]

const SETTINGS_TABS = [
  { id: 'about', label: 'About', icon: <Info size={15} /> },
  { id: 'display', label: 'Display', icon: <Monitor size={15} /> },
  { id: 'sound', label: 'Sound', icon: <Volume2 size={15} /> },
  { id: 'account', label: 'Account', icon: <User size={15} /> },
  { id: 'storage', label: 'Storage', icon: <HardDrive size={15} /> },
  { id: 'network', label: 'Network', icon: <Wifi size={15} /> },
  { id: 'system', label: 'System', icon: <SettingsIcon size={15} /> },
]

function AboutSection() {
  const navigate = useNavigate()
  return (
    <div className="space-y-8">
      <div className="text-center pt-4 pb-4">
        <div className="inline-flex items-center justify-center mb-5">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00a0, #8b5cf6)', boxShadow: '0 0 30px rgba(0,240,255,0.35), 0 0 60px rgba(255,0,160,0.15), inset 0 0 15px rgba(255,255,255,0.2)' }}>
            <Terminal size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ background: 'linear-gradient(135deg, #00f0ff, #ff00a0, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>R0GU3 OS</h1>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Desktop Environment v2.0</p>
        <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          A fully functional web-based Linux desktop with 10 productivity and development apps. Built with React 19, TypeScript, and Tailwind CSS.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {[{ icon: <Zap size={11} />, label: '10 Apps', color: '#39ff14' }, { icon: <Code2 size={11} />, label: 'React 19 + TS', color: '#00f0ff' }, { icon: <Palette size={11} />, label: 'Neon Theme', color: '#ff00a0' }, { icon: <Cpu size={11} />, label: 'Web OS', color: '#8b5cf6' }].map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: stat.color }}>{stat.icon}{stat.label}</div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: 'var(--text-muted)' }}>Installed Applications</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {APPS.map((app, index) => (
            <button key={app.path} onClick={() => navigate(app.path)} className="group text-left rounded-xl border p-4 transition-all duration-200 hover:scale-[1.03]"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = app.glow; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = app.shadow }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`} style={{ boxShadow: app.shadow }}>
                <div className="text-white drop-shadow-md">{app.icon}</div>
              </div>
              <h3 className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
              <p className="text-[9px] leading-relaxed mb-2" style={{ color: 'var(--text-muted)' }}>{app.description}</p>
              <div className="flex items-center gap-1 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-all" style={{ color: app.glow.replace('0.5', '1') }}>Open <ArrowRight size={8} /></div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap py-2">
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />System Online
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Kernel: 6.8.0-r0gu3</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Build: 2026.07.04</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Memory: 128MB / 2GB</span>
      </div>
    </div>
  )
}

function PlaceholderTab({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: 'var(--accent-cyan)' }}>{icon}</span>
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>This settings panel is a placeholder. The full settings system will be implemented in a future update.</p>
    </div>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('about')
  const renderTab = () => {
    switch (activeTab) {
      case 'about': return <AboutSection />
      case 'display': return <PlaceholderTab title="Display" icon={<Monitor size={24} />} />
      case 'sound': return <PlaceholderTab title="Sound" icon={<Volume2 size={24} />} />
      case 'account': return <PlaceholderTab title="Account" icon={<User size={24} />} />
      case 'storage': return <PlaceholderTab title="Storage" icon={<HardDrive size={24} />} />
      case 'network': return <PlaceholderTab title="Network" icon={<Wifi size={24} />} />
      case 'system': return <PlaceholderTab title="System" icon={<SettingsIcon size={24} />} />
      default: return <AboutSection />
    }
  }
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-4">
        <div className="w-48 shrink-0 rounded-xl p-2 space-y-0.5 hidden md:block" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
          {SETTINGS_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all"
              style={{ background: activeTab === tab.id ? 'rgba(0,240,255,0.08)' : 'transparent', color: activeTab === tab.id ? '#00f0ff' : 'rgba(255,255,255,0.45)', border: activeTab === tab.id ? '1px solid rgba(0,240,255,0.15)' : '1px solid transparent' }}>
              {tab.icon}{tab.label}{activeTab === tab.id && <ChevronRight size={10} className="ml-auto" />}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0">{renderTab()}</div>
      </div>
    </div>
  )
}
