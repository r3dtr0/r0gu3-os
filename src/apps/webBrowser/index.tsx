import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, Home, Globe,
  Bookmark, Plus, X, Loader2, Lock, Clock
} from 'lucide-react';

interface Tab {
  id: string;
  url: string;
  title: string;
  loading: boolean;
}

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
}

interface Bookmark {
  name: string;
  url: string;
  icon: string;
}

const DEFAULT_URL = 'https://www.wikipedia.org';
const HOME_URL = 'https://www.wikipedia.org';

const PRESET_BOOKMARKS: Bookmark[] = [
  { name: 'Google', url: 'https://www.google.com', icon: 'G' },
  { name: 'GitHub', url: 'https://github.com', icon: '</>' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org', icon: 'W' },
  { name: 'Reddit', url: 'https://www.reddit.com', icon: 'R' },
  { name: 'YouTube', url: 'https://www.youtube.com', icon: '▶' },
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function WebBrowser() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: generateId(), url: DEFAULT_URL, title: 'Wikipedia', loading: false },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [addressBar, setAddressBar] = useState(DEFAULT_URL);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_browser_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const addToHistory = useCallback((url: string, title: string) => {
    setHistory(prev => {
      const entry: HistoryEntry = { url, title, timestamp: Date.now() };
      const filtered = prev.filter(h => h.url !== url);
      const updated = [entry, ...filtered].slice(0, 100);
      localStorage.setItem('rogue_browser_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const navigateTo = useCallback((url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      if (finalUrl.includes('.')) {
        finalUrl = 'https://' + finalUrl;
      } else {
        finalUrl = 'https://www.google.com/search?q=' + encodeURIComponent(finalUrl);
      }
    }
    setAddressBar(finalUrl);
    setTabs(prev => prev.map(t =>
      t.id === activeTabId
        ? { ...t, url: finalUrl, loading: true }
        : t
    ));
    setTimeout(() => {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId ? { ...t, loading: false } : t
      ));
      addToHistory(finalUrl, finalUrl);
    }, 800);
  }, [activeTabId, addToHistory]);

  const addTab = () => {
    const newTab: Tab = { id: generateId(), url: HOME_URL, title: 'New Tab', loading: false };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setAddressBar(HOME_URL);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setAddressBar(newTabs[newTabs.length - 1].url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(addressBar);
  };

  const goBack = () => {
    if (iframeRef.current) {
      try { iframeRef.current.contentWindow?.history.back(); } catch { /* cross-origin */ }
    }
  };

  const goForward = () => {
    if (iframeRef.current) {
      try { iframeRef.current.contentWindow?.history.forward(); } catch { /* cross-origin */ }
    }
  };

  const refresh = () => {
    navigateTo(activeTab.url);
  };

  const goHome = () => {
    navigateTo(HOME_URL);
  };

  useEffect(() => {
    setAddressBar(activeTab?.url || '');
  }, [activeTabId, activeTab?.url]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <button onClick={goBack} className="p-1.5 rounded hover:bg-white/5 transition" title="Back">
          <ArrowLeft size={15} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button onClick={goForward} className="p-1.5 rounded hover:bg-white/5 transition" title="Forward">
          <ArrowRight size={15} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button onClick={refresh} className="p-1.5 rounded hover:bg-white/5 transition" title="Refresh">
          <RotateCw size={15} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button onClick={goHome} className="p-1.5 rounded hover:bg-white/5 transition" title="Home">
          <Home size={15} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <form onSubmit={handleSubmit} className="flex items-center flex-1 mx-2">
          <div className="flex items-center flex-1 rounded-md px-3 py-1.5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
            <Lock size={12} className="mr-2 flex-shrink-0" style={{ color: 'var(--accent-lime)' }} />
            <input
              type="text"
              value={addressBar}
              onChange={e => setAddressBar(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
            {activeTab?.loading && <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: 'var(--accent-cyan)' }} />}
          </div>
        </form>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-1.5 rounded hover:bg-white/5 transition"
          title="History"
        >
          <Clock size={15} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* Bookmark Bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <Bookmark size={12} className="mr-1" style={{ color: 'var(--text-muted)' }} />
        {PRESET_BOOKMARKS.map(bm => (
          <button
            key={bm.name}
            onClick={() => navigateTo(bm.url)}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs hover:bg-white/5 transition"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Globe size={11} />
            {bm.name}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 px-2 pt-1.5 overflow-x-auto" style={{ background: 'var(--bg-tertiary)' }}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => { setActiveTabId(tab.id); setAddressBar(tab.url); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer text-xs min-w-[120px] max-w-[200px] transition border-t border-x"
            style={{
              background: tab.id === activeTabId ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
              borderColor: tab.id === activeTabId ? 'var(--border-subtle)' : 'transparent',
              color: tab.id === activeTabId ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: tab.id === activeTabId ? '1px solid var(--bg-secondary)' : 'none',
              marginBottom: tab.id === activeTabId ? '-1px' : '0',
              zIndex: tab.id === activeTabId ? 1 : 0,
            }}
          >
            <Globe size={11} />
            <span className="flex-1 truncate">{tab.title}</span>
            <button
              onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
              className="p-0.5 rounded hover:bg-white/10"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button onClick={addTab} className="p-1.5 rounded hover:bg-white/5 transition ml-1" style={{ color: 'var(--text-secondary)' }}>
          <Plus size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: tab.id === activeTabId ? 'block' : 'none' }}
          >
            <iframe
              ref={tab.id === activeTabId ? iframeRef : undefined}
              src={tab.url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
              title={tab.title}
              onLoad={() => {
                setTabs(prev => prev.map(t =>
                  t.id === tab.id ? { ...t, loading: false } : t
                ));
              }}
            />
            {tab.loading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading {tab.url}...</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* History Panel */}
        {showHistory && (
          <div
            className="absolute top-2 right-2 w-80 max-h-96 rounded-lg border shadow-xl overflow-auto z-10"
            style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>History</h3>
              <button onClick={() => setShowHistory(false)} className="p-1 rounded hover:bg-white/5">
                <X size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-xs p-3" style={{ color: 'var(--text-muted)' }}>No history yet</p>
            ) : (
              history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => { navigateTo(entry.url); setShowHistory(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 transition flex items-center gap-2"
                >
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{entry.title}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{entry.url}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
