"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Cpu,
  ShieldCheck,
  Zap,
  MapPin,
  ArrowRight,
  Users,
  Package,
  Truck,
} from "lucide-react";

const STATS = [
  { label: "Founded", value: "2023" },
  { label: "SKUs listed", value: "500+" },
  { label: "Orders shipped", value: "12k+" },
  { label: "City", value: "KTM" },
];

const VALUES = [
  {
    icon: Cpu,
    title: "Specs first, always",
    desc: "Every listing is built around the numbers that matter — price, stock, and brand — not lifestyle photography. You should be able to make a decision in thirty seconds.",
  },
  {
    icon: ShieldCheck,
    title: "Verified inventory",
    desc: "Stock counts are pulled from live warehouse data. If it says 4 in stock, there are exactly 4 units. No phantom availability, no surprise out-of-stock emails.",
  },
  {
    icon: Zap,
    title: "Fast, honest delivery",
    desc: "We ship from Kathmandu. Orders placed before 12:00 PM leave the same day. Every order gets a status that updates in real time — no chasing support.",
  },
  {
    icon: MapPin,
    title: "Built in Nepal",
    desc: "We're a Kathmandu-based team that got tired of online stores that list prices in USD, ship from abroad, and pretend customs fees don't exist. Nexora is for locals.",
  },
];

const TEAM = [
  { name: "Sujan Tamang", role: "Founder & CTO", initials: "ST" },
  { name: "Aarav Shrestha", role: "Head of Operations", initials: "AS" },
  { name: "Priya Maharjan", role: "Product Design", initials: "PM" },
  { name: "Rohan Karki", role: "Logistics Lead", initials: "RK" },
];

const TIMELINE = [
  {
    year: "2023",
    label: "Nexora launches",
    desc: "First 50 listings, phones only, Kathmandu delivery.",
  },
  {
    year: "2024 Q1",
    label: "Khalti integration",
    desc: "Digital payments land — no more cash-only orders.",
  },
  {
    year: "2024 Q3",
    label: "Catalog expands",
    desc: "Tech, clothing, and groceries join the platform.",
  },
  {
    year: "2025",
    label: "API goes public",
    desc: "Third-party sellers can list via the Nexora REST API.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: {
    opacity: 0,
    y: 18,
  },
  whileInView: {
    opacity: 1,
    y: 0,
  },
  viewport: {
    once: true,
    margin: "-40px",
  },
  transition: {
    duration: 0.45,
    delay,
    ease: [0.22, 1, 0.36, 1],
  },
});

const AboutPage = () => {
  return (
    <div>
      <section className="container-page pt-14 pb-12 md:pt-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <motion.div {...fadeUp()}>
            <p className="eyebrow mb-4">About Nexora · Est. 2023</p>

            <h1 className="font-display text-[2.6rem] sm:text-[3.2rem] font-semibold leading-[1.05] tracking-tight">
              A catalog built for
              <br />
              <span className="text-signal">buyers, not browsers.</span>
            </h1>

            <p className="mt-5 max-w-lg text-slate text-[15px] leading-relaxed">
              Nexora started as a frustration project. Too many Nepali
              electronics stores list phones with stock photos, vague pricing,
              and availability that may or may not be real.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Browse catalog <ArrowRight size={15} />
              </Link>

              <Link href="/contact" className="btn-secondary">
                Talk to us
              </Link>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.1)}
            className="card-frame divide-y divide-hairline"
          >
            <div className="px-6 py-4 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center bg-ink font-mono text-xs text-signal">
                N
              </span>

              <span className="font-mono text-xs text-slate">
                system · status · nominal
              </span>

              <span className="ml-auto h-2 w-2 rounded-full bg-ok animate-blink" />
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-hairline">
              {STATS.map((s) => (
                <div key={s.label} className="px-6 py-5">
                  <p className="font-display text-2xl font-semibold">
                    {s.value}
                  </p>
                  <p className="eyebrow mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Keep the rest of your JSX exactly the same */}
      {/* Values, Timeline, Team, CTA sections */}
    </div>
  );
};

function BottomFeature({ icon: Icon, label, desc }) {
  return (
    <div className="p-6">
      <Icon size={18} className="mb-3 text-signal" />
      <p className="font-display font-semibold mb-1">{label}</p>
      <p className="text-sm text-slate">{desc}</p>
    </div>
  );
}

export default AboutPage;