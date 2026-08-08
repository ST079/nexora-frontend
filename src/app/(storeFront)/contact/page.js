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
  Loader2,
  MessageSquare,
  ShieldCheck,
  Truck,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";

const CONTACT_CARDS = [
  {
    icon: Mail,
    label: "Email",
    value: "support@nexora.com.np",
    sub: "Reply within 24 hours",
    href: "mailto:support@nexora.com.np",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+977 98-NEXORA-01",
    sub: "Mon – Fri, 10 AM – 6 PM",
    href: "tel:+97798000001",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Bhaktapur, Kathmandu",
    sub: "Bagmati Province, Nepal",
    href: "https://maps.google.com/?q=Bhaktapur,Kathmandu",
  },
  {
    icon: Clock,
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

const FAQ = [
  {
    q: "How long does delivery take?",
    a: "Same-day delivery within Kathmandu Valley for orders before 12 PM. Outside valley takes 2–4 business days.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Khalti digital wallet and cash on delivery.",
  },
  {
    q: "Can I return a product?",
    a: "Yes, within 7 days of delivery with original packaging.",
  },
  {
    q: "Is stock accurate?",
    a: "Yes. Stock is pulled live from warehouse data.",
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      setErrorMsg("Add a message before sending.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1800);
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
    setForm({ name: "", email: "", topic: "", message: "" });
  };

  return (
    <div className="bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      {/* ── Hero ── */}
      <section className="container-page pt-14 pb-12 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <motion.div {...fadeUp()}>
            <p className="eyebrow dark:text-[#8b8fa8] mb-4">
              Contact · Support
            </p>
            <h1 className="font-display text-[2.6rem] sm:text-[3.2rem] font-semibold leading-[1.05] text-ink dark:text-[#f0efe8]">
              We&apos;re in Kathmandu.
              <br />
              <span className="text-signal">Let&apos;s talk.</span>
            </h1>
            <p className="mt-5 max-w-md text-slate dark:text-[#8b8fa8] text-[15px]">
              Got a question about an order, product spec, or return? Drop us a
              message.
            </p>
          </motion.div>

          {/* Contact cards */}
          <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-3">
            {CONTACT_CARDS.map((card) => {
              const Icon = card.icon;
              const Tag = card.href ? "a" : "div";
              return (
                <Tag
                  key={card.label}
                  href={card.href || undefined}
                  target={card.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="card-frame group p-4 flex flex-col gap-3 hover:border-ink dark:hover:border-[#f0efe8] transition-colors"
                >
                  <Icon
                    size={16}
                    className="text-ink dark:text-[#f0efe8] group-hover:text-signal dark:group-hover:text-signal transition-colors"
                  />
                  <span className="font-display font-semibold text-sm text-ink dark:text-[#f0efe8]">
                    {card.value}
                  </span>
                  <span className="text-xs text-slate dark:text-[#8b8fa8]">
                    {card.sub}
                  </span>
                  <span className="eyebrow dark:text-[#8b8fa8] mt-auto">
                    {card.label}
                  </span>
                </Tag>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Form + FAQ ── */}
      <section className="container-page py-16">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
          {/* Form */}
          <div>
            <motion.div {...fadeUp()} className="mb-8">
              <p className="eyebrow dark:text-[#8b8fa8] mb-2">Send a message</p>
              <h2 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
                What can we help with?
              </h2>
            </motion.div>

            <AnimatePresence>
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="card-frame p-10 text-center"
                >
                  <div className="grid h-14 w-14 place-items-center border border-ok bg-ok/10 dark:bg-ok/20 mx-auto mb-4">
                    <Check size={22} className="text-ok" />
                  </div>
                  <p className="font-display text-xl font-semibold mb-2 text-ink dark:text-[#f0efe8]">
                    Message received
                  </p>
                  <p className="text-sm text-slate dark:text-[#8b8fa8] max-w-xs mx-auto">
                    We&apos;ll get back to you at your email within one business
                    day. Thanks for reaching out.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="btn-secondary mt-6 mx-auto"
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Error banner */}
                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          marginBottom: 16,
                        }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger"
                      >
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    animate={
                      status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <AnimatedField
                        label="Your name"
                        value={form.name}
                        onChange={(v) => update("name", v)}
                        placeholder="Your Name"
                        required
                      />
                      <AnimatedField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(v) => update("email", v)}
                        placeholder="youremail@example.com"
                        required
                      />
                    </div>

                    {/* Topic select */}
                    <div>
                      <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
                        Topic
                      </label>
                      <div className="relative">
                        <select
                          value={form.topic}
                          onChange={(e) => update("topic", e.target.value)}
                          className="field appearance-none cursor-pointer pr-8 dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8]"
                          required
                        >
                          <option value="">Select a topic</option>
                          {TOPICS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate dark:text-[#8b8fa8]">
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div>
                      <label className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block">
                        Message
                      </label>
                      <div className="relative">
                        <textarea
                          required
                          rows={6}
                          value={form.message}
                          onChange={(e) => update("message", e.target.value)}
                          placeholder="Describe your issue or question in as much detail as you can — order number, product name, anything relevant."
                          className="field resize-none dark:border-[#262932] dark:bg-[#16181f] dark:text-[#f0efe8] dark:placeholder:text-[#5b5e72]"
                        />
                        <span className="absolute bottom-2 right-3 font-mono text-[11px] text-slate-light dark:text-[#5b5e72]">
                          {form.message.length} chars
                        </span>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary disabled:opacity-60"
                    >
                      {status === "loading" ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      {status === "loading" ? "Sending…" : "Send message"}
                    </motion.button>
                  </motion.form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FAQ */}
          <div className="lg:sticky lg:top-24">
            <motion.div {...fadeUp(0.1)} className="mb-6">
              <p className="eyebrow dark:text-[#8b8fa8] mb-2">Quick answers</p>
              <h2 className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8]">
                Common questions
              </h2>
            </motion.div>

            <div className="card-frame divide-y divide-hairline dark:divide-[#262932]">
              {FAQ.map((item, i) => (
                <motion.div key={i} {...fadeUp(0.1 + i * 0.06)}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-hairline/30 dark:hover:bg-[#262932]/50 transition-colors"
                  >
                    <span className="font-medium text-sm text-ink dark:text-[#f0efe8]">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 mt-0.5 font-mono text-slate dark:text-[#8b8fa8]"
                    >
                      ▾
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-slate dark:text-[#8b8fa8] px-5 pb-4 leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Trust strip */}
            <motion.div
              {...fadeUp(0.2)}
              className="mt-6 card-frame divide-y divide-hairline dark:divide-[#262932]"
            >
              <TrustRow icon={MessageSquare} label="Real human replies" />
              <TrustRow icon={ShieldCheck} label="Your data stays private" />
              <TrustRow
                icon={Truck}
                label="Order issues resolved in 1 business day"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TrustRow = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Icon size={15} className="text-signal shrink-0" />
    <span className="text-sm text-ink dark:text-[#f0efe8]">{label}</span>
  </div>
);

export default ContactPage;
