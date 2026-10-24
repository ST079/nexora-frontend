"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import AuthShell, {
  AuthError,
  PasswordMeter,
  PasswordToggle,
  SubmitButton,
} from "@/components/AuthShell";
import { useForm, useWatch } from "react-hook-form";
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
import { EASE_OUT } from "@/utils/motion";

const PANEL = {
  scene: "welcome",
  eyebrow: "Join Nexora",
  title: "One account for every order and address.",
  points: [
    "Your address fills itself in at checkout",
    "Track orders from placed to delivered",
    "Shop products from Nexora merchants",
  ],
};

// Two short steps feel lighter than one long form.
const STEPS = [
  { label: "About you", fields: ["name", "phone", "email", "password"] },
  { label: "Delivery", fields: ["province", "city", "street"] },
];

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 32 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE_OUT } },
  exit: (dir) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.18 } }),
};

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    trigger,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { country: "Nepal", province: "" } });
  const password = useWatch({ control, name: "password" }) ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
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

  // Step one only checks its own fields; the address fields aren't mounted
  // yet, so submitting from here must never reach the API.
  const continueToDelivery = async (e) => {
    e.preventDefault();
    if (await trigger(STEPS[0].fields)) setStep(1);
  };

  const dir = step === 1 ? 1 : -1;

  return (
    <AuthShell
      panel={PANEL}
      width="max-w-md"
      eyebrow="New account"
      title={
        <>
          Create your <span className="marker">account</span>
        </>
      }
      intro="Takes under a minute. Your address becomes the default for delivery."
    >
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-semibold">
          <span className="text-ink">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-slate">{STEPS[step].label}</span>
        </div>
        <div aria-hidden className="grid grid-cols-2 gap-1.5">
          {STEPS.map((s, i) => (
            <span key={s.label} className="h-1.5 overflow-hidden rounded-full bg-mist">
              <motion.span
                initial={false}
                animate={{ scaleX: i <= step ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="block h-full origin-left rounded-full bg-signal"
              />
            </span>
          ))}
        </div>
      </div>

      <AuthError message={status === "error" ? error?.message || error : null} />

      <motion.form
        noValidate
        onSubmit={step === 0 ? continueToDelivery : handleSubmit(registerCredentials)}
        animate={status === "error" ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input type="hidden" {...register("country")} />

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          {step === 0 ? (
            <motion.div
              key="you"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <AnimatedField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  hint={errors.password ? undefined : "At least 6 characters"}
                  error={errors.password?.message}
                  {...register("password", USER_RULES.password)}
                  right={
                    <PasswordToggle
                      shown={showPassword}
                      onToggle={() => setShowPassword((s) => !s)}
                    />
                  }
                />
                <PasswordMeter value={password} />
              </div>

              <SubmitButton idle="Continue to delivery" />
            </motion.div>
          ) : (
            <motion.div
              key="delivery"
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="register-province"
                  className={`mb-1.5 flex items-center gap-1.5 text-xs font-semibold ${
                    errors.province ? "text-danger" : "text-slate-dim"
                  }`}
                >
                  Province
                  <span className="text-danger" aria-hidden>
                    *
                  </span>
                </label>
                <select
                  id="register-province"
                  autoFocus
                  autoComplete="address-level1"
                  aria-invalid={errors.province ? true : undefined}
                  aria-describedby={errors.province ? "register-province-message" : undefined}
                  className={`field cursor-pointer ${
                    errors.province ? "border-danger/60 focus:border-danger focus:ring-danger/15" : ""
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
                  <p id="register-province-message" className="mt-1.5 text-[11px] font-medium text-danger">
                    {errors.province.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatedField
                  label="City"
                  autoComplete="address-level2"
                  placeholder="e.g. Pokhara"
                  required
                  error={errors.city?.message}
                  {...register("city", { required: "City is required" })}
                />
                <AnimatedField
                  label="Street"
                  autoComplete="address-line1"
                  hint="Optional"
                  {...register("street")}
                />
              </div>

              <p className="rounded-2xl bg-mist px-4 py-3 text-xs text-slate">
                This becomes your default delivery address. You can change it at checkout.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  disabled={status === "loading" || status === "success"}
                  className="icon-btn h-12 w-12"
                  aria-label="Back to your details"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex-1">
                  <SubmitButton
                    status={status}
                    idle="Create account"
                    loading="Creating account…"
                    success="Account created"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      <p className="mt-7 text-center text-sm text-slate">
        Already have an account?{" "}
        <Link
          href={withNext(LOGIN_ROUTE, next)}
          className="font-semibold text-signal-dim transition-colors hover:text-signal"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
};

// useSearchParams needs a Suspense boundary or the route can't prerender.
const RegisterPage = () => (
  <Suspense fallback={null}>
    <RegisterForm />
  </Suspense>
);

export default RegisterPage;
