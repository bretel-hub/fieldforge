'use client'

import { useEffect, useRef } from 'react'

interface ConfettiCelebrationProps {
  onComplete: () => void
}

const COLORS = ['#f43f5e', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#fb923c', '#e879f9']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  width: number
  height: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

export function ConfettiCelebration({ onComplete }: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      width: Math.random() * 12 + 6,
      height: Math.random() * 6 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }))

    const startTime = Date.now()
    const duration = 3500

    function draw() {
      if (!ctx || !canvas) return
      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.rotation += p.rotationSpeed
        p.opacity = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        ctx.restore()

        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
          p.vy = Math.random() * 4 + 2
        }
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
      <div className="relative z-10 text-center animate-bounce pointer-events-auto">
        <div className="bg-white rounded-2xl px-12 py-10 shadow-2xl border-4 border-green-400">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Proposal Approved!</h2>
          <p className="text-lg text-gray-600 mb-1">Congratulations!</p>
          <p className="text-sm text-gray-500">A new job has been created automatically.</p>
        </div>
      </div>
    </div>
  )
}
