"use client"

import { useEffect, useState } from "react"

const BASE = "engineers who build"
const SUFFIX = " an ecommerce website"

// Timing (ms)
const TYPE_SPEED = 75    // ms per character typed
const DELETE_SPEED = 40    // ms per character deleted
const PAUSE_FULL = 1800  // pause after full phrase is shown
const PAUSE_BASE = 800   // pause after deleting back to base

type Phase = "typing" | "pause-full" | "deleting" | "pause-base"

export default function AnimatedSearch() {
    const [suffix, setSuffix] = useState("")
    const [phase, setPhase] = useState<Phase>("pause-base")
    const [blink, setBlink] = useState(true)

    // ── Cursor blink ───────────────────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => setBlink((b) => !b), 530)
        return () => clearInterval(id)
    }, [])

    // ── Typewriter state machine ───────────────────────────────────────────────
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>

        if (phase === "pause-base") {
            timeout = setTimeout(() => setPhase("typing"), PAUSE_BASE)

        } else if (phase === "typing") {
            if (suffix.length < SUFFIX.length) {
                timeout = setTimeout(() => {
                    setSuffix(SUFFIX.slice(0, suffix.length + 1))
                }, TYPE_SPEED)
            } else {
                setPhase("pause-full")
            }

        } else if (phase === "pause-full") {
            timeout = setTimeout(() => setPhase("deleting"), PAUSE_FULL)

        } else if (phase === "deleting") {
            if (suffix.length > 0) {
                timeout = setTimeout(() => {
                    setSuffix(SUFFIX.slice(0, suffix.length - 1))
                }, DELETE_SPEED)
            } else {
                setPhase("pause-base")
            }
        }

        return () => clearTimeout(timeout)
    }, [phase, suffix])

    const displayText = BASE + suffix

    return (
        <div className="relative flex items-center">
            {/* Search icon */}
            <span className="absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none z-10">
                <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            </span>

            {/* Input — readOnly, value drives the animated text */}
            <div className="relative w-full">
                <input
                    type="text"
                    readOnly
                    value=""
                    className="w-full pl-10 pr-14 py-4 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-default"
                    aria-label="Search"
                    tabIndex={-1}
                />
                {/* Overlay — sits on top of the input, styled like placeholder text */}
                <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center pl-10 pr-14 text-sm text-zinc-400 dark:text-zinc-500 pointer-events-none select-none whitespace-nowrap overflow-hidden"
                >
                    {displayText}
                    {/* Blinking cursor */}
                    <span
                        className="ml-px inline-block w-px h-[1.1em] bg-zinc-400 dark:bg-zinc-500 align-middle"
                        style={{ opacity: blink ? 1 : 0, transition: "opacity 0.1s" }}
                    />
                </span>
            </div>

            {/* Arrow button */}
            <button className="absolute right-2 w-9 h-9 bg-zinc-900 dark:bg-zinc-50 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="text-white dark:text-zinc-900"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}
