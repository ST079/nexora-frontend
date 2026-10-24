"use client";

import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import AnimatedField from "@/components/AnimatedField";
import AuthShell, { SubmitButton } from "@/components/AuthShell";
import { forgotPassword } from "@/api/auth";
import { LOGIN_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
import { apiErrorMessage } from "@/utils/format";
import { bouncy } from "@/utils/motion";

const RECOVERY_PANEL = {
  scene: "recovery",
  eyebrow: "Account recovery",
  title: "Locked out? We'll email you a link to get back in.",
  points: [
    "The link works once and expires shortly",
    "Your orders and saved address stay as they are",
  ],
};

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
    <AuthShell
      panel={RECOVERY_PANEL}
      eyebrow="Account recovery"
      title={sent ? "Check your inbox" : "Reset your password"}
      intro={
        sent
          ? null
          : "Enter the email you signed up with and we'll send you a link to choose a new password."
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-4xl border border-hairline bg-panel p-6"
          >
            <span className="relative mb-4 grid h-14 w-14 place-items-center">
              <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-2xl bg-ok/30" />
              <motion.span
                initial={{ scale: 0.4, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={bouncy}
                className="relative grid h-14 w-14 place-items-center rounded-2xl bg-ok text-paper"
              >
                <MailCheck size={24} aria-hidden />
              </motion.span>
            </span>
            <p className="text-sm text-ink">
              If an account exists for{" "}
              <span className="break-all font-semibold">{getValues("email")}</span>, a reset
              link is on its way.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate">
              The link works once and expires shortly. Check your spam folder if it
              doesn&apos;t arrive within a few minutes.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="btn-secondary mt-5 w-full"
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <AnimatedField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              error={errors.email?.message}
              {...register("email", USER_RULES.email)}
            />
            <SubmitButton
              status={isSubmitting ? "loading" : "idle"}
              idle="Send reset link"
              loading="Sending…"
            />
          </motion.form>
        )}
      </AnimatePresence>

      <Link
        href={LOGIN_ROUTE}
        className="btn-ghost -ml-4 mt-6 text-slate"
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
