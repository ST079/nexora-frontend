"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import AuthVisualPanel from "@/components/AuthVisualPanel";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/redux/auth/authActions";
import { clearAuthError } from "@/redux/auth/authSlice";
import { LOGIN_ROUTE } from "@/constants/routes";
import { NEPAL_PROVINCES, USER_RULES } from "@/constants/user";
import { withNext } from "@/utils/navigation";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { country: "Nepal", province: "" } });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const next = useSearchParams().get("next");

  const { loading, error, user } = useSelector((state) => state.auth);
  const status = loading ? "loading" : error ? "error" : user ? "success" : "idle";

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // The (auth) layout redirects once `user` is set, honouring `?next=`.
  const registerCredentials = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created. Welcome to Nexora.");
    }
  };

  return (
    <div className="flex min-h-screen bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
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
            Takes under a minute. We use your address as the default for delivery.
          </p>

          {/* Error banner */}
          <AnimatePresence>
            {status === "error" && (
              <motion.div
                role="alert"
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
            noValidate
            onSubmit={handleSubmit(registerCredentials)}
            className="space-y-4"
            animate={status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatedField
                label="Full name"
                autoComplete="name"
                required
                error={errors.name?.message}
                {...register("name", USER_RULES.name)}
              />
              <AnimatedField
                label="Phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98XXXXXXXX"
                required
                error={errors.phone?.message}
                {...register("phone", USER_RULES.phone)}
              />
            </div>

            <AnimatedField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register("email", USER_RULES.email)}
            />

            <AnimatedField
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
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

            <fieldset className="grid sm:grid-cols-2 gap-4">
              <legend className="eyebrow dark:text-[#8b8fa8] mb-3 sm:col-span-2">
                Delivery address
              </legend>

              <div>
                <label
                  htmlFor="register-province"
                  className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block"
                >
                  Province<span className="text-danger"> *</span>
                </label>
                <select
                  id="register-province"
                  aria-invalid={errors.province ? true : undefined}
                  className={`w-full border bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-4 py-3 text-sm outline-none focus:border-signal ${
                    errors.province
                      ? "border-danger/60"
                      : "border-hairline dark:border-[#262932]"
                  }`}
                  {...register("province", { required: "Province is required" })}
                >
                  <option value="" disabled>
                    Select a province
                  </option>
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 font-mono text-[11px] text-danger">
                    {errors.province.message}
                  </p>
                )}
              </div>

              <AnimatedField
                label="City"
                autoComplete="address-level2"
                required
                error={errors.city?.message}
                {...register("city", { required: "City is required" })}
              />
              <AnimatedField
                label="Street"
                autoComplete="address-line1"
                {...register("street")}
              />
              <AnimatedField
                label="Country"
                autoComplete="country-name"
                {...register("country")}
              />
            </fieldset>

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
            <Link
              href={withNext(LOGIN_ROUTE, next)}
              className="text-ink dark:text-[#f0efe8] underline hover:text-signal dark:hover:text-signal"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// useSearchParams needs a Suspense boundary or the route can't prerender.
const RegisterPage = () => (
  <Suspense fallback={null}>
    <RegisterForm />
  </Suspense>
);

export default RegisterPage;
