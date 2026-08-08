"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

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
    } catch (err) {
      toast.error("Could not subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-hairline dark:border-[#262932]">
      <div className="container-page py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto text-center"
        >
          <Mail size={22} className="text-signal mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold text-ink dark:text-[#f0efe8] mb-2">
            Get early access to new drops
          </h2>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-6">
            No spam — just restocks, new arrivals, and occasional discounts.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-sm text-ok font-medium">
              <Check size={16} /> You're on the list.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] px-4 py-2.5 text-sm text-ink dark:text-[#f0efe8] outline-none focus:border-ink dark:focus:border-[#f0efe8] transition-colors placeholder:text-slate-light dark:placeholder:text-[#5b5e72]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary justify-center disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;