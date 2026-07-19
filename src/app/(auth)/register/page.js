"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/redux/auth/authActions";

const RegisterPage = () => {
  const { register, handleSubmit } = useForm();
  const router   = useRouter();
  const dispatch = useDispatch();

  const { loading, error, user } = useSelector((state) => state.auth);
  const status = loading ? "loading" : error ? "error" : user ? "success" : "idle";

  const registerCredentials = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created. Welcome to Nexora.");
      router.replace("/");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <AuthVisualPanel
        eyebrow="New account"
        title="One profile. Every order, address and receipt in one place."
        log={[
          "nexora-auth boot sequence",
          "resolving endpoint… /api/v1/auth/register",
          "provisioning profile",
          "awaiting details",
        ]}
      />

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-lg"
        >
          <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account</p>
          <h1 className="font-display text-3xl font-semibold mb-1 text-ink dark:text-[#f0efe8]">
            Create your account
          </h1>
          <p className="text-sm text-slate dark:text-[#8b8fa8] mb-8">
            Takes under a minute — no card required to browse.
          </p>

          {/* Error banner */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-start gap-2 border border-danger/40 bg-danger/5 dark:bg-danger/10 px-3 py-2.5 text-sm text-danger"
              >
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <span>{error?.message || error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(registerCredentials)}
            className="space-y-4"
            animate={status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatedField label="Full name" {...register("name")}  required />
              <AnimatedField label="Phone"     {...register("phone")} required />
            </div>

            <AnimatedField
              label="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              required
            />

            <AnimatedField
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
              required
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatedField label="City"   {...register("city")}   required />
              <AnimatedField label="Street" {...register("street")} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatedField label="Province" {...register("province")} />
              <AnimatedField label="Country"  {...register("country")}  />
            </div>

            <motion.button
              type="submit"
              disabled={status === "loading" || status === "success"}
              whileTap={{ scale: 0.98 }}
              className={`relative flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide text-paper transition-colors ${
                status === "success"
                  ? "bg-ok"
                  : status === "error"
                    ? "bg-danger"
                    : "bg-ink hover:bg-signal dark:bg-[#f0efe8] dark:text-[#0e0f12] dark:hover:bg-signal dark:hover:text-paper"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {status === "loading" && (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Creating account…
                  </motion.span>
                )}
                {status === "success" && (
                  <motion.span key="success" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                    <Check size={15} /> Account created
                  </motion.span>
                )}
                {(status === "idle" || status === "error") && (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Create account <ArrowRight size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          <p className="mt-6 text-sm text-slate dark:text-[#8b8fa8]">
            Already have an account?{" "}
            <Link href="/login" className="text-ink dark:text-[#f0efe8] underline hover:text-signal dark:hover:text-signal">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;