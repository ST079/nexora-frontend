"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { resetPassword } from "@/api/auth";
import { FORGOT_PASSWORD_ROUTE, LOGIN_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
import { apiErrorMessage } from "@/utils/format";

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ password }) => {
    try {
      await resetPassword({ userId, token, password });
      toast.success("Password updated. Sign in with your new password.");
      router.replace(LOGIN_ROUTE);
    } catch (error) {
      toast.error(apiErrorMessage(error, "This link is invalid or has expired."));
    }
  };

  if (!userId || !token) {
    return (
      <div role="alert" className="mt-6 border border-danger/40 bg-danger/5 dark:bg-danger/10 p-5 text-sm text-danger">
        <AlertTriangle size={18} className="mb-2" />
        This reset link is incomplete. Open the link from your email again, or
        request a new one.
        <Link
          href={FORGOT_PASSWORD_ROUTE}
          className="mt-3 block font-mono text-xs underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
        Choose a new password. The link can only be used once.
      </p>
      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AnimatedField
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          autoFocus
          hint={errors.password ? undefined : "At least 6 characters"}
          error={errors.password?.message}
          {...register("password", USER_RULES.password)}
          right={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <AnimatedField
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm", {
            required: "Confirm your new password",
            validate: (value) =>
              value === getValues("password") || "Passwords don't match",
          })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Updating…
            </>
          ) : (
            <>
              Update password <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
    </>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <AuthVisualPanel
        eyebrow="Recovery"
        title="New password, same account. Your orders stay right where they are."
        log={[
          "nexora-auth recovery",
          "verifying single-use token",
          "resolving endpoint… /api/v1/auth/reset-password",
          "awaiting new password",
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
            Set a new password
          </h1>

          {/* useSearchParams needs a Suspense boundary to prerender. */}
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>

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

export default ResetPasswordPage;
