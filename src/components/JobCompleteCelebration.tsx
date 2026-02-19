'use client'

import { useEffect, useRef } from 'react'

interface JobCompleteCelebrationProps {
  onComplete: () => void
}

const COLORS = ['#22c55e', '#16a34a', '#86efac', '#fde047', '#facc15', '#a3e635', '#34d399', '#ffffff']

interface Particle {
  x: number
  y: number
  angle: number
  speed: number
  color: string
  size: number
  opacity: number
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const innerAngle = outerAngle + (2 * Math.PI) / 10
    if (i === 0) ctx.moveTo(x + size * Math.cos(outerAngle), y + size * Math.sin(outerAngle))
    else ctx.lineTo(x + size * Math.cos(outerAngle), y + size * Math.sin(outerAngle))
    ctx.lineTo(x + (size * 0.4) * Math.cos(innerAngle), y + (size * 0.4) * Math.sin(innerAngle))
  }
  ctx.closePath()
  ctx.fill()
}

export function JobCompleteCelebration({ onComplete }: JobCompleteCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    const particles: Particle[] = Array.from({ length: 100 }, () => ({
      x: cx,
      y: cy,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 10 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      opacity: 1,
    }))

    const startTime = Date.now()
    const duration = 2800

    function draw() {
      if (!ctx || !canvas) return
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed
        p.speed *= 0.96
        p.opacity = progress > 0.55 ? 1 - (progress - 0.55) / 0.45 : 1

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        drawStar(ctx, p.x, p.y, p.size)
        ctx.restore()
      })

      if (elapsed < duration) {
        animationRef.current = requestAnimationFrame(draw)
      } else {
        onComplete()
      }
    }

    animationRef.current = requestAnimationFrame(draw)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 text-center pointer-events-auto">
        <div className="bg-white rounded-2xl px-12 py-10 shadow-2xl border-4 border-green-500 animate-bounce">
          <div className="text-7xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Job Complete!</h2>
          <p className="text-lg text-green-600 mb-1">Outstanding work!</p>
          <p className="text-sm text-gray-500">This job has been marked as complete.</p>
        </div>
      </div>
    </div>
  )
}
