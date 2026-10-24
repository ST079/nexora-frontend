"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { forgotPassword } from "@/api/auth";
import { LOGIN_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
import { apiErrorMessage } from "@/utils/format";

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Couldn't send the reset link. Try again."));
    }
  };

  return (
    <div className="flex min-h-screen bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <AuthVisualPanel
        eyebrow="Recovery"
        title="Locked out? We'll email you a one-time link."
        log={[
          "nexora-auth recovery",
          "resolving endpoint… /api/v1/auth/forgot-password",
          "issuing single-use token",
          "awaiting email address",
        ]}
      />

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account recovery</p>
          <h1 className="font-display text-3xl font-semibold mb-1 text-ink dark:text-[#f0efe8]">
            Reset your password
          </h1>

          {sent ? (
            <div role="status" className="mt-6 border border-hairline dark:border-[#262932] p-5">
              <MailCheck size={20} className="text-ok mb-3" />
              <p className="text-sm text-ink dark:text-[#f0efe8]">
                If an account exists for{" "}
                <span className="font-mono">{getValues("email")}</span>, a reset
                link is on its way.
              </p>
              <p className="mt-2 text-xs text-slate dark:text-[#8b8fa8]">
                The link works once and expires shortly. Check your spam folder
                if it doesn&apos;t arrive within a few minutes.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 font-mono text-xs text-slate dark:text-[#8b8fa8] underline hover:text-signal"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
                Enter the email you signed up with and we&apos;ll send you a link
                to choose a new password.
              </p>
              <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <AnimatedField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  autoFocus
                  error={errors.email?.message}
                  {...register("email", USER_RULES.email)}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send reset link <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <Link
            href={LOGIN_ROUTE}
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
