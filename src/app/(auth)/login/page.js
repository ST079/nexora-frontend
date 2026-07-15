"use client";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Eye, Loader2 } from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { useForm } from "react-hook-form";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();

  const loginCredentials = (data) => {
    console.log(data);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AuthVisualPanel
        eyebrow="Secure access"
        title="Every session starts with a verified handshake."
        log={[
          "nexora-auth boot sequence",
          "resolving endpoint… /api/v1/auth/login",
          "handshake established",
          "awaiting credentials",
        ]}
      />

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <p className="eyebrow mb-2">Account</p>
          <h1 className="font-display text-3xl font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-slate mb-8">
            Pick up your cart and order history where you left off.
          </p>

          {/* Error banner — show when login fails */}
          <div className="flex items-start gap-2 border border-danger/40 bg-danger/5 px-3 py-2.5 text-sm text-danger mb-4">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>Invalid email or password.</span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(loginCredentials)}>
            <AnimatedField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
              })}
            />

            <AnimatedField
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              right={
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-slate hover:text-ink"
                  aria-label="Show password"
                >
                  <Eye size={15} />
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-mono text-xs text-slate hover:text-signal"
              >
                Forgot password?
              </Link>
            </div>

            {/* ── Idle ── */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-medium tracking-wide text-paper transition-colors hover:bg-signal"
            >
              Sign in <ArrowRight size={15} />
            </button>

            {/* ── Loading (swap above for this while submitting) ──
            <button disabled className="flex w-full items-center justify-center gap-2 bg-ink px-5 py-3 text-sm font-medium tracking-wide text-paper opacity-60 cursor-not-allowed">
              <Loader2 size={15} className="animate-spin" /> Verifying…
            </button>
            */}

            {/* ── Success (swap above for this on success) ──
            <button disabled className="flex w-full items-center justify-center gap-2 bg-ok px-5 py-3 text-sm font-medium tracking-wide text-paper cursor-not-allowed">
              <Check size={15} /> Signed in
            </button>
            */}
          </form>

          <p className="mt-6 text-sm text-slate">
            New to Nexora?{" "}
            <Link
              href="/register"
              className="text-ink underline hover:text-signal"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
