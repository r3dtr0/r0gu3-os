import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle,
  Repeat, Repeat1, Volume2, VolumeX, ListMusic, Heart
} from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number; // seconds
  album: string;
  color1: string;
  color2: string;
}

const TRACKS: Track[] = [
  { id: 1, title: 'Neon Dreams', artist: 'Cyberwave', duration: 234, album: 'Midnight Protocol', color1: '#00f0ff', color2: '#ff00a0' },
  { id: 2, title: 'Digital Rain', artist: 'SynthRunner', duration: 198, album: 'Mainframe', color1: '#39ff14', color2: '#00f0ff' },
  { id: 3, title: 'Ghost in the Shell', artist: 'NeonPulse', duration: 267, album: 'Ghost Protocol', color1: '#ff00a0', color2: '#ff6b6b' },
  { id: 4, title: 'Binary Sunset', artist: 'CodeWalker', duration: 312, album: 'Horizon Zero', color1: '#f59e0b', color2: '#ff00a0' },
  { id: 5, title: 'System Override', artist: 'GlitchMob', duration: 185, album: 'Kernel Panic', color1: '#8b5cf6', color2: '#00f0ff' },
  { id: 6, title: 'Data Stream', artist: 'ByteRunner', duration: 245, album: 'Bandwidth', color1: '#10b981', color2: '#39ff14' },
  { id: 7, title: 'Firewall Breach', artist: 'NetRunner', duration: 203, album: 'Zero Day', color1: '#ef4444', color2: '#f59e0b' },
  { id: 8, title: 'Quantum Echo', artist: 'WaveForm', duration: 289, album: 'Entangled', color1: '#06b6d4', color2: '#8b5cf6' },
  { id: 9, title: 'Silicon Soul', artist: 'MachineHeart', duration: 221, album: 'Sentient', color1: '#ec4899', color2: '#f472b6' },
  { id: 10, title: 'Terminal Velocity', artist: 'SpeedCode', duration: 176, album: 'Overclocked', color1: '#22c55e', color2: '#10b981' },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const progressInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // Simulate progress
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= currentTrack.duration) {
            handleTrackEnd();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, currentTrack]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      setProgress(0);
    } else if (shuffle) {
      const idx = Math.floor(Math.random() * TRACKS.length);
      setCurrentTrack(TRACKS[idx]);
      setProgress(0);
    } else {
      const idx = TRACKS.findIndex(t => t.id === currentTrack.id);
      const next = TRACKS[(idx + 1) % TRACKS.length];
      setCurrentTrack(next);
      setProgress(0);
    }
  }, [repeatMode, shuffle, currentTrack]);

  // Canvas visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const barCount = 64;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        let height: number;
        if (isPlaying) {
          height = Math.abs(Math.sin(time + i * 0.15)) * 0.6 + Math.abs(Math.cos(time * 1.5 + i * 0.08)) * 0.4;
          height *= canvas.height * 0.85;
        } else {
          height = Math.abs(Math.sin(i * 0.15)) * canvas.height * 0.15;
        }

        const x = i * barWidth;
        const y = canvas.height - height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, y);
        gradient.addColorStop(0, currentTrack.color1 + '88');
        gradient.addColorStop(1, currentTrack.color2 + 'cc');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, height);

        // Cap
        ctx.fillStyle = currentTrack.color2;
        ctx.fillRect(x + 1, y - 3, barWidth - 2, 3);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, currentTrack]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const playTrack = (track: Track) => {
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const prevTrack = () => {
    const idx = TRACKS.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(TRACKS[(idx - 1 + TRACKS.length) % TRACKS.length]);
    setProgress(0);
  };

  const nextTrack = () => {
    const idx = TRACKS.findIndex(t => t.id === currentTrack.id);
    setCurrentTrack(TRACKS[(idx + 1) % TRACKS.length]);
    setProgress(0);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Main Player */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 min-w-0">
        {/* Album Art */}
        <div
          className="w-64 h-64 rounded-xl shadow-2xl mb-6 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.color1}33, ${currentTrack.color2}33)`,
            border: `1px solid ${currentTrack.color1}44`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${currentTrack.color1}44, transparent 60%)`,
            }}
          />
          <div className="relative z-10 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${currentTrack.color1}, ${currentTrack.color2})` }}
            >
              <ListMusic size={32} style={{ color: 'white' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{currentTrack.album}</p>
          </div>
        </div>

        {/* Track Info */}
        <h2 className="text-xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>{currentTrack.title}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{currentTrack.artist}</p>

        {/* Visualizer */}
        <div className="w-full max-w-md mt-4 h-16">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {/* Progress */}
        <div className="w-full max-w-md mt-2">
          <input
            type="range"
            min={0}
            max={currentTrack.duration}
            value={progress}
            onChange={seek}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-cyan) ${(progress / currentTrack.duration) * 100}%, var(--border-subtle) ${(progress / currentTrack.duration) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatTime(progress)}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => setShuffle(!shuffle)}
            className="p-2 rounded-full transition"
            style={{ color: shuffle ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
          >
            <Shuffle size={18} />
          </button>

          <button onClick={prevTrack} className="p-2 rounded-full hover:bg-white/5 transition" style={{ color: 'var(--text-primary)' }}>
            <SkipBack size={22} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 rounded-full transition"
            style={{ background: 'var(--accent-cyan)', color: '#000' }}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>

          <button onClick={nextTrack} className="p-2 rounded-full hover:bg-white/5 transition" style={{ color: 'var(--text-primary)' }}>
            <SkipForward size={22} />
          </button>

          <button
            onClick={() => setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none')}
            className="p-2 rounded-full transition"
            style={{ color: repeatMode !== 'none' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-4 w-full max-w-xs">
          <button
            onClick={() => setVolume(v => v === 0 ? 0.7 : 0)}
            style={{ color: 'var(--text-muted)' }}
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--accent-cyan) ${volume * 100}%, var(--border-subtle) ${volume * 100}%)`,
            }}
          />
          <span className="text-[11px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Playlist */}
      <div
        className="w-80 flex flex-col border-l flex-shrink-0"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-tertiary)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Playlist</h3>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{TRACKS.length} tracks</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {TRACKS.map((track, i) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition hover:bg-white/5 group"
              style={{
                background: currentTrack.id === track.id ? 'rgba(0,240,255,0.06)' : undefined,
              }}
            >
              {/* Track number / Playing indicator */}
              <div className="w-6 text-center flex-shrink-0">
                {currentTrack.id === track.id && isPlaying ? (
                  <div className="flex items-end justify-center gap-0.5 h-4">
                    {[0.4, 0.7, 0.5, 0.8].map((h, j) => (
                      <div
                        key={j}
                        className="w-0.5 rounded-full"
                        style={{
                          background: 'var(--accent-cyan)',
                          height: `${h * 16}px`,
                          animation: `pulse 0.5s ease-in-out ${j * 0.1}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                )}
              </div>

              {/* Mini gradient */}
              <div
                className="w-8 h-8 rounded flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${track.color1}, ${track.color2})` }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: currentTrack.id === track.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                  {track.title}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
              </div>

              {/* Duration */}
              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatTime(track.duration)}</span>

              {/* Favorite */}
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition"
                style={{ color: favorites.has(track.id) ? 'var(--accent-magenta)' : 'var(--text-muted)' }}
              >
                <Heart size={12} fill={favorites.has(track.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          from { height: 4px; }
          to { height: 16px; }
        }
      `}</style>
    </div>
  );
}
