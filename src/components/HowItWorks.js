"use client";

import { motion } from "framer-motion";
import { PackageCheck, Search, ShoppingBag, Wallet } from "lucide-react";
import { bouncy, EASE_OUT, revealUp } from "@/utils/motion";

const STEPS = [
  {
    icon: Search,
    title: "Find it",
    body: "Browse a category or press ⌘K and type. Results show up as you type.",
    tone: "bg-signal-tint text-signal-dim",
  },
  {
    icon: ShoppingBag,
    title: "Add it",
    body: "One tap on the + adds it to your bag. Stock is live, so what you see is there.",
    tone: "bg-marigold-tint text-marigold-dim",
  },
  {
    icon: Wallet,
    title: "Pay your way",
    body: "Khalti, card through Stripe, or cash when it reaches your door.",
    tone: "bg-blueprint-tint text-blueprint-dim",
  },
  {
    icon: PackageCheck,
    title: "Track it",
    body: "Follow every order from your account, from placed to delivered.",
    tone: "bg-signal-tint text-signal-dim",
  },
];

const HowItWorks = () => {
  return (
    <section className="container-page py-16 lg:py-24">
      <motion.div {...revealUp()} className="mx-auto mb-12 max-w-2xl text-center">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Shopping, minus the <span className="marker">fuss.</span>
        </h2>
      </motion.div>

      {/* Progress rail: fills left to right as it scrolls in (desktop) */}
      <div aria-hidden className="relative mb-6 hidden grid-cols-4 lg:grid">
        <span className="absolute left-[12.5%] right-[12.5%] top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-hairline" />
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
          className="absolute left-[12.5%] right-[12.5%] top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full bg-signal"
        />
        {STEPS.map((s, i) => (
          <motion.span
            key={s.title}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...bouncy, delay: 0.25 + i * 0.28 }}
            className="relative mx-auto grid h-9 w-9 place-items-center rounded-full bg-ink font-mono text-xs font-semibold text-paper ring-4 ring-paper"
          >
            {i + 1}
          </motion.span>
        ))}
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, body, tone }, i) => (
          <motion.li
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: EASE_OUT }}
            className="group relative rounded-3xl border border-hairline bg-panel p-6 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="mb-8 flex items-center justify-between">
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110 ${tone}`}
              >
                <Icon size={24} aria-hidden />
              </span>
              <span className="font-display text-6xl font-extrabold leading-none tracking-tighter text-ink/7 transition-colors group-hover:text-signal/20 lg:hidden">
                {i + 1}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
};

export default HowItWorks;
