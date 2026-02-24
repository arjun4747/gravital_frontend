"use client"

import { useEffect, useRef } from "react"

// ── tunables ──────────────────────────────────────────────────────────────────
const CELL_SIZE = 12        // px — side length of each square
const GAP = 3         // px — gap between squares
const STEP = CELL_SIZE + GAP

// Only excite cells within this px radius of the cursor
const RADIUS = 80

// Excitation added per frame at the cursor centre (falls off with distance²)
const EXCITE = 0.7

// Multiplicative decay per frame (~60 frames to reach ~THRESHOLD from 1.0)
const DECAY = 0.91

// Cells below this value are considered invisible and skipped
const THRESHOLD = 0.015

// After this many ms without mousemove, treat mouse as "stopped"
const IDLE_MS = 40

const CORNER_R = 2         // rounded corner radius (px)

// ── GitHub green palette (4-stop ramp) ───────────────────────────────────────
// Mirrors #0e4429 → #006d32 → #26a641 → #39d353
const STOPS = [
    { r: 14, g: 68, b: 41 },   // dim
    { r: 0, g: 109, b: 50 },   // mid
    { r: 38, g: 166, b: 65 },   // bright
    { r: 57, g: 211, b: 83 },   // peak
] as const

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clamp(v: number, lo: number, hi: number) {
    return v < lo ? lo : v > hi ? hi : v
}

/** Map val ∈ [0,1] → RGBA string using the 4-stop ramp */
function toColor(val: number): string {
    const n = STOPS.length - 1          // 3
    const t = val * n                   // 0..3
    const i = clamp(Math.floor(t), 0, n - 1)
    const s = t - i                     // fractional part
    const A = STOPS[i]
    const B = STOPS[i + 1]
    const r = Math.round(lerp(A.r, B.r, s))
    const g = Math.round(lerp(A.g, B.g, s))
    const b = Math.round(lerp(A.b, B.b, s))
    const a = clamp(val * 1.15, 0, 1)   // alpha also scales with brightness
    return `rgba(${r},${g},${b},${a.toFixed(3)})`
}

// ── types ─────────────────────────────────────────────────────────────────────
interface Cell {
    cx: number   // centre-x on canvas
    cy: number   // centre-y on canvas
    val: number   // current activation [0, 1]
}

// ── component ─────────────────────────────────────────────────────────────────
export default function ContributionGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) return

        // ── grid ─────────────────────────────────────────────────────────────────
        let cells: Cell[] = []

        const buildGrid = () => {
            const parent = canvas.parentElement
            if (!parent) return
            canvas.width = parent.offsetWidth
            canvas.height = parent.offsetHeight

            const cols = Math.ceil(canvas.width / STEP) + 1
            const rows = Math.ceil(canvas.height / STEP) + 1

            // Keep existing activation values so a resize doesn't wipe the trail
            const prev = new Map(cells.map(c => [`${c.cx}:${c.cy}`, c.val]))
            cells = []
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cx = c * STEP + CELL_SIZE / 2
                    const cy = r * STEP + CELL_SIZE / 2
                    cells.push({ cx, cy, val: prev.get(`${cx}:${cy}`) ?? 0 })
                }
            }
        }

        buildGrid()

        const ro = new ResizeObserver(buildGrid)
        ro.observe(canvas.parentElement!)

        // ── mouse state ───────────────────────────────────────────────────────────
        //   mx/my  — last known cursor position (canvas-relative)
        //   lastMoveAt — timestamp of the last mousemove event
        let mx = -99999
        let my = -99999
        let lastMoveAt = 0       // timestamps in ms

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mx = e.clientX - rect.left
            my = e.clientY - rect.top
            lastMoveAt = performance.now()
        }

        const onMouseLeave = () => {
            // Don't snap mx/my; let the trail decay naturally
            lastMoveAt = 0
        }

        const section = canvas.parentElement!
        section.addEventListener("mousemove", onMouseMove)
        section.addEventListener("mouseleave", onMouseLeave)

        // ── render loop ───────────────────────────────────────────────────────────
        let rafId: number
        const R2 = RADIUS * RADIUS

        const draw = () => {
            rafId = requestAnimationFrame(draw)

            const now = performance.now()
            const moving = (now - lastMoveAt) < IDLE_MS   // true only while mouse is actively moving

            let anyActive = false

            for (const cell of cells) {
                if (moving) {
                    const dx = cell.cx - mx
                    const dy = cell.cy - my
                    const d2 = dx * dx + dy * dy

                    if (d2 < R2) {
                        const proximity = 1 - Math.sqrt(d2) / RADIUS
                        cell.val = clamp(cell.val + proximity * proximity * EXCITE, 0, 1)
                    }
                }

                // Always decay — when mouse is stopped, every cell falls back to 0
                if (cell.val > THRESHOLD) {
                    cell.val *= DECAY
                    anyActive = true
                } else {
                    cell.val = 0
                }
            }

            // If nothing is active and mouse isn't moving, skip the draw entirely
            if (!anyActive && !moving) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                return
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (const cell of cells) {
                if (cell.val < THRESHOLD) continue   // invisible — skip

                ctx.fillStyle = toColor(cell.val)

                const x = cell.cx - CELL_SIZE / 2
                const y = cell.cy - CELL_SIZE / 2

                ctx.beginPath()
                ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, CORNER_R)
                ctx.fill()
            }
        }

        draw()

        return () => {
            cancelAnimationFrame(rafId)
            section.removeEventListener("mousemove", onMouseMove)
            section.removeEventListener("mouseleave", onMouseLeave)
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
                cursor: "none",   // canvas itself has no cursor; system cursor shows on section
            }}
        />
    )
}
