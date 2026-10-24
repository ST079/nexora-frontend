"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Banknote, Check, CreditCard, KeyRound, MapPin, Truck, Wallet } from "lucide-react";
import { LogoMark } from "./Logo";
import { HOME_ROUTE } from "@/constants/routes";
import { EASE_OUT, bouncy, item, stagger } from "@/utils/motion";

// Each auth page gets a small floating scene that hints at what the account
// is for. It's illustration, not data, so it's hidden from screen readers.
const SCENES = {
  orders: {
    icon: Truck,
    tone: "bg-blueprint text-paper",
    label: "Order #NX-2041",
    note: "On the way",
    progress: 2,
  },
  welcome: {
    icon: MapPin,
    tone: "bg-signal text-on-signal",
    label: "Delivery address",
    note: "Pre-filled at checkout",
  },
  recovery: {
    icon: KeyRound,
    tone: "bg-marigold text-on-marigold",
    label: "Reset link",
    note: "Single use, sent by email",
  },
};

const PAY = [
  { icon: Wallet, label: "Khalti" },
  { icon: CreditCard, label: "Card" },
  { icon: Banknote, label: "Cash" },
];

const Float = ({ delay = 0, className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 16 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ ...bouncy, delay }}
    className={`absolute ${className}`}
  >
    {/* The CSS float lives on an inner node so it doesn't fight framer's transform. */}
    <div className="animate-float" style={{ animationDelay: `${delay * -4}s` }}>
      {children}
    </div>
  </motion.div>
);

const AuthVisualPanel = ({ scene = "orders", eyebrow, title, points = [] }) => {
  const s = SCENES[scene] ?? SCENES.orders;
  const Icon = s.icon;

  return (
    <div className="relative hidden p-3 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[44%] lg:self-start">
      <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-4xl bg-night p-10 text-on-night dark:border dark:border-hairline xl:p-12">
        {/* Dotted paper and two slow colour blobs */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 text-on-night/10"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 animate-drift rounded-full bg-signal/45 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 animate-drift rounded-full bg-marigold/30 blur-3xl [animation-delay:-9s]"
        />

        <Link href={HOME_ROUTE} className="group relative flex w-fit items-center gap-2.5" aria-label="Nexora home">
          <LogoMark />
          <span className="font-display text-xl font-bold tracking-tight">nexora</span>
        </Link>

        {/* The scene */}
        <div aria-hidden className="relative my-8 h-64 xl:h-72">
          <Float delay={0.15} className="left-0 top-6 w-64 xl:w-72">
            <div className="rounded-3xl border border-on-night/12 bg-on-night/8 p-4 shadow-lift backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.tone}`}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-on-night/60">{s.note}</p>
                </div>
              </div>
              {s.progress != null ? (
                <div className="mt-4 grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="h-1.5 overflow-hidden rounded-full bg-on-night/12">
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i <= s.progress ? 1 : 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + i * 0.15, ease: EASE_OUT }}
                        className="block h-full origin-left rounded-full bg-marigold"
                      />
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-4 space-y-1.5">
                  <span className="block h-2 w-4/5 rounded-full bg-on-night/12" />
                  <span className="block h-2 w-3/5 rounded-full bg-on-night/12" />
                </div>
              )}
            </div>
          </Float>

          <Float delay={0.3} className="bottom-2 right-0">
            <div className="flex gap-1.5 rounded-full border border-on-night/12 bg-on-night/8 p-1.5 backdrop-blur-md">
              {PAY.map(({ icon: PayIcon, label }) => (
                <span key={label} className="flex items-center gap-1.5 rounded-full bg-on-night/10 px-3 py-1.5 text-xs font-medium">
                  <PayIcon size={13} /> {label}
                </span>
              ))}
            </div>
          </Float>

          <Float delay={0.45} className="right-6 top-0">
            <span className="sticker rotate-6 text-[11px]">Live stock</span>
          </Float>
        </div>

        <div className="relative">
          {eyebrow && <p className="eyebrow mb-3 text-marigold">{eyebrow}</p>}
          <h2 className="max-w-md font-display text-4xl font-bold leading-[1.05] tracking-tight xl:text-[2.75rem]">
            {title}
          </h2>
          {points.length > 0 && (
            <motion.ul
              variants={stagger(0.08, 0.5)}
              initial="hidden"
              animate="show"
              className="mt-7 space-y-2.5"
            >
              {points.map((point) => (
                <motion.li key={point} variants={item} className="flex items-center gap-3 text-sm text-on-night/80">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-on-night/12 text-marigold">
                    <Check size={13} strokeWidth={3} aria-hidden />
                  </span>
                  {point}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthVisualPanel;
