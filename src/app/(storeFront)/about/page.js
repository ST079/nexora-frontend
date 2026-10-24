"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cpu,
  MapPin,
  Package,
  Route,
  ShieldCheck,
  Sparkle,
  Users,
  Wallet,
} from "lucide-react";
import CountUp from "@/components/CountUp";
import { CONTACT_ROUTE, PRODUCTS_ROUTE } from "@/constants/routes";
import { EASE_OUT, bouncy, revealUp } from "@/utils/motion";

const STATS = [
  { label: "Founded", text: "2023", tone: "bg-signal text-on-signal", tilt: -4 },
  { label: "SKUs listed", count: 500, suffix: "+", tone: "bg-marigold text-on-marigold", tilt: 3 },
  { label: "Orders shipped", count: 12, suffix: "k+", tone: "bg-panel text-ink border border-hairline", tilt: 2 },
  { label: "Based in", text: "KTM", tone: "bg-night text-on-night dark:border dark:border-hairline", tilt: -3 },
];

const VALUES = [
  {
    icon: Cpu,
    tone: "bg-signal-tint text-signal-dim",
    title: "Specs first, always",
    desc: "Every listing is built around the numbers that matter — price, stock, and brand — not lifestyle photography.",
  },
  {
    icon: ShieldCheck,
    tone: "bg-ok/12 text-ok",
    title: "Verified inventory",
    desc: "Stock counts are live. If a product says 4 in stock, your bag won't let you add a fifth.",
  },
  {
    icon: Route,
    tone: "bg-blueprint-tint text-blueprint-dim",
    title: "Honest order tracking",
    desc: "Every order has a status you can follow from placed to delivered, and you can cancel any time before it ships.",
  },
  {
    icon: MapPin,
    tone: "bg-marigold-tint text-marigold-dim",
    title: "Built in Nepal",
    desc: "We're a Kathmandu-based team that got tired of stores that list prices in USD and pretend customs fees don't exist.",
  },
];

const TIMELINE = [
  { year: "2023", label: "Nexora launches", desc: "First 50 listings, phones only, Kathmandu delivery." },
  { year: "2024 Q1", label: "Khalti integration", desc: "Digital payments land — no more cash-only orders." },
  { year: "2024 Q3", label: "Catalog expands", desc: "Tech, clothing, and groceries join the platform." },
  { year: "2025", label: "API goes public", desc: "Third-party sellers can list via the Nexora REST API." },
];

const TEAM = [
  { name: "Sujan Tamang", role: "Founder & CTO", initials: "ST" },
  { name: "Aarav Shrestha", role: "Head of Operations", initials: "AS" },
  { name: "Priya Maharjan", role: "Product Design", initials: "PM" },
  { name: "Rohan Karki", role: "Logistics Lead", initials: "RK" },
];

const AVATAR_TONES = [
  "bg-signal text-on-signal",
  "bg-marigold text-on-marigold",
  "bg-blueprint text-paper",
  "bg-ok text-paper",
];

const MARQUEE = [
  "Spec-first catalog",
  "Kathmandu warehouse",
  "Khalti payments",
  "Cash on delivery",
  "Live inventory",
  "Order tracking",
];

const SectionHead = ({ eyebrow, children }) => (
  <motion.div {...revealUp()} className="mb-10">
    <p className="eyebrow mb-2">{eyebrow}</p>
    <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
      {children}
    </h2>
  </motion.div>
);

// Two crossed tapes of scrolling text, slightly tilted.
const Tape = ({ tone, tilt, reverse }) => (
  <div className={`${tilt} ${tone} w-[110%] translate-x-[-5%] py-3 shadow-soft`}>
    <div className={`flex w-max animate-marquee whitespace-nowrap ${reverse ? "[animation-direction:reverse]" : ""}`}>
      {[...MARQUEE, ...MARQUEE].map((text, i) => (
        <span key={i} className="mx-6 inline-flex items-center gap-6 font-display text-sm font-semibold">
          {text}
          <Sparkle size={12} aria-hidden className="opacity-70" />
        </span>
      ))}
    </div>
  </div>
);

const AboutPage = () => (
  <div className="overflow-x-clip bg-paper transition-colors duration-300">
    {/* ── Hero ── */}
    <section className="container-page pb-16 pt-12 md:pt-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div {...revealUp()}>
          <p className="eyebrow mb-4">About Nexora · Est. 2023</p>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
            A catalog built for <span className="marker">buyers,</span>
            <br />
            not browsers.
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-slate">
            Nexora started as a frustration project. Too many Nepali electronics stores list
            phones with stock photos, vague pricing, and availability that may or may not be real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={PRODUCTS_ROUTE} className="btn-primary group">
              Browse products
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href={CONTACT_ROUTE} className="btn-secondary">
              Talk to us
            </Link>
          </div>
        </motion.div>

        {/* Stats as tilted, floating stickers */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: s.tilt }}
              whileHover={{ rotate: 0, scale: 1.04 }}
              transition={{ ...bouncy, delay: 0.1 + i * 0.08 }}
            >
              <div
                className={`animate-float rounded-4xl p-6 shadow-lift sm:p-7 ${s.tone}`}
                style={{ animationDelay: `${i * -1.5}s` }}
              >
                <p className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  {s.count != null ? (
                    <CountUp value={s.count} format={(n) => `${Math.round(n)}${s.suffix}`} />
                  ) : (
                    s.text
                  )}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest opacity-70">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Ticker ── */}
    <section aria-label="What Nexora offers" className="relative py-10">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-90">
        <Tape tone="bg-marigold text-on-marigold" tilt="rotate-2" reverse />
      </div>
      <div className="relative">
        <Tape tone="bg-signal text-on-signal" tilt="-rotate-1" />
      </div>
    </section>

    {/* ── Values ── */}
    <section className="container-page py-16">
      <SectionHead eyebrow="What we stand for">Four things we won&apos;t compromise on</SectionHead>
      <div className="grid gap-4 sm:grid-cols-2">
        {VALUES.map((v, i) => (
          <motion.article
            key={v.title}
            {...revealUp(i * 0.06)}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-4xl border border-hairline bg-panel p-7 transition-shadow hover:shadow-lift"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-6 font-display text-8xl font-bold text-mist transition-transform duration-500 ease-spring group-hover:-translate-y-1 group-hover:scale-110"
            >
              0{i + 1}
            </span>
            <span
              className={`relative mb-5 grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-12 group-hover:scale-110 ${v.tone}`}
            >
              <v.icon size={22} aria-hidden />
            </span>
            <h3 className="relative mb-2 font-display text-xl font-bold text-ink">{v.title}</h3>
            <p className="relative text-sm leading-relaxed text-slate">{v.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>

    {/* ── Timeline ── */}
    <section className="container-page py-16">
      <SectionHead eyebrow="How we got here">The build log</SectionHead>
      <ol className="relative grid gap-8 pl-12 lg:grid-cols-4 lg:gap-6 lg:pl-0 lg:pt-14">
        {/* The rail draws itself in: down on phones, across on desktop. */}
        <span aria-hidden className="absolute bottom-2 left-[19px] top-2 w-0.5 rounded-full bg-hairline lg:hidden">
          <motion.span
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
            className="block h-full origin-top rounded-full bg-signal"
          />
        </span>
        <span aria-hidden className="absolute left-0 right-0 top-[19px] hidden h-0.5 rounded-full bg-hairline lg:block">
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: EASE_OUT }}
            className="block h-full origin-left rounded-full bg-signal"
          />
        </span>

        {TIMELINE.map((t, i) => (
          <motion.li key={t.year} {...revealUp(0.15 + i * 0.12)} className="relative">
            <motion.span
              aria-hidden
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...bouncy, delay: 0.25 + i * 0.12 }}
              className="absolute -left-12 top-0 grid h-10 w-10 place-items-center rounded-full bg-signal font-mono text-xs font-semibold text-on-signal ring-4 ring-paper lg:-top-14 lg:left-0"
            >
              {i + 1}
            </motion.span>
            <p className="mb-1 font-mono text-xs font-medium text-signal-dim">{t.year}</p>
            <p className="mb-1 font-display text-lg font-bold text-ink">{t.label}</p>
            <p className="text-sm leading-relaxed text-slate">{t.desc}</p>
          </motion.li>
        ))}
      </ol>
    </section>

    {/* ── Team ── */}
    <section className="container-page py-16">
      <SectionHead eyebrow="The people">Small team, wide scope</SectionHead>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TEAM.map((member, i) => (
          <motion.div
            key={member.name}
            {...revealUp(i * 0.06)}
            whileHover={{ y: -6 }}
            className="group rounded-4xl border border-hairline bg-panel p-5 text-center transition-shadow hover:shadow-lift sm:p-6"
          >
            <span
              className={`mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[1.4rem] font-display text-lg font-bold transition-transform duration-500 ease-spring group-hover:rotate-12 group-hover:scale-110 ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
            >
              {member.initials}
            </span>
            <p className="font-display text-sm font-bold text-ink sm:text-base">{member.name}</p>
            <p className="mt-1 text-xs text-slate">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* ── Bottom CTA ── */}
    <section className="container-page pb-20 pt-6">
      <motion.div
        {...revealUp()}
        className="relative overflow-hidden rounded-4xl bg-night p-8 text-on-night shadow-lift sm:p-12 dark:border dark:border-hairline"
      >
        <span aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 animate-drift rounded-full bg-signal/45 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 animate-drift rounded-full bg-marigold/30 blur-3xl [animation-delay:-9s]" />
        <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow mb-3 text-marigold">Ready when you are</p>
            <h2 className="max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Real stock, real prices, paid your way.
            </h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Package, label: "500+ SKUs", desc: "Products across 8 categories." },
                { icon: Wallet, label: "Pay your way", desc: "Khalti, card or cash on delivery." },
                { icon: Users, label: "Talk to a human", desc: "Real support, not a chatbot." },
              ].map(({ icon: Icon, label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-on-night/10 text-marigold">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-on-night/65">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Link href={PRODUCTS_ROUTE} className="btn-accent group px-8 py-4 text-base">
            Start shopping
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  </div>
);

export default AboutPage;
