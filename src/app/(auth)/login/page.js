"use client";

import Link from "next/link";
import AnimatedField from "@/components/AnimatedField";
import AuthShell, { AuthError, PasswordToggle, SubmitButton } from "@/components/AuthShell";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/auth/authActions";
import { clearAuthError } from "@/redux/auth/authSlice";
import { FORGOT_PASSWORD_ROUTE, REGISTER_ROUTE } from "@/constants/routes";
import { USER_RULES } from "@/constants/user";
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
    if (loginUser.fulfilled.match(result)) toast.success("Welcome back.");
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
