import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy, Check, Pipette, Palette,
  Hash, Sliders, Trash2
} from 'lucide-react';

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

type PaletteType = 'complementary' | 'triadic' | 'analogous' | 'split';

function generatePalette(baseHue: number, type: PaletteType): string[] {
  const s = 80, v = 90;
  switch (type) {
    case 'complementary':
      return [baseHue, (baseHue + 180) % 360].map(h => rgbToHex(...hsvToRgb(h, s, v)));
    case 'triadic':
      return [0, 120, 240].map(o => rgbToHex(...hsvToRgb((baseHue + o) % 360, s, v)));
    case 'analogous':
      return [-30, 0, 30].map(o => rgbToHex(...hsvToRgb((baseHue + o + 360) % 360, s, v)));
    case 'split':
      return [0, 150, 210].map(o => rgbToHex(...hsvToRgb((baseHue + o) % 360, s, v)));
    default:
      return [];
  }
}

export default function ColorPicker() {
  const [hue, setHue] = useState(180);
  const [saturation, setSaturation] = useState(80);
  const [value, setValue] = useState(90);
  const [hexInput, setHexInput] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rogue_colors');
      return saved ? JSON.parse(saved) : ['#00F0FF', '#FF00A0', '#39FF14', '#F59E0B', '#8B5CF6'];
    } catch { return ['#00F0FF', '#FF00A0', '#39FF14', '#F59E0B', '#8B5CF6']; }
  });
  const [paletteType, setPaletteType] = useState<PaletteType>('complementary');
  const sbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const rgb = hsvToRgb(hue, saturation / 100, value / 100);
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);

  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  const addRecentColor = useCallback((c: string) => {
    setRecentColors(prev => {
      const next = [c, ...prev.filter(x => x !== c)].slice(0, 12);
      localStorage.setItem('rogue_colors', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => addRecentColor(hex), 500);
    return () => clearTimeout(timer);
  }, [hex, addRecentColor]);

  const copyValue = (val: string, field: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSbPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setSaturation(Math.round(x * 100));
    setValue(Math.round(y * 100));
  };

  const handleHexChange = (v: string) => {
    setHexInput(v);
    const rgb = hexToRgb(v);
    if (rgb) {
      const [r, g, b] = rgb;
      // Approximate HSV conversion
      const rp = r / 255, gp = g / 255, bp = b / 255;
      const max = Math.max(rp, gp, bp), min = Math.min(rp, gp, bp);
      const d = max - min;
      let h = 0;
      if (d !== 0) {
        switch (max) {
          case rp: h = ((gp - bp) / d + (gp < bp ? 6 : 0)) * 60; break;
          case gp: h = ((bp - rp) / d + 2) * 60; break;
          case bp: h = ((rp - gp) / d + 4) * 60; break;
        }
      }
      setHue(Math.round(h < 0 ? h + 360 : h));
      setSaturation(max === 0 ? 0 : Math.round((d / max) * 100));
      setValue(Math.round(max * 100));
    }
  };

  const randomColor = () => {
    const baseHue = Math.floor(Math.random() * 360);
    const harmony = ['complementary', 'triadic', 'analogous', 'split'][Math.floor(Math.random() * 4)] as PaletteType;
    const palette = generatePalette(baseHue, harmony);
    const pick = palette[Math.floor(Math.random() * palette.length)];
    handleHexChange(pick);
  };

  const palette = generatePalette(hue, paletteType);
  const cssCode = `color: ${hex};\nbackground-color: ${hex};\nborder-color: ${hex};`;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Main picker */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 overflow-auto">
        <div className="flex gap-6 items-start">
          {/* Saturation/Value Box */}
          <div className="flex flex-col gap-3">
            <div
              ref={sbRef}
              className="w-64 h-64 rounded-lg cursor-crosshair relative overflow-hidden"
              style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))` }}
              onPointerDown={e => { setIsDragging(true); handleSbPointer(e); }}
              onPointerMove={e => { if (isDragging) handleSbPointer(e); }}
              onPointerUp={() => setIsDragging(false)}
              onPointerLeave={() => setIsDragging(false)}
            >
              <div
                className="w-4 h-4 rounded-full border-2 absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  borderColor: value < 50 ? 'white' : 'black',
                  background: hex,
                  left: `${saturation}%`,
                  top: `${100 - value}%`,
                }}
              />
            </div>

            {/* Hue Slider */}
            <div
              className="h-6 rounded-full cursor-pointer relative"
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHue(Math.round(((e.clientX - rect.left) / rect.width) * 360));
              }}
            >
              <div
                className="absolute top-0 w-4 h-full rounded-full border-2 border-white shadow pointer-events-none"
                style={{ left: `${(hue / 360) * 100}%`, transform: 'translateX(-50%)' }}
              />
            </div>
          </div>

          {/* Preview & Values */}
          <div className="flex flex-col gap-3 w-56">
            {/* Preview */}
            <div
              className="w-full h-24 rounded-lg border flex items-center justify-center"
              style={{ background: hex, borderColor: 'var(--border-subtle)' }}
            >
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded"
                style={{
                  color: (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 128 ? '#000' : '#fff',
                  background: (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 128 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {hex}
              </span>
            </div>

            {/* HEX */}
            <div className="flex items-center gap-2">
              <Hash size={12} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={hexInput}
                onChange={e => handleHexChange(e.target.value)}
                className="flex-1 rounded px-2 py-1.5 text-xs border outline-none"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
              />
              <button onClick={() => copyValue(hex, 'hex')} className="p-1 rounded hover:bg-white/10">
                {copiedField === 'hex' ? <Check size={12} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>

            {/* RGB */}
            <div className="flex items-center gap-2">
              <Sliders size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] w-6" style={{ color: 'var(--text-muted)' }}>RGB</span>
              <span className="flex-1 text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {rgb[0]}, {rgb[1]}, {rgb[2]}
              </span>
              <button onClick={() => copyValue(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`, 'rgb')} className="p-1 rounded hover:bg-white/10">
                {copiedField === 'rgb' ? <Check size={12} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>

            {/* HSL */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] w-6 ml-5" style={{ color: 'var(--text-muted)' }}>HSL</span>
              <span className="flex-1 text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {hsl[0]}, {hsl[1]}%, {hsl[2]}%
              </span>
              <button onClick={() => copyValue(`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`, 'hsl')} className="p-1 rounded hover:bg-white/10">
                {copiedField === 'hsl' ? <Check size={12} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>

            {/* CSS Output */}
            <div className="rounded border p-2 relative" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-subtle)' }}>
              <pre className="text-[10px] leading-4" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{cssCode}</pre>
              <button onClick={() => copyValue(cssCode, 'css')} className="absolute top-1 right-1 p-1 rounded hover:bg-white/10">
                {copiedField === 'css' ? <Check size={10} style={{ color: 'var(--accent-lime)' }} /> : <Copy size={10} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>

            {/* Eyedropper */}
            <button
              onClick={randomColor}
              className="flex items-center justify-center gap-2 py-2 rounded text-xs border transition hover:bg-white/5"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <Pipette size={13} />
              Random Color
            </button>
          </div>
        </div>

        {/* Palette Generator */}
        <div className="mt-6 w-full max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={14} style={{ color: 'var(--accent-magenta)' }} />
            <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Palette</h3>
            <div className="flex items-center gap-1 ml-auto">
              {(['complementary', 'triadic', 'analogous', 'split'] as PaletteType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setPaletteType(t)}
                  className="px-2 py-0.5 rounded text-[10px] capitalize transition"
                  style={{
                    background: paletteType === t ? 'var(--bg-elevated)' : 'transparent',
                    color: paletteType === t ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: paletteType === t ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {palette.map((c, i) => (
              <button
                key={i}
                onClick={() => handleHexChange(c)}
                className="flex-1 h-12 rounded-lg border transition hover:scale-105"
                style={{ background: c, borderColor: 'var(--border-subtle)' }}
                title={c}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            {palette.map((c, i) => (
              <span key={i} className="flex-1 text-center text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Colors Sidebar */}
      <div className="w-48 flex flex-col border-l flex-shrink-0" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Recent</h3>
          <button
            onClick={() => { setRecentColors([]); localStorage.removeItem('rogue_colors'); }}
            className="p-1 rounded hover:bg-white/10"
          >
            <Trash2 size={11} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-3 gap-1.5">
            {recentColors.map((c, i) => (
              <button
                key={i}
                onClick={() => handleHexChange(c)}
                className="aspect-square rounded-md border transition hover:scale-110"
                style={{ background: c, borderColor: 'var(--border-subtle)' }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
