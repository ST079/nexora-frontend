"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Check,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Hash,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import { bouncy, revealUp, spring } from "@/utils/motion";

const SUPPORT_EMAIL = "support@nexora.com.np";

const CONTACT_CARDS = [
  {
    icon: Mail,
    tone: "bg-signal-tint text-signal-dim",
    label: "Email",
    value: SUPPORT_EMAIL,
    sub: "Reply within 24 hours",
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: Phone,
    tone: "bg-ok/12 text-ok",
    label: "Phone",
    value: "+977 98-NEXORA-01",
    sub: "Sun – Fri, 10 AM – 7 PM",
    href: "tel:+97798000001",
  },
  {
    icon: MapPin,
    tone: "bg-marigold-tint text-marigold-dim",
    label: "Office",
    value: "Bhaktapur, Kathmandu",
    sub: "Bagmati Province, Nepal",
    href: "https://maps.google.com/?q=Bhaktapur,Kathmandu",
  },
  {
    icon: Clock,
    tone: "bg-blueprint-tint text-blueprint-dim",
    label: "Hours",
    value: "10:00 AM – 7:00 PM",
    sub: "Sunday through Friday",
    href: null,
  },
];

const TOPICS = [
  { value: "order", label: "Order issue" },
  { value: "product", label: "Product question" },
  { value: "payment", label: "Payment / refund" },
  { value: "returns", label: "Returns" },
  { value: "partnership", label: "Partnership / wholesale" },
  { value: "other", label: "Other" },
];

// Only answers the store can stand behind: no delivery-time or returns
// promises that the app doesn't enforce.
const FAQ = [
  {
    q: "How do I track my order?",
    a: "Open Orders from your account. Each order shows where it is: placed, confirmed, on the way or delivered.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Khalti, debit or credit card through Stripe, and cash on delivery.",
  },
  {
    q: "Can I cancel an order?",
    a: "Yes, any time before it ships. Open the order and choose Cancel order. If you'd already paid, we'll contact you about your refund.",
  },
  {
    q: "Can I return a product?",
    a: "Email us with your order number and what's wrong, and we'll sort it out with the merchant.",
  },
  {
    q: "Is stock accurate?",
    a: "Yes. Stock counts are live, and your bag won't let you add more than there is.",
  },
];

const EMPTY = { name: "", email: "", topic: "", message: "" };

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // There's no contact endpoint yet, so hand the message to the visitor's
  // mail app instead of pretending to send it. The form keeps its values in
  // case no mail app opens.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic) {
      setErrorMsg("Pick a topic so the right person picks it up.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1800);
      return;
    }
    if (!form.message.trim()) {
      setErrorMsg("Add a message before sending.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1800);
      return;
    }
    const topic = TOPICS.find((t) => t.value === form.topic)?.label ?? "General";
    const subject = `[${topic}] ${form.name.trim()}`;
    const body = `${form.message.trim()}\n\n— ${form.name.trim()} <${form.email.trim()}>`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setStatus("success");
  };

  return (
    <div className="bg-paper transition-colors duration-300">
      {/* ── Hero ── */}
      <section className="container-page pb-12 pt-12 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div {...revealUp()}>
            <p className="eyebrow mb-4">Contact · Support</p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
              We&apos;re in Kathmandu.
              <br />
              <span className="marker">Let&apos;s talk.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate">
              Got a question about an order, a product spec or a payment? Drop us a message
              and a real person will read it.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {CONTACT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const Tag = card.href ? motion.a : motion.div;
              return (
                <Tag
                  key={card.label}
                  href={card.href || undefined}
                  target={card.href?.startsWith("http") ? "_blank" : undefined}
                  rel={card.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  {...revealUp(0.05 + i * 0.06)}
                  whileHover={card.href ? { y: -4 } : undefined}
                  className={`group relative flex min-w-0 flex-col gap-3 rounded-3xl border border-hairline bg-panel p-4 transition-shadow sm:p-5 ${
                    card.href ? "hover:shadow-lift" : ""
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-2xl transition-transform duration-500 ease-spring group-hover:-rotate-12 ${card.tone}`}
                    >
                      <Icon size={18} aria-hidden />
                    </span>
                    {card.href && (
                      <ArrowUpRight
                        size={16}
                        aria-hidden
                        className="text-slate-light transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                      />
                    )}
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate">
                    {card.label}
                  </span>
                  <span className="-mt-2 wrap-break-word font-display text-sm font-bold text-ink sm:text-base">
                    {card.value}
                  </span>
                  <span className="-mt-2 text-xs text-slate">{card.sub}</span>
                </Tag>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Form + FAQ ── */}
      <section className="container-page pb-20 pt-6">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          <motion.div
            {...revealUp()}
            className="rounded-4xl border border-hairline bg-panel p-5 sm:p-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="py-8 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.3, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={bouncy}
                    className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-ok text-paper"
                  >
                    <Check size={28} strokeWidth={3} aria-hidden />
                  </motion.span>
                  <p className="mb-2 font-display text-2xl font-bold text-ink">Your email is ready</p>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-slate">
                    Your mail app should have opened with the message filled in. Press send
                    there and we&apos;ll get back to you. Nothing opened? Email{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-signal-dim underline">
                      {SUPPORT_EMAIL}
                    </a>
                    .
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => setStatus("idle")} className="btn-secondary">
                      Back to my message
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(EMPTY);
                        setStatus("idle");
                      }}
                      className="btn-ghost"
                    >
                      Start a new one
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="eyebrow mb-2">Send a message</p>
                  <h2 className="mb-6 font-display text-3xl font-bold tracking-tight text-ink">
                    What can we help with?
                  </h2>

                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-danger/10 p-3 text-sm text-danger">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-danger text-paper">
                            <AlertTriangle size={14} aria-hidden />
                          </span>
                          {errorMsg}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    animate={status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <fieldset>
                      <legend className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-dim">
                        Topic <span className="text-danger" aria-hidden>*</span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {TOPICS.map((t) => {
                          const active = form.topic === t.value;
                          return (
                            <label
                              key={t.value}
                              className={`relative cursor-pointer select-none rounded-full border px-4 py-2 text-sm font-medium transition-colors has-focus-visible:ring-4 has-focus-visible:ring-signal/25 ${
                                active
                                  ? "border-ink text-paper"
                                  : "border-hairline bg-paper text-ink hover:border-ink/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name="topic"
                                value={t.value}
                                checked={active}
                                onChange={() => update("topic", t.value)}
                                className="sr-only"
                              />
                              {active && (
                                <motion.span
                                  layoutId="contactTopic"
                                  transition={spring}
                                  className="absolute inset-0 rounded-full bg-ink"
                                />
                              )}
                              <span className="relative">{t.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <AnimatedField
                        label="Your name"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Your name"
                        autoComplete="name"
                        required
                      />
                      <AnimatedField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-dim"
                      >
                        Message <span className="text-danger" aria-hidden>*</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="contact-message"
                          required
                          rows={6}
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                          placeholder="Tell us as much as you can: order number, product name, anything relevant."
                          className="field resize-none pb-8"
                        />
                        <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] text-slate-light">
                          {form.message.length} chars
                        </span>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.97 }}
                      className="btn-primary group w-full sm:w-auto"
                    >
                      <Send size={15} className="transition-transform group-hover:-rotate-12 group-hover:translate-x-0.5" />
                      Write email
                    </motion.button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* FAQ */}
          <div className="lg:sticky lg:top-24">
            <motion.div {...revealUp(0.1)} className="mb-5">
              <p className="eyebrow mb-2">Quick answers</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                Common questions
              </h2>
            </motion.div>

            <ul className="space-y-2">
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <motion.li
                    key={item.q}
                    {...revealUp(0.1 + i * 0.05)}
                    className={`overflow-hidden rounded-3xl border transition-colors ${
                      open ? "border-ink/20 bg-panel shadow-soft" : "border-hairline bg-panel/60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-ink">{item.q}</span>
                      <motion.span
                        animate={{ rotate: open ? 45 : 0 }}
                        transition={spring}
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors ${
                          open ? "bg-ink text-paper" : "bg-mist text-ink"
                        }`}
                      >
                        <Plus size={14} aria-hidden />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`faq-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <p className="px-5 pb-5 text-sm leading-relaxed text-slate">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>

            <motion.ul {...revealUp(0.2)} className="mt-5 space-y-1 rounded-3xl bg-mist p-2">
              <TrustRow icon={MessageSquare} label="Real human replies" />
              <TrustRow icon={ShieldCheck} label="Your data stays private" />
              <TrustRow icon={Hash} label="Add your order number for a faster reply" />
            </motion.ul>
          </div>
        </div>
      </section>
    </div>
  );
};

const TrustRow = ({ icon: Icon, label }) => (
  <li className="flex items-center gap-3 rounded-2xl px-3 py-2.5">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-panel text-signal-dim">
      <Icon size={15} aria-hidden />
    </span>
    <span className="text-sm text-ink">{label}</span>
  </li>
);

export default ContactPage;
