import { useState, useEffect, useMemo } from 'react';
import {
  Wand2, Minimize2, Copy, Check, TreePine, FileCode,
  AlertTriangle, Eraser, Braces
} from 'lucide-react';

interface JsonError {
  message: string;
  line?: number;
}

const SAMPLE_JSON = `{
  "name": "R0GU3 OS",
  "version": "2.0.0",
  "author": "Rogue Developer",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/r0gu3/os.git"
  },
  "apps": [
    {
      "name": "Code Editor",
      "enabled": true,
      "language": "typescript"
    },
    {
      "name": "Music Player",
      "enabled": true,
      "language": "rust"
    },
    {
      "name": "File Manager",
      "enabled": false,
      "language": "go"
    }
  ],
  "features": {
    "darkMode": true,
    "multiWindow": true,
    "vfs": true,
    "plugins": ["terminal", "git", "docker"]
  },
  "stats": {
    "users": 15420,
    "apps": 25,
    "uptime": 99.9
  }
}`;

function highlightJson(json: string): string {
  if (!json) return '';
  let html = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#39ff14">$1</span>');
  // Keys (string followed by colon)
  html = html.replace(/(<span style="color:#39ff14">"[^"]*"<\/span>)(\s*:)/g, '<span style="color:#00f0ff">$1</span>$2');
  // Numbers
  html = html.replace(/:\s*(-?\d+\.?\d*([eE][+-]?\d+)?)/g, ': <span style="color:#f472b6">$1</span>');
  // Booleans and null
  html = html.replace(/:\s*(true|false|null)\b/g, ': <span style="color:#f59e0b">$1</span>');
  // Braces and brackets
  html = html.replace(/([{}[\]])/g, '<span style="color:#c084fc">$1</span>');

  return html;
}

interface TreeNodeProps {
  data: any;
  keyName?: string;
  depth: number;
}

function TreeNode({ data, keyName, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const indent = depth * 16;

  if (data === null) {
    return (
      <div className="text-xs" style={{ paddingLeft: indent }}>
        {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span style={{ color: '#f59e0b' }}>null</span>
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div className="text-xs" style={{ paddingLeft: indent }}>
        {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span style={{ color: '#f59e0b' }}>{String(data)}</span>
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div className="text-xs" style={{ paddingLeft: indent }}>
        {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span style={{ color: '#f472b6' }}>{data}</span>
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className="text-xs" style={{ paddingLeft: indent }}>
        {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
        {keyName && ': '}
        <span style={{ color: '#39ff14' }}>&quot;{data}&quot;</span>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div>
        <div
          className="text-xs cursor-pointer hover:bg-white/5 transition flex items-center gap-1"
          style={{ paddingLeft: indent }}
          onClick={() => setExpanded(!expanded)}
        >
          {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span style={{ color: '#c084fc' }}>[</span>
          <span style={{ color: 'var(--text-muted)' }}>{data.length} items</span>
          <span style={{ color: '#c084fc' }}>]</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{expanded ? '▼' : '▶'}</span>
        </div>
        {expanded && data.map((item, i) => (
          <TreeNode key={i} data={item} depth={depth + 1} />
        ))}
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return (
      <div>
        <div
          className="text-xs cursor-pointer hover:bg-white/5 transition flex items-center gap-1"
          style={{ paddingLeft: indent }}
          onClick={() => setExpanded(!expanded)}
        >
          {keyName && <span style={{ color: '#00f0ff' }}>&quot;{keyName}&quot;</span>}
          {keyName && ': '}
          <span style={{ color: '#c084fc' }}>{'{'}</span>
          <span style={{ color: 'var(--text-muted)' }}>{keys.length} keys</span>
          <span style={{ color: '#c084fc' }}>{'}'}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{expanded ? '▼' : '▶'}</span>
        </div>
        {expanded && keys.map(k => (
          <TreeNode key={k} data={data[k]} keyName={k} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return null;
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<JsonError | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'tree'>('raw');
  const [copied, setCopied] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const formatJson = () => {
    try {
      if (!input.trim()) { setOutput(''); setError(null); setParsedData(null); return; }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setParsedData(parsed);
      setError(null);
    } catch (e: any) {
      const match = e.message.match(/at position (\d+)/);
      const pos = match ? parseInt(match[1]) : undefined;
      const line = pos !== undefined ? input.slice(0, pos).split('\n').length : undefined;
      setError({ message: e.message, line });
      setParsedData(null);
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setParsedData(parsed);
      setError(null);
    } catch (e: any) {
      setError({ message: e.message });
    }
  };

  const loadSample = () => {
    setInput(SAMPLE_JSON);
    setOutput(JSON.stringify(JSON.parse(SAMPLE_JSON), null, 2));
    setParsedData(JSON.parse(SAMPLE_JSON));
    setError(null);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setParsedData(null);
  };

  useEffect(() => {
    if (input) {
      const timer = setTimeout(formatJson, 500);
      return () => clearTimeout(timer);
    }
  }, [input]);

  const highlightedOutput = useMemo(() => highlightJson(output), [output]);
  const lineCount = output ? output.split('\n').length : 1;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center gap-1">
          <button
            onClick={formatJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition hover:bg-white/5"
            style={{ color: 'var(--accent-cyan)' }}
          >
            <Wand2 size={13} />
            Prettify
          </button>
          <button
            onClick={minifyJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Minimize2 size={13} />
            Minify
          </button>
          <button
            onClick={loadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition hover:bg-white/5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Braces size={13} />
            Sample
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <Eraser size={13} />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px]" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              <AlertTriangle size={12} />
              Line {error.line}: {error.message}
            </div>
          )}
          <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
            {(['raw', 'tree'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className="px-3 py-1 text-xs capitalize transition flex items-center gap-1"
                style={{
                  background: viewMode === v ? 'var(--bg-elevated)' : 'transparent',
                  color: viewMode === v ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {v === 'raw' ? <FileCode size={11} /> : <TreePine size={11} />}
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={copyOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition hover:bg-white/5"
            style={{ color: copied ? 'var(--accent-lime)' : 'var(--text-secondary)' }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex-1 flex min-h-0">
        {/* Input */}
        <div className="flex-1 flex flex-col border-r" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}>Input</div>
          <div className="flex-1 flex relative">
            {/* Line numbers */}
            <div className="flex-shrink-0 py-2 text-right select-none" style={{ background: 'var(--bg-tertiary)', minWidth: 40 }}>
              {Array.from({ length: Math.max(input.split('\n').length, 1) }, (_, i) => (
                <div key={i} className="px-2 text-[11px] leading-5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 bg-transparent outline-none resize-none p-2 text-xs leading-5"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', tabSize: 2 }}
              placeholder="Paste your JSON here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex-1 flex flex-col">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}>
            <span>Output</span>
            <span>{lineCount} lines</span>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {viewMode === 'raw' ? (
              <pre
                className="text-xs leading-5"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: highlightedOutput || '<span style="color:var(--text-muted)">Formatted output will appear here...</span>' }}
              />
            ) : parsedData ? (
              <div className="py-1">
                <TreeNode data={parsedData} depth={0} />
              </div>
            ) : (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Valid JSON required for tree view...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
