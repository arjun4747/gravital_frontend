"use client"

export default function HeroNavbar() {
    return (
        <nav className="grav-nav" aria-label="Main navigation">

            {/* ── Left: Logo ───────────────────────────────── */}
            <a href="/" className="grav-nav__logo" aria-label="Gravital home">
                {/*
          Swap the <span> below for your real logo:
          <Image src="/logo.svg" alt="Gravital" width={110} height={26} priority />
        */}
                <span className="grav-nav__wordmark">gravital</span>
            </a>

            {/* ── Right: Actions ───────────────────────────── */}
            <div className="grav-nav__actions">
                <a href="#demo" className="grav-nav__demo-link">Request Demo</a>
                <a href="/dashboard" className="grav-nav__cta">Dashboard</a>
            </div>

        </nav>
    )
}
