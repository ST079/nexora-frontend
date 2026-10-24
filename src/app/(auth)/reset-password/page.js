"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import AnimatedField from "@/components/AnimatedField";
import AuthShell, { PasswordMeter, PasswordToggle, SubmitButton } from "@/components/AuthShell";
import { resetPassword } from "@/api/auth";
import { FORGOT_PASSWORD_ROUTE, LOGIN_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
import { apiErrorMessage } from "@/utils/format";

const PANEL = {
  scene: "recovery",
  eyebrow: "Account recovery",
  title: "New password, same account. Your orders stay right where they are.",
  points: [
    "The link works once and expires shortly",
    "Your orders and saved address stay as they are",
  ],
};

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
    control,
    formState: { errors, isSubmitting },
  } = useForm();
  const password = useWatch({ control, name: "password" }) ?? "";

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
      <div role="alert" className="flex gap-3 rounded-4xl bg-danger/10 p-5 text-sm text-danger">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-danger text-paper">
          <AlertTriangle size={16} aria-hidden />
        </span>
        <div>
          <p className="font-semibold">This reset link is incomplete.</p>
          <p className="mt-1 text-ink/80">
            Open the link from your email again, or request a new one.
          </p>
          <Link href={FORGOT_PASSWORD_ROUTE} className="btn-primary mt-4 px-5 py-2.5">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <AnimatedField
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          autoFocus
          hint={errors.password ? undefined : "At least 6 characters"}
          error={errors.password?.message}
          {...register("password", USER_RULES.password)}
          right={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />}
        />
        <PasswordMeter value={password} />
      </div>
      <AnimatedField
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register("confirm", {
          required: "Confirm your new password",
          validate: (value) => value === getValues("password") || "Passwords don't match",
        })}
      />
      <SubmitButton
        status={isSubmitting ? "loading" : "idle"}
        idle="Update password"
        loading="Updating…"
      />
    </form>
  );
};

const ResetPasswordPage = () => (
  <AuthShell
    panel={PANEL}
    eyebrow="Account recovery"
    title={
      <>
        Set a new <span className="marker">password</span>
      </>
    }
    intro="Choose a new password. The link can only be used once."
  >
    {/* useSearchParams needs a Suspense boundary to prerender. */}
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>

    <Link href={LOGIN_ROUTE} className="btn-ghost -ml-4 mt-6 text-slate">
      <ArrowLeft size={14} /> Back to sign in
    </Link>
  </AuthShell>
);

export default ResetPasswordPage;
