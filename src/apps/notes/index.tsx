import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus, Trash2, Search, Pin, PinOff, Clock,
  FileText, ChevronRight, X
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const DEFAULT_NOTES: Note[] = [
  {
    id: generateId(),
    title: 'Welcome to Notes',
    body: '# Welcome to R0GU3 Notes\n\nThis is a simple note-taking app with markdown-like support.\n\n## Features\n- Create, edit, and delete notes\n- Pin important notes\n- Search through all notes\n- Auto-saves to localStorage\n\n**Enjoy taking notes!**',
    pinned: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: generateId(),
    title: 'Shopping List',
    body: '- [x] Milk\n- [ ] Eggs\n- [ ] Bread\n- [ ] Coffee\n- [ ] Avocados',
    pinned: false,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: generateId(),
    title: 'Project Ideas',
    body: '1. AI-powered code reviewer\n2. Personal finance tracker\n3. Habit builder app\n4. Recipe recommender\n5. Workout planner',
    pinned: false,
    createdAt: Date.now() - 259200000,
    updatedAt: Date.now() - 86400000,
  },
];

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_notes');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch { return DEFAULT_NOTES; }
  });
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    localStorage.setItem('rogue_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (activeNote && bodyRef.current) {
      bodyRef.current.focus();
    }
  }, [activeNoteId]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = notes.filter(n =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    const pinned = result.filter(n => n.pinned).sort((a, b) => b.updatedAt - a.updatedAt);
    const unpinned = result.filter(n => !n.pinned).sort((a, b) => b.updatedAt - a.updatedAt);
    return [...pinned, ...unpinned];
  }, [notes, searchQuery]);

  const createNote = () => {
    const newNote: Note = {
      id: generateId(),
      title: 'Untitled Note',
      body: '',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setSearchQuery('');
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActiveNoteId(remaining[0]?.id || '');
    }
  };

  const togglePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) updateNote(id, { pinned: !note.pinned });
  };

  const renderPreview = (body: string): string => {
    return body.slice(0, 80).replace(/[#*\-\[\]`]/g, '').trim();
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Sidebar */}
      <div
        className="flex flex-col border-r transition-all duration-200"
        style={{
          width: sidebarCollapsed ? 0 : 280,
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-tertiary)',
          minWidth: sidebarCollapsed ? 0 : 280,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notes</h2>
          <button
            onClick={createNote}
            className="p-1.5 rounded hover:bg-white/10 transition"
            style={{ color: 'var(--accent-cyan)' }}
            title="New Note"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center rounded-md px-2.5 py-1.5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <Search size={14} className="mr-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-xs"
              style={{ color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 rounded hover:bg-white/10">
                <X size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={32} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>No notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className="group cursor-pointer px-3 py-2.5 border-b transition hover:bg-white/5"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: activeNoteId === note.id ? 'rgba(0,240,255,0.06)' : undefined,
                  borderLeft: activeNoteId === note.id ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                    {note.pinned && <span className="mr-1" style={{ color: 'var(--accent-cyan)' }}>📌</span>}
                    {note.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={e => { e.stopPropagation(); togglePin(note.id); }}
                      className="p-1 rounded hover:bg-white/10"
                      style={{ color: note.pinned ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
                    >
                      {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                      className="p-1 rounded hover:bg-red-500/20"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {renderPreview(note.body) || 'No content'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={9} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatTime(note.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="flex-shrink-0 flex items-center justify-center w-5 border-r hover:bg-white/5 transition z-10"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}
      >
        <ChevronRight
          size={12}
          className="transition-transform"
          style={{
            color: 'var(--text-muted)',
            transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeNote ? (
          <>
            {/* Title Input */}
            <div className="px-4 pt-4 pb-2">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                className="w-full bg-transparent outline-none text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Note title..."
              />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 px-4 pb-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>{new Date(activeNote.updatedAt).toLocaleString()}</span>
              <span>{activeNote.body.length} characters</span>
              <span>{activeNote.body.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px" style={{ background: 'var(--border-subtle)' }} />

            {/* Body */}
            <textarea
              ref={bodyRef}
              value={activeNote.body}
              onChange={e => updateNote(activeNote.id, { body: e.target.value })}
              className="flex-1 bg-transparent outline-none px-4 py-3 resize-none text-sm leading-relaxed"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              placeholder="Start writing..."
              spellCheck={false}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileText size={48} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Select a note or create a new one</p>
            <button
              onClick={createNote}
              className="mt-4 px-4 py-2 rounded-md text-sm border transition hover:bg-white/5"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <Plus size={14} className="inline mr-2" />
              New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
