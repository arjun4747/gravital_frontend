import TextBlockAnimation from "@/components/ui/text-block-animation"
import AnimatedSearch from "@/components/ui/animated-search"
import ContributionGrid from "@/components/ui/contribution-grid"
import HeroNavbar from "@/components/ui/hero-navbar"
import { ArrowDown } from "lucide-react"

export default function DemoOne() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col">
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* 1. HERO SECTION: The Hook */}
        <section className="min-h-screen flex flex-col relative">
          {/* GitHub heatmap grid trail — behind all hero content */}
          <ContributionGrid />

          {/* Navbar: first row of the hero flex column */}
          <HeroNavbar />

          {/* Hero content: flex-1 centres it vertically in remaining space */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="relative z-10 max-w-4xl w-full">
              <TextBlockAnimation
                blockColor="#6366f1"
                animateOnScroll={false}
                delay={0.2}
                duration={0.8}
              >
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-tight">
                  Beyond the Resume.<br />
                  <span className="inline-block bg-black text-white dark:bg-white dark:text-black px-3 pb-1 rounded-md mt-2">
                    Into the Code.
                  </span>
                </h1>
              </TextBlockAnimation>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 z-10">
            <span className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Scroll to Reveal
            </span>
            <ArrowDown className="w-5 h-5 text-zinc-500 dark:text-zinc-400 animate-bounce" />
          </div>
        </section>

        {/* 2. DISCOVERY SECTION */}
        <section className="min-h-[80vh] flex flex-col justify-center items-center px-6 py-24 bg-zinc-100/80 dark:bg-zinc-900/60">
          <div className="max-w-3xl w-full space-y-16">
            <TextBlockAnimation blockColor="#10b981" duration={0.7}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight">
                Stop searching. Start discovering{" "}
                <span className="inline-block bg-black text-white dark:bg-white dark:text-black px-3 pb-1 rounded-md mt-2">
                  verified builders.
                </span>
              </h2>
            </TextBlockAnimation>

            {/* Search bar + profile/project card */}
            <div className="relative w-full">
              {/* Profile card (sits behind search bar) */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-5 mb-3 flex flex-col gap-4">
                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    B
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm leading-tight">Bharath</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs">@bharathbuilds</p>
                  </div>
                  <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
                    98% Match
                  </span>
                </div>

                {/* Project card */}
                <div className="border border-zinc-100 dark:border-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm">chatty.io</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">Public</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                    Led an open-source chat app with streaming APIs that unifies multiple models for smooth, real-time conversations
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-zinc-400 dark:text-zinc-500 text-xs">
                    <span>★ 1,123</span>
                    <span>⑂ 156</span>
                  </div>
                </div>
              </div>

              {/* Search bar — animated typewriter placeholder */}
              <AnimatedSearch />
            </div>
          </div>
        </section>

        {/* 3. FOOTER: Call to Action */}
        <footer className="h-[40vh] md:h-[50vh] flex items-center justify-center border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950">
          <TextBlockAnimation blockColor="#ef4444" duration={0.8}>
            <a
              href="mailto:hello@daiwiik.com"
              className="text-4xl md:text-6xl lg:text-7xl font-black hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Let&apos;s Build It.
            </a>
          </TextBlockAnimation>
        </footer>
      </div>
    </div>
  )
}