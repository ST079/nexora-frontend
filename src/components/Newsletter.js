"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Mail, Sparkle } from "lucide-react";
import toast from "react-hot-toast";
import { bouncy, revealUp } from "@/utils/motion";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      // TODO: wire to your actual newsletter/subscribe endpoint
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      toast.success("You're subscribed.");
    } catch {
      toast.error("Could not subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page pb-16 pt-8 lg:pb-24">
      <motion.div
        {...revealUp()}
        className="relative overflow-hidden rounded-4xl bg-marigold px-6 py-12 text-on-marigold sm:px-12 sm:py-16"
      >
        {/* Decorative shapes */}
        <Sparkle
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 animate-spin-slow fill-on-marigold/10 text-on-marigold/10 sm:h-56 sm:w-56"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full border-18 border-on-marigold/10"
        />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="mb-5 inline-grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-night text-on-night">
              <Mail size={20} aria-hidden />
            </span>
            <h2 className="font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl">
              Hear about new drops first.
            </h2>
            <p className="mt-3 max-w-md text-sm sm:text-base">
              No spam. Just restocks, new arrivals and the odd discount.
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <motion.div
                key="done"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={bouncy}
                className="flex items-center gap-3 rounded-full bg-night px-5 py-4 text-on-night"
                role="status"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-marigold text-on-marigold">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className="font-semibold">You&apos;re on the list.</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ scale: 0.95, opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex items-center gap-2 rounded-full bg-white/85 p-1.5 shadow-soft ring-1 ring-on-marigold/10 transition-shadow focus-within:ring-4 focus-within:ring-on-marigold/20"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-on-marigold outline-none placeholder:text-on-marigold/60"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-night px-5 py-3 text-sm font-semibold text-on-night transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
