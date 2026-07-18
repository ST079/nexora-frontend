/* eslint-disable react/no-unescaped-entities */
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Cpu, ShieldCheck, Zap, MapPin, Package, Truck, Users } from 'lucide-react'

const STATS = [
  { label: 'Founded',       value: '2023'  },
  { label: 'SKUs listed',   value: '500+'  },
  { label: 'Orders shipped',value: '12k+'  },
  { label: 'City',          value: 'KTM'   },
]

const VALUES = [
  {
    icon: Cpu,
    title: 'Specs first, always',
    desc: 'Every listing is built around the numbers that matter — price, stock, and brand — not lifestyle photography.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified inventory',
    desc: 'Stock counts are pulled from live warehouse data. If it says 4 in stock, there are exactly 4 units.',
  },
  {
    icon: Zap,
    title: 'Fast, honest delivery',
    desc: 'Orders placed before 12:00 PM leave the same day. Every order gets a status that updates in real time.',
  },
  {
    icon: MapPin,
    title: 'Built in Nepal',
    desc: "We're a Kathmandu-based team that got tired of stores that list prices in USD and pretend customs fees don't exist.",
  },
]

const TIMELINE = [
  { year: '2023',    label: 'Nexora launches',    desc: 'First 50 listings, phones only, Kathmandu delivery.' },
  { year: '2024 Q1', label: 'Khalti integration', desc: 'Digital payments land — no more cash-only orders.' },
  { year: '2024 Q3', label: 'Catalog expands',    desc: 'Tech, clothing, and groceries join the platform.' },
  { year: '2025',    label: 'API goes public',     desc: 'Third-party sellers can list via the Nexora REST API.' },
]

const TEAM = [
  { name: 'Sujan Tamang',    role: 'Founder & CTO',       initials: 'ST' },
  { name: 'Aarav Shrestha',  role: 'Head of Operations',  initials: 'AS' },
  { name: 'Priya Maharjan',  role: 'Product Design',      initials: 'PM' },
  { name: 'Rohan Karki',     role: 'Logistics Lead',      initials: 'RK' },
]

const marqueeItems = [
  'Spec-first catalog', 'Kathmandu warehouse', 'Khalti payments',
  'Cash on delivery',   'Live inventory',      'Real-time tracking',
  'Spec-first catalog', 'Kathmandu warehouse', 'Khalti payments',
  'Cash on delivery',   'Live inventory',      'Real-time tracking',
]

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: '-40px' },
  transition:  { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
})

/* ── Sub-components ──────────────────────────────────────────────────────── */

const BottomFeature = ({ icon: Icon, label, desc }) => (
  <div className="p-6">
    <Icon size={18} className="mb-3 text-signal dark:text-signal" />
    <p className="font-display font-semibold mb-1 text-ink dark:text-[#F0EFE8]">{label}</p>
    <p className="text-sm text-slate dark:text-[#8B8FA8] leading-relaxed">{desc}</p>
  </div>
)

/* ── Page ────────────────────────────────────────────────────────────────── */

const AboutPage = () => {
  return (
    <div className="bg-paper dark:bg-[#0E0F12] transition-colors duration-300">

      {/* ── Hero ── */}
      <section className="container-page pt-14 pb-12 md:pt-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">

          <motion.div {...fadeUp()}>
            <p className="eyebrow dark:text-[#8B8FA8] mb-4">About Nexora · Est. 2023</p>

            <h1 className="font-display text-[2.6rem] sm:text-[3.2rem] font-semibold leading-[1.05] tracking-tight text-ink dark:text-[#F0EFE8]">
              A catalog built for
              <br />
              <span className="text-signal dark:text-signal">buyers, not browsers.</span>
            </h1>

            <p className="mt-5 max-w-lg text-slate dark:text-[#8B8FA8] text-[15px] leading-relaxed">
              Nexora started as a frustration project. Too many Nepali electronics stores list
              phones with stock photos, vague pricing, and availability that may or may not be real.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Browse Products <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Talk to us
              </Link>
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            {...fadeUp(0.1)}
            className="card-frame divide-y divide-hairline dark:divide-[#262932]"
          >
            <div className="px-6 py-4 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center bg-ink dark:bg-[#F0EFE8] font-mono text-xs text-signal dark:text-[#14151A]">
                N
              </span>
              <span className="font-mono text-xs text-slate dark:text-[#8B8FA8]">
                system · status · nominal
              </span>
              <span className="ml-auto h-2 w-2 rounded-full bg-ok dark:bg-ok animate-blink" />
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-hairline dark:divide-[#262932]">
              {STATS.map((s) => (
                <div key={s.label} className="px-6 py-5">
                  <p className="font-display text-2xl font-semibold text-ink dark:text-[#F0EFE8]">
                    {s.value}
                  </p>
                  <p className="eyebrow dark:text-[#8B8FA8] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 font-mono text-xs text-slate dark:text-[#8B8FA8]">
              <span className="text-signal dark:text-signal">{'>'}</span> nexora.products.load()
              → <span className="text-ok dark:text-ok">success</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <section className="border-y border-hairline dark:border-[#262932] bg-ink dark:bg-[#0A0B0E] py-3 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {marqueeItems.map((text, index) => (
            <span key={index} className="mx-8 font-mono text-xs text-paper/60 dark:text-[#F0EFE8]/50">
              <span className="text-signal dark:text-signal">—</span> {text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Values ── */}
      <section className="container-page py-16">
        <motion.div {...fadeUp()} className="mb-10">
          <p className="eyebrow dark:text-[#8B8FA8] mb-2">What we stand for</p>
          <h2 className="font-display text-3xl font-semibold text-ink dark:text-[#F0EFE8]">
            Four things we won't compromise on
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              {...fadeUp(i * 0.06)}
              className="card-frame group p-6 hover:border-ink dark:hover:border-[#F0EFE8] transition-colors"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center border border-hairline dark:border-[#262932] bg-paper dark:bg-[#0E0F12] text-ink dark:text-[#F0EFE8] group-hover:bg-ink group-hover:text-paper dark:group-hover:bg-[#F0EFE8] dark:group-hover:text-[#0E0F12] transition-colors">
                  <v.icon size={17} />
                </span>
                <div>
                  <p className="font-display font-semibold mb-1 text-ink dark:text-[#F0EFE8] group-hover:text-signal dark:group-hover:text-signal transition-colors">
                    {v.title}
                  </p>
                  <p className="text-sm text-slate dark:text-[#8B8FA8] leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="container-page py-6 pb-16">
        <motion.div {...fadeUp()} className="mb-10">
          <p className="eyebrow dark:text-[#8B8FA8] mb-2">How we got here</p>
          <h2 className="font-display text-3xl font-semibold text-ink dark:text-[#F0EFE8]">
            The build log
          </h2>
        </motion.div>

        <div className="relative border-l border-hairline dark:border-[#262932] pl-8 space-y-10">
          {TIMELINE.map((t, i) => (
            <motion.div key={t.year} {...fadeUp(i * 0.07)} className="relative">
              <span className="absolute -left-[2.15rem] top-0.5 grid h-4 w-4 place-items-center border border-signal dark:border-signal bg-paper dark:bg-[#0E0F12]">
                <span className="h-1.5 w-1.5 bg-signal dark:bg-signal" />
              </span>
              <p className="font-mono text-xs text-signal dark:text-signal mb-1">{t.year}</p>
              <p className="font-display font-semibold mb-1 text-ink dark:text-[#F0EFE8]">{t.label}</p>
              <p className="text-sm text-slate dark:text-[#8B8FA8]">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="container-page py-6 pb-16">
        <motion.div {...fadeUp()} className="mb-10">
          <p className="eyebrow dark:text-[#8B8FA8] mb-2">The people</p>
          <h2 className="font-display text-3xl font-semibold text-ink dark:text-[#F0EFE8]">
            Small team, wide scope
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              {...fadeUp(i * 0.06)}
              className="card-frame p-5 group hover:border-ink dark:hover:border-[#F0EFE8] transition-colors"
            >
              <div className="h-12 w-12 border border-hairline dark:border-[#262932] bg-ink dark:bg-[#262932] grid place-items-center mb-4 group-hover:bg-signal dark:group-hover:bg-signal transition-colors">
                <span className="font-display text-sm text-paper dark:text-[#F0EFE8]">
                  {member.initials}
                </span>
              </div>
              <p className="font-display font-semibold text-sm text-ink dark:text-[#F0EFE8]">
                {member.name}
              </p>
              <p className="eyebrow dark:text-[#8B8FA8] mt-1">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="container-page pb-20">
        <motion.div
          {...fadeUp()}
          className="card-frame grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-hairline dark:divide-[#262932]"
        >
          <BottomFeature icon={Package} label="500+ SKUs"         desc="Products across 8 categories." />
          <BottomFeature icon={Truck}   label="Same-day dispatch" desc="Orders before noon leave today." />
          <BottomFeature icon={Users}   label="Talk to a human"   desc="Real support, not a chatbot." />
        </motion.div>
      </section>

    </div>
  )
}

export default AboutPage