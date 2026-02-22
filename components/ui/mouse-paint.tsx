"use client"

import { useEffect, useRef } from "react"

interface Point {
    x: number
    y: number
    age: number
    width: number
}

const MAX_POINTS = 80
const BASE_WIDTH = 22
const MIN_WIDTH = 2

export default function MousePaint() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // ── Size canvas to match parent element exactly ───────────────────────────
        const syncSize = () => {
            const parent = canvas.parentElement
            if (!parent) return
            canvas.width = parent.offsetWidth
            canvas.height = parent.offsetHeight
        }
        syncSize()

        const ro = new ResizeObserver(syncSize)
        ro.observe(canvas.parentElement!)

        // ── State ─────────────────────────────────────────────────────────────────
        const points: Point[] = []
        let prevX = -1
        let prevY = -1

        // ── Mouse handler — coordinates relative to the canvas ───────────────────
        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top

            // Ignore positions outside the canvas bounds
            if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return

            let speed = 0
            if (prevX !== -1) {
                const dx = x - prevX
                const dy = y - prevY
                speed = Math.sqrt(dx * dx + dy * dy)
            }

            // Slow = thick, fast = thin
            const strokeWidth = Math.max(MIN_WIDTH, BASE_WIDTH - speed * 0.32)
            points.push({ x, y, age: 0, width: strokeWidth })
            if (points.length > MAX_POINTS) points.shift()

            prevX = x
            prevY = y
        }

        // Listen on the canvas parent so the event fires over child elements too
        const section = canvas.parentElement!
        section.addEventListener("mousemove", onMouseMove)

        // ── Catmull-Rom spline interpolation ──────────────────────────────────────
        const catmullRom = (
            p0: Point, p1: Point, p2: Point, p3: Point, t: number
        ) => {
            const t2 = t * t
            const t3 = t2 * t
            return {
                x:
                    0.5 *
                    (2 * p1.x +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                y:
                    0.5 *
                    (2 * p1.y +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
            }
        }

        // ── Render loop ───────────────────────────────────────────────────────────
        let rafId: number

        const draw = () => {
            rafId = requestAnimationFrame(draw)

            // Age all points; remove expired ones
            for (const p of points) p.age++
            while (points.length > 0 && points[0].age > MAX_POINTS) points.shift()

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const len = points.length
            if (len < 2) return

            for (let i = 1; i < len - 1; i++) {
                const p0 = points[Math.max(0, i - 1)]
                const p1 = points[i]
                const p2 = points[Math.min(len - 1, i + 1)]
                const p3 = points[Math.min(len - 1, i + 2)]

                // progress 0 (oldest/tail) → 1 (newest/tip)
                const progress = i / len
                const ageFade = 1 - p1.age / MAX_POINTS
                const alpha = Math.pow(progress, 1.8) * ageFade
                if (alpha <= 0) continue

                const strokeW = Math.max(MIN_WIDTH * progress, p1.width * progress)

                // Draw spline segment as short sub-steps for smoothness
                const STEPS = 8
                for (let s = 0; s < STEPS; s++) {
                    const a = catmullRom(p0, p1, p2, p3, s / STEPS)
                    const b = catmullRom(p0, p1, p2, p3, (s + 1) / STEPS)

                    ctx.beginPath()
                    ctx.moveTo(a.x, a.y)
                    ctx.lineTo(b.x, b.y)
                    ctx.strokeStyle = `rgba(0,0,0,${alpha.toFixed(3)})`
                    ctx.lineWidth = strokeW
                    ctx.lineCap = "round"
                    ctx.lineJoin = "round"
                    ctx.stroke()
                }
            }

            // Soft ink-blob at the live cursor tip
            const tip = points[len - 1]
            if (tip) {
                const r = tip.width * 0.75
                const grad = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r)
                grad.addColorStop(0, "rgba(0,0,0,0.5)")
                grad.addColorStop(1, "rgba(0,0,0,0)")
                ctx.beginPath()
                ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2)
                ctx.fillStyle = grad
                ctx.fill()
            }
        }

        draw()

        return () => {
            cancelAnimationFrame(rafId)
            section.removeEventListener("mousemove", onMouseMove)
            ro.disconnect()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
        />
    )
}
