"use client";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { login } from "@/api/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [status, setStatus] = useState("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const loginCredentials = async (data) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const response = await login(data);
      localStorage.setItem("authToken", response.token);
      setStatus("success");
      toast.success("Welcome back.");
      router.replace("/");
    } catch (err) {
      console.error("Login failed:", err);
      setStatus("error");
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Invalid Credentials",
      );
    } finally {
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 2000);
    }
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

          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-start gap-2 border border-danger/40 bg-danger/5 px-3 py-2.5 text-sm text-danger"
              >
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

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
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
              })}
              right={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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

            <motion.button
              type="submit"
              disabled={status === "loading" || status === "success"}
              whileTap={{ scale: 0.98 }}
              className={`relative flex w-full items-center justify-center gap-2 overflow-hidden px-5 py-3 text-sm font-medium tracking-wide text-paper transition-colors ${
                status === "success"
                  ? "bg-ok"
                  : status === "error"
                    ? "bg-danger"
                    : "bg-ink hover:bg-signal"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" && (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={15} className="animate-spin" /> Verifying…
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={15} /> Signed in
                  </motion.span>
                )}
                {(status === "idle" || status === "error") && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2"
                  >
                    Sign in <ArrowRight size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
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
