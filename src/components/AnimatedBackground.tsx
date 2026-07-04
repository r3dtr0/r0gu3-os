import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const blobs = [
      { x: 0.2, y: 0.3, rx: 0.4, ry: 0.35, color: 'rgba(0,240,255,', speed: 0.0003 },
      { x: 0.7, y: 0.2, rx: 0.35, ry: 0.3, color: 'rgba(255,0,160,', speed: 0.0004 },
      { x: 0.5, y: 0.7, rx: 0.3, ry: 0.4, color: 'rgba(57,255,20,', speed: 0.00035 },
      { x: 0.8, y: 0.6, rx: 0.25, ry: 0.25, color: 'rgba(139,92,246,', speed: 0.00045 },
      { x: 0.3, y: 0.8, rx: 0.35, ry: 0.2, color: 'rgba(255,107,0,', speed: 0.00038 },
    ]

    const animate = () => {
      time += 1
      const w = canvas.width
      const h = canvas.height

      ctx.fillStyle = '#080810'
      ctx.fillRect(0, 0, w, h)

      blobs.forEach(blob => {
        const bx = w * (blob.x + Math.sin(time * blob.speed) * 0.15)
        const by = h * (blob.y + Math.cos(time * blob.speed * 0.7) * 0.1)
        const brx = w * blob.rx
        const bry = h * blob.ry

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(brx, bry))
        grad.addColorStop(0, blob.color + '0.22)')
        grad.addColorStop(0.5, blob.color + '0.07)')
        grad.addColorStop(1, blob.color + '0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      ctx.strokeStyle = 'rgba(0,240,255,0.025)'
      ctx.lineWidth = 1
      const gridSize = 50
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ zIndex: 0 }} />
}
