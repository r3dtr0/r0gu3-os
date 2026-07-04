import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Folder, FolderOpen, FileCode, FileJson, FileType,
  Save, Search, ChevronRight, ChevronDown,
  Plus, X, GripVertical
} from 'lucide-react';
import {
  getVfs, readFile, writeFile, getFileExtension, getLanguageFromExt,
  type VfsNode
} from '../../core/filesystem';

// Simple syntax highlighter
function highlightCode(code: string, language: string): string {
  if (!code) return '';
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'javascript' || language === 'typescript' || language === 'json') {
    html = html
      .replace(/(\/\/.*$)/gm, '<span style="color:#6b7280">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280">$1</span>')
      .replace(/\b(const|let|var|function|return|import|export|from|default|class|interface|type|if|else|for|while|switch|case|break|new|this|async|await|try|catch)\b/g, '<span style="color:#c084fc">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g, '<span style="color:#f59e0b">$1</span>')
      .replace(/('.*?'|".*?"|`[\s\S]*?`)/g, '<span style="color:#39ff14">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f472b6">$1</span>');
  } else if (language === 'html' || language === 'xml') {
    html = html
      .replace(/(&lt;\/?[\w-]+)/g, '<span style="color:#f59e0b">$1</span>')
      .replace(/(\s[\w-]+)(=)/g, '<span style="color:#00f0ff">$1</span>$2')
      .replace(/(&quot;.*?&quot;)/g, '<span style="color:#39ff14">$1</span>');
  } else if (language === 'css') {
    html = html
      .replace(/([\w-]+)(\s*:)/g, '<span style="color:#00f0ff">$1</span>$2')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280">$1</span>')
      .replace(/([.#][\w-]+)/g, '<span style="color:#f59e0b">$1</span>');
  } else if (language === 'python') {
    html = html
      .replace(/(#.*$)/gm, '<span style="color:#6b7280">$1</span>')
      .replace(/\b(def|class|return|import|from|if|elif|else|for|while|try|except|with|as|lambda|None|True|False|self|pass)\b/g, '<span style="color:#c084fc">$1</span>')
      .replace(/('.*?'|".*?")/g, '<span style="color:#39ff14">$1</span>');
  }

  return html;
}

interface OpenFile {
  path: string;
  content: string;
  language: string;
  dirty: boolean;
}

function getFileIcon(name: string) {
  const ext = getFileExtension(name);
  if (ext === '.json') return <FileJson size={14} style={{ color: '#f59e0b' }} />;
  if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) return <FileCode size={14} style={{ color: '#00f0ff' }} />;
  if (['.css', '.scss'].includes(ext)) return <FileType size={14} style={{ color: '#c084fc' }} />;
  if (['.html', '.htm'].includes(ext)) return <FileType size={14} style={{ color: '#ff6b6b' }} />;
  if (['.py'].includes(ext)) return <FileCode size={14} style={{ color: '#f59e0b' }} />;
  return <FileCode size={14} style={{ color: 'var(--text-muted)' }} />;
}

export default function CodeEditor() {
  const [vfs, setVfs] = useState<VfsNode[]>(getVfs);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src']));
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [showMinimap] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  const activeFile = openFiles.find(f => f.path === activeFilePath);

  const refreshVfs = () => setVfs([...getVfs()]);
  void refreshVfs;

  const openFileFromTree = (path: string) => {
    const existing = openFiles.find(f => f.path === path);
    if (existing) {
      setActiveFilePath(path);
      return;
    }
    const content = readFile(path);
    if (content !== null) {
      const ext = getFileExtension(path.split('/').pop() || '');
      const language = getLanguageFromExt(ext);
      setOpenFiles(prev => [...prev, { path, content, language, dirty: false }]);
      setActiveFilePath(path);
    }
  };

  const closeFile = (path: string) => {
    setOpenFiles(prev => {
      const filtered = prev.filter(f => f.path !== path);
      if (activeFilePath === path) {
        setActiveFilePath(filtered[filtered.length - 1]?.path || null);
      }
      return filtered;
    });
  };

  const updateFileContent = (path: string, content: string) => {
    setOpenFiles(prev => prev.map(f =>
      f.path === path ? { ...f, content, dirty: true } : f
    ));
  };

  const saveActiveFile = useCallback(() => {
    if (activeFile) {
      writeFile(activeFile.path, activeFile.content);
      setOpenFiles(prev => prev.map(f =>
        f.path === activeFile.path ? { ...f, dirty: false } : f
      ));
    }
  }, [activeFile]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveActiveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveActiveFile]);

  const handleCursorChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const text = textarea.value.substring(0, pos);
    const lines = text.split('\n');
    setCursorLine(lines.length);
    setCursorCol(lines[lines.length - 1].length + 1);
  };

  const toggleDir = (name: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const lineCount = useMemo(() => {
    return (activeFile?.content || '').split('\n').length;
  }, [activeFile?.content]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);
  }, [lineCount]);

  const highlightedCode = useMemo(() => {
    if (!activeFile) return '';
    return highlightCode(activeFile.content, activeFile.language);
  }, [activeFile?.content, activeFile?.language]);

  const renderTree = (nodes: VfsNode[], path: string = '') => {
    return nodes.map(node => {
      const nodePath = path ? `${path}/${node.name}` : node.name;
      if (node.type === 'directory') {
        const isExpanded = expandedDirs.has(nodePath);
        return (
          <div key={nodePath}>
            <div
              className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-white/5 transition text-xs"
              onClick={() => toggleDir(nodePath)}
            >
              {isExpanded ? <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />}
              {isExpanded ? <FolderOpen size={13} style={{ color: '#f59e0b' }} /> : <Folder size={13} style={{ color: '#f59e0b' }} />}
              <span style={{ color: 'var(--text-secondary)' }}>{node.name}</span>
            </div>
            {isExpanded && node.children && (
              <div className="ml-3">
                {renderTree(node.children, nodePath)}
              </div>
            )}
          </div>
        );
      }
      return (
        <div
          key={nodePath}
          className="flex items-center gap-1.5 px-2 py-0.5 cursor-pointer hover:bg-white/5 transition text-xs"
          style={{
            background: activeFilePath === nodePath ? 'rgba(0,240,255,0.08)' : undefined,
            borderLeft: activeFilePath === nodePath ? '2px solid var(--accent-cyan)' : '2px solid transparent',
          }}
          onClick={() => openFileFromTree(nodePath)}
        >
          {getFileIcon(node.name)}
          <span style={{ color: activeFilePath === nodePath ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{node.name}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* File Explorer */}
      <div className="w-52 flex flex-col border-r flex-shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Explorer</span>
          <div className="flex gap-1">
            <button className="p-1 rounded hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
              <Plus size={12} />
            </button>
            <button className="p-1 rounded hover:bg-white/10" style={{ color: 'var(--text-muted)' }}>
              <Search size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {renderTree(vfs)}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        {openFiles.length > 0 && (
          <div className="flex items-center overflow-x-auto border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
            {openFiles.map(file => (
              <div
                key={file.path}
                onClick={() => setActiveFilePath(file.path)}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs border-r transition min-w-0"
                style={{
                  background: activeFilePath === file.path ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  borderColor: 'var(--border-subtle)',
                  color: activeFilePath === file.path ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {getFileIcon(file.path.split('/').pop() || '')}
                <span className="truncate max-w-[120px]">{file.path.split('/').pop()}</span>
                {file.dirty && <span style={{ color: 'var(--accent-cyan)' }}>•</span>}
                <button
                  onClick={e => { e.stopPropagation(); closeFile(file.path); }}
                  className="p-0.5 rounded hover:bg-white/10 ml-1"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        {activeFile ? (
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex flex-1 overflow-hidden">
              {/* Line Numbers */}
              <div
                ref={lineNumbersRef}
                className="flex-shrink-0 overflow-hidden py-3 text-right select-none"
                style={{ background: 'var(--bg-secondary)', minWidth: 48 }}
              >
                {lineNumbers.map(n => (
                  <div
                    key={n}
                    className="px-2 text-xs leading-6"
                    style={{
                      color: n === cursorLine ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={activeFile.content}
                  onChange={e => updateFileContent(activeFile.path, e.target.value)}
                  onKeyUp={handleCursorChange}
                  onClick={handleCursorChange}
                  className="absolute inset-0 w-full h-full bg-transparent outline-none resize-none p-3 text-xs leading-6"
                  style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    zIndex: 2,
                    caretColor: 'var(--accent-cyan)',
                    tabSize: 2,
                  }}
                  spellCheck={false}
                />
              </div>

              {/* Minimap */}
              {showMinimap && (
                <div
                  className="flex-shrink-0 overflow-hidden py-3 px-1 border-l hidden lg:block"
                  style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)', width: 80 }}
                >
                  <div
                    className="text-[6px] leading-[8px] break-all whitespace-pre-wrap opacity-40"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    dangerouslySetInnerHTML={{ __html: highlightedCode }}
                  />
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div
              className="flex items-center justify-between px-3 py-1 text-[11px] border-t"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            >
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <GripVertical size={10} />
                  Ln {cursorLine}, Col {cursorCol}
                </span>
                <span className="uppercase">{activeFile.language}</span>
                <span>UTF-8</span>
                {activeFile.dirty && <span style={{ color: 'var(--accent-cyan)' }}>Unsaved</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveActiveFile}
                  className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition"
                  style={{ color: 'var(--accent-cyan)' }}
                  title="Ctrl+S"
                >
                  <Save size={10} />
                  Save
                </button>
                <span>{activeFile.content.length} chars</span>
                <span>{lineCount} lines</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileCode size={64} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>Open a file from the explorer to start editing</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Press Ctrl+S to save</p>
          </div>
        )}
      </div>
    </div>
  );
}
