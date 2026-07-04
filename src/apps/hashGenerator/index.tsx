import { useState, useEffect, useRef } from 'react';
import {
  Hash, Copy, Check, Upload,
  Equal, XCircle
} from 'lucide-react';

// Simple hash implementations (for demo/compat since crypto-js isn't in deps)
// We'll use Web Crypto API where available, with fallbacks

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha512(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// MD5 implementation
function md5(message: string): string {
  const K: number[] = [];
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }

  const utf8Encode = (str: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) bytes.push(c);
      else if (c < 0x800) { bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
      else if (c < 0xd800 || c >= 0xe000) { bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
      else { i++; c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff)); bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    }
    return bytes;
  };

  const bytes = utf8Encode(message);
  const originalLength = bytes.length * 8;

  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);

  for (let i = 0; i < 8; i++) bytes.push((originalLength >>> (i * 8)) & 0xff);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  const leftRotate = (x: number, c: number) => (x << c) | (x >>> (32 - c));

  for (let i = 0; i < bytes.length; i += 64) {
    const w: number[] = [];
    for (let j = 0; j < 16; j++) {
      w[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    }

    let [a, b, c, d] = [a0, b0, c0, d0];

    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) { f = (b & c) | ((~b) & d); g = j; }
      else if (j < 32) { f = (d & b) | ((~d) & c); g = (5 * j + 1) % 16; }
      else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16; }
      else { f = c ^ (b | (~d)); g = (7 * j) % 16; }

      const temp = d;
      d = c; c = b;
      b = b + leftRotate((a + f + K[j] + w[g]), [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21][j]);
      a = temp;
    }

    a0 += a; b0 += b; c0 += c; d0 += d;
  }

  const toHex = (n: number) => {
    const bytes = [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult | null>(null);
  const [compareHash, setCompareHash] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!input) { setHashes(null); return; }
    const compute = async () => {
      const [md5Hash, sha1Hash, sha256Hash, sha512Hash] = await Promise.all([
        Promise.resolve(md5(input)),
        sha1(input),
        sha256(input),
        sha512(input),
      ]);
      setHashes({ md5: md5Hash, sha1: sha1Hash, sha256: sha256Hash, sha512: sha512Hash });
    };
    compute();
  }, [input]);

  const copyValue = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) setInput(text);
    };
    reader.readAsText(file);
  };

  const matchesCompare = (hash: string) => {
    if (!compareHash.trim()) return null;
    return hash.toLowerCase() === compareHash.trim().toLowerCase();
  };

  const hashEntries = hashes ? [
    { key: 'md5' as const, label: 'MD5', value: hashes.md5, color: '#f59e0b' },
    { key: 'sha1' as const, label: 'SHA-1', value: hashes.sha1, color: '#8b5cf6' },
    { key: 'sha256' as const, label: 'SHA-256', value: hashes.sha256, color: '#00f0ff' },
    { key: 'sha512' as const, label: 'SHA-512', value: hashes.sha512, color: '#39ff14' },
  ] : [];

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Input Panel */}
      <div className="w-1/2 flex flex-col border-r" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Input</h3>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] border transition hover:bg-white/5"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <Upload size={11} />
              Upload File
            </button>
            {fileName && (
              <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                {fileName}
              </span>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none resize-none p-4 text-xs leading-relaxed"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          placeholder="Enter text to hash..."
          spellCheck={false}
        />
        <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{input.length} characters</span>
          <button
            onClick={() => { setInput(''); setFileName(''); }}
            className="text-[11px] px-2 py-0.5 rounded hover:bg-white/5 transition"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="w-1/2 flex flex-col">
        {/* Compare bar */}
        <div className="px-4 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
          <Hash size={13} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={compareHash}
            onChange={e => setCompareHash(e.target.value)}
            placeholder="Compare with a hash..."
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          />
          {compareHash && (
            <>
              {hashes && Object.values(hashes).some(h => h.toLowerCase() === compareHash.trim().toLowerCase()) ? (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#10b981' }}>
                  <Equal size={11} /> Match found
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#ef4444' }}>
                  <XCircle size={11} /> No match
                </span>
              )}
            </>
          )}
        </div>

        {/* Hash Results */}
        <div className="flex-1 overflow-y-auto">
          {!hashes ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Hash size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Type something to generate hashes</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {hashEntries.map(({ key, label, value, color }) => {
                const matchResult = matchesCompare(value);
                return (
                  <div
                    key={key}
                    className="rounded-lg border p-3 transition"
                    style={{
                      borderColor: matchResult === true ? '#10b981' : matchResult === false && compareHash ? '#ef4444' : 'var(--border-subtle)',
                      background: matchResult === true ? 'rgba(16,185,129,0.05)' : matchResult === false && compareHash ? 'rgba(239,68,68,0.05)' : 'var(--bg-tertiary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: color + '22', color }}
                        >
                          {label}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{value.length} chars</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {matchResult !== null && (
                          matchResult ? (
                            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#10b981' }}>
                              <Equal size={10} /> Match
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[10px]" style={{ color: '#ef4444' }}>
                              <XCircle size={10} />
                            </span>
                          )
                        )}
                        <button
                          onClick={() => copyValue(value, key)}
                          className="p-1 rounded hover:bg-white/10 transition"
                          style={{ color: copiedField === key ? '#10b981' : 'var(--text-muted)' }}
                        >
                          {copiedField === key ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                    <div
                      className="text-[11px] break-all leading-relaxed"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
