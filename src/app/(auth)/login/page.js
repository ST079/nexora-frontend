"use client";

import Link from "next/link";
import AnimatedField from "@/components/AnimatedField";
import AuthShell, { AuthError, PasswordToggle, SubmitButton } from "@/components/AuthShell";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/auth/authActions";
import { clearAuthError } from "@/redux/auth/authSlice";
import { FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
import { DEMO_ACCOUNT } from "@/constants/demo";
import { withNext } from "@/utils/navigation";

const PANEL = {
  scene: "orders",
  eyebrow: "Good to see you",
  title: "Your bag and orders, right where you left them.",
  points: [
    "Follow each order from placed to delivered",
    "Pay with Khalti, card or cash on delivery",
    "Live stock counts on every product",
  ],
};

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const next = useSearchParams().get("next");

  // Don't greet the form with an error left over from another attempt.
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const { loading, error, user } = useSelector((state) => state.auth);
  const status = loading
    ? "loading"
    : error
      ? "error"
      : user
        ? "success"
        : "idle";

  const loginCredentials = async (data) => {
    const result = await dispatch(loginUser(data));
    // The (auth) layout redirects once `user` is set, honouring `?next=`.
    if (loginUser.fulfilled.match(result))
      toast.success(
        result.payload?.user?.isDemo ? "You're in the demo account. Have a look around." : "Welcome back.",
      );
  };

  // Fills the form in, so visitors see which details are used, then signs in.
  const signInAsDemo = () => {
    setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true });
    setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true });
    handleSubmit(loginCredentials)();
  };

  return (
    <AuthShell
      panel={PANEL}
      eyebrow="Sign in"
      title={
        <>
          Welcome <span className="marker">back</span>
        </>
      }
      intro="Pick up your cart and order history where you left off."
    >
      <div className="mb-6 rounded-3xl border border-dashed border-signal/40 bg-signal-tint/50 p-4 dark:bg-signal/10">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-signal text-on-signal">
            <Sparkles size={16} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Just looking around?</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate">
              Use the shared demo account to try checkout and order tracking without signing up.
            </p>
            <p className="mt-2 break-all font-mono text-[11px] text-slate-dim">
              {DEMO_ACCOUNT.email} · {DEMO_ACCOUNT.password}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={signInAsDemo}
          disabled={status === "loading" || status === "success"}
          className="btn-secondary group mt-3 w-full"
        >
          Sign in as the demo customer
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <AuthError message={status === "error" ? error?.message || error : null} />

      <motion.form
        noValidate
        className="space-y-4"
        onSubmit={handleSubmit(loginCredentials)}
        animate={status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <AnimatedField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", USER_RULES.email)}
        />

        <div>
          <AnimatedField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
            right={
              <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
            }
          />
          <div className="mt-2 flex justify-end">
            <Link
              href={FORGOT_PASSWORD_ROUTE}
              className="text-xs font-semibold text-signal-dim transition-colors hover:text-signal"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton status={status} idle="Sign in" loading="Signing you in…" success="Signed in" />
      </motion.form>

      <div className="my-7 flex items-center gap-3 text-xs text-slate">
        <span className="h-px flex-1 bg-hairline" />
        New to Nexora?
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <Link href={withNext(REGISTER_ROUTE, next)} className="btn-secondary w-full">
        Create an account
      </Link>
    </AuthShell>
  );
};

// useSearchParams needs a Suspense boundary or the route can't prerender.
const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
