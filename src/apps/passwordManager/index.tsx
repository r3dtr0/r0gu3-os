import { useState } from 'react';
import {
  Lock, Unlock, Plus, Search, Copy, Check, Trash2,
  Eye, EyeOff, RefreshCw, Shield, X
} from 'lucide-react';

interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
  notes: string;
  createdAt: number;
}

// Simple XOR-based "encryption" for demo purposes
// In production, use crypto.subtle or a proper library
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function xorDecrypt(encoded: string, key: string): string {
  try {
    const text = atob(encoded);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return '';
  }
}

const MASTER_PASSWORD = 'r0gu3';

function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pw;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

const DEFAULT_ENTRIES: PasswordEntry[] = [
  { id: generateId(), service: 'GitHub', username: 'developer123', password: xorEncrypt('ghp_xxxxxxxxxxxx', MASTER_PASSWORD), notes: 'Personal account', createdAt: Date.now() - 100000 },
  { id: generateId(), service: 'Gmail', username: 'user@gmail.com', password: xorEncrypt('SecurePass123!', MASTER_PASSWORD), notes: 'Main email', createdAt: Date.now() - 200000 },
  { id: generateId(), service: 'AWS Console', username: 'admin', password: xorEncrypt('AWS#Admin456', MASTER_PASSWORD), notes: 'Production access', createdAt: Date.now() - 300000 },
  { id: generateId(), service: 'Netflix', username: 'family@email.com', password: xorEncrypt('Stream789!', MASTER_PASSWORD), notes: 'Family plan', createdAt: Date.now() - 400000 },
  { id: generateId(), service: 'Stripe', username: 'dev@company.com', password: xorEncrypt('Stripe#Pay2025', MASTER_PASSWORD), notes: 'Test environment', createdAt: Date.now() - 500000 },
];

export default function PasswordManager() {
  const [unlocked, setUnlocked] = useState(false);
  const [masterInput, setMasterInput] = useState('');
  const [entries, setEntries] = useState<PasswordEntry[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_passwords');
      return saved ? JSON.parse(saved) : DEFAULT_ENTRIES;
    } catch { return DEFAULT_ENTRIES; }
  });
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ service: '', username: '', password: '', notes: '' });
  const [genLength, setGenLength] = useState(16);
  const [generatedPw, setGeneratedPw] = useState('');

  const saveEntries = (newEntries: PasswordEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('rogue_passwords', JSON.stringify(newEntries));
  };

  const unlock = () => {
    if (masterInput === MASTER_PASSWORD) {
      setUnlocked(true);
    }
  };

  const filteredEntries = entries.filter(e =>
    e.service.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  const addEntry = () => {
    if (!newEntry.service.trim() || !newEntry.username.trim() || !newEntry.password.trim()) return;
    const entry: PasswordEntry = {
      id: generateId(),
      service: newEntry.service.trim(),
      username: newEntry.username.trim(),
      password: xorEncrypt(newEntry.password, MASTER_PASSWORD),
      notes: newEntry.notes.trim(),
      createdAt: Date.now(),
    };
    saveEntries([...entries, entry]);
    setNewEntry({ service: '', username: '', password: '', notes: '' });
    setShowAddForm(false);
  };

  const deleteEntry = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ background: 'var(--bg-secondary)' }}>
        <div className="w-80 rounded-xl border p-6 text-center" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.2)' }}
          >
            <Lock size={28} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Password Vault</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Enter master password to unlock</p>
          <input
            type="password"
            value={masterInput}
            onChange={e => setMasterInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            placeholder="Master password"
            className="w-full rounded-md px-3 py-2.5 text-xs outline-none border mb-3"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            onClick={unlock}
            className="w-full py-2 rounded-md text-xs font-medium transition"
            style={{ background: 'var(--accent-cyan)', color: '#000' }}
          >
            <Unlock size={13} className="inline mr-1.5" />
            Unlock Vault
          </button>
          <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>Hint: master password is &quot;r0gu3&quot;</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <div className="w-64 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>PassVault</h2>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entries.length} stored passwords</p>
        </div>

        {/* Password Generator */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Generator</h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={generatedPw}
              readOnly
              className="flex-1 rounded px-2 py-1.5 text-[11px] border outline-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--accent-lime)', fontFamily: 'var(--font-mono)' }}
              placeholder="Click generate..."
            />
            {generatedPw && (
              <button onClick={() => copyToClipboard(generatedPw, 'gen')} className="p-1.5 rounded hover:bg-white/10">
                {copiedId === 'gen' ? <Check size={12} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="range"
              min={8}
              max={32}
              value={genLength}
              onChange={e => setGenLength(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--accent-cyan) ${((genLength - 8) / 24) * 100}%, var(--border-subtle) ${((genLength - 8) / 24) * 100}%)` }}
            />
            <span className="text-[10px] w-5 text-right" style={{ color: 'var(--text-muted)' }}>{genLength}</span>
          </div>
          <button
            onClick={() => setGeneratedPw(generatePassword(genLength))}
            className="w-full py-1.5 rounded text-[11px] flex items-center justify-center gap-1 transition"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <RefreshCw size={11} />
            Generate
          </button>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setUnlocked(false)}
          className="mx-4 mb-4 py-2 rounded text-[11px] border transition hover:bg-white/5"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <Lock size={11} className="inline mr-1" />
          Lock Vault
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center rounded-md px-3 py-1.5 border flex-1 max-w-xs" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
              <Search size={13} className="mr-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services..."
                className="bg-transparent outline-none text-xs flex-1"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition"
            style={{ background: 'var(--accent-cyan)', color: '#000' }}
          >
            <Plus size={14} />
            Add Entry
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={newEntry.service}
                onChange={e => setNewEntry({ ...newEntry, service: e.target.value })}
                placeholder="Service name"
                className="rounded-md px-3 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={newEntry.username}
                onChange={e => setNewEntry({ ...newEntry, username: e.target.value })}
                placeholder="Username / Email"
                className="rounded-md px-3 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEntry.password}
                onChange={e => setNewEntry({ ...newEntry, password: e.target.value })}
                placeholder="Password"
                className="flex-1 rounded-md px-3 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
              <button
                onClick={() => setNewEntry({ ...newEntry, password: generatePassword() })}
                className="px-2 py-2 rounded border"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                title="Generate"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEntry.notes}
                onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="flex-1 rounded-md px-3 py-2 text-xs outline-none border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <button onClick={addEntry} className="px-3 py-2 rounded text-xs" style={{ background: 'var(--accent-cyan)', color: '#000' }}>Save</button>
              <button onClick={() => setShowAddForm(false)} className="px-2 py-2 rounded text-xs" style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
          </div>
        )}

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntries.map(entry => {
            const decrypted = xorDecrypt(entry.password, MASTER_PASSWORD);
            const isVisible = visiblePasswords.has(entry.id);
            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 px-6 py-3 border-b transition hover:bg-white/[0.02]"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--accent-cyan)', border: '1px solid var(--border-subtle)' }}
                >
                  {entry.service.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{entry.service}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{entry.username}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-xs px-2 py-1 rounded border"
                    style={{
                      color: isVisible ? 'var(--accent-lime)' : 'var(--text-muted)',
                      borderColor: 'var(--border-subtle)',
                      fontFamily: 'var(--font-mono)',
                      minWidth: 140,
                      textAlign: 'center',
                    }}
                  >
                    {isVisible ? decrypted : '•'.repeat(Math.min(decrypted.length, 16))}
                  </span>

                  <button
                    onClick={() => toggleVisibility(entry.id)}
                    className="p-1.5 rounded hover:bg-white/10 transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>

                  <button
                    onClick={() => copyToClipboard(decrypted, entry.id)}
                    className="p-1.5 rounded hover:bg-white/10 transition"
                    style={{ color: copiedId === entry.id ? 'var(--accent-lime)' : 'var(--text-muted)' }}
                  >
                    {copiedId === entry.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>

                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 transition"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
