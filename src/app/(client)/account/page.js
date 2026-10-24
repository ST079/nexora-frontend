"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Lock,
  Package,
  LogOut,
  LayoutDashboard,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import { logout, setUser } from "@/redux/auth/authSlice";
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
  PRODUCTS_ROUTE,
} from "@/constants/routes";
import { NEPAL_PROVINCES, ROLE_ADMIN, ROLE_MERCHANT, USER_RULES } from "@/constants/user";
import { isStaff } from "@/constants/navLinks";
import { apiErrorMessage, initials } from "@/utils/format";
import { bouncy, fadeUp, spring } from "@/utils/motion";
import { changePassword, updateProfileImage, updateUser } from "@/api/user";

// Same limit the backend upload middleware enforces.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ROLE_PILLS = {
  [ROLE_ADMIN]: { label: "Admin", icon: ShieldCheck, tone: "bg-blueprint-tint text-blueprint-dim" },
  [ROLE_MERCHANT]: { label: "Merchant", icon: Store, tone: "bg-signal-tint text-signal-dim" },
};
const CUSTOMER_PILL = { label: "Customer", icon: User, tone: "bg-mist text-slate-dim" };

// A rough guide only; the backend's sole rule is six characters.
const STRENGTH = [
  { label: "Too short", bar: "bg-danger", text: "text-danger" },
  { label: "Weak", bar: "bg-danger", text: "text-danger" },
  { label: "Okay", bar: "bg-marigold", text: "text-marigold-dim" },
  { label: "Good", bar: "bg-ok", text: "text-ok" },
  { label: "Strong", bar: "bg-ok", text: "text-ok" },
];

const passwordScore = (pw) => {
  if (!pw || pw.length < 6) return 0;
  let score = 1;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
};

const navRow =
  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist";

const SectionTitle = ({ id, icon: Icon, title, description, children }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-signal-tint text-signal-dim">
        <Icon size={18} aria-hidden />
      </span>
      <div>
        <h2 id={id} className="font-display text-lg font-bold text-ink">
          {title}
        </h2>
        {description && <p className="text-sm text-slate">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const profileValues = (user) => ({
  name: user?.name ?? "",
  email: user?.email ?? "",
  phone: user?.phone ?? "",
  province: user?.address?.province ?? "",
  city: user?.address?.city ?? "",
  street: user?.address?.street ?? "",
});

const AccountPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const previewRef = useRef(null);

  // Free the last preview's object URL when leaving the page.
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    []
  );

  // `values` keeps the form in step with the session, so a saved profile
  // becomes the new baseline and the button goes back to disabled.
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: {
      errors: profileErrors,
      isDirty: profileDirty,
      isSubmitting: savingProfile,
    },
  } = useForm({ values: profileValues(user) });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    control: passwordControl,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control: passwordControl, name: "newPassword" });

  // The (client) layout redirects signed-out visitors.
  if (!user) return null;

  const onProfileSubmit = async (data) => {
    try {
      const updated = await updateUser(user._id, {
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: {
          province: data.province,
          city: data.city.trim(),
          street: data.street.trim(),
        },
      });
      dispatch(
        setUser({
          ...user,
          name: updated?.name ?? data.name,
          phone: updated?.phone ?? data.phone,
          address: updated?.address ?? user.address,
        })
      );
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update your profile."));
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed.");
      resetPasswordForm();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not change your password."));
    }
  };

  const clearPreview = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setAvatarPreview(null);
  };

  const handleAvatarChange = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    // Let the same file be picked again after an error.
    input.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/"))
      return toast.error("Choose an image file (JPG, PNG or WebP).");
    if (file.size > MAX_AVATAR_BYTES)
      return toast.error("Images must be 5 MB or smaller.");

    clearPreview();
    previewRef.current = URL.createObjectURL(file);
    setAvatarPreview(previewRef.current);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const updated = await updateProfileImage(formData);
      dispatch(setUser({ ...user, profileImageUrl: updated?.profileImageUrl }));
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update your photo."));
    } finally {
      clearPreview();
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push(LOGIN_ROUTE);
  };

  const avatarSrc = avatarPreview || user.profileImageUrl;
  const passwordType = showPasswords ? "text" : "password";
  const firstName = user.name?.trim().split(/\s+/)[0] || "there";
  const roles = user.roles?.length ? user.roles : [];
  const pills = roles.map((r) => ROLE_PILLS[r] ?? CUSTOMER_PILL);
  if (!pills.length) pills.push(CUSTOMER_PILL);

  // Checklist from the saved profile: what a courier needs to find you.
  const checklist = [
    { label: "Profile photo", done: Boolean(user.profileImageUrl) },
    { label: "Phone number", done: Boolean(user.phone) },
    { label: "Province", done: Boolean(user.address?.province) },
    { label: "City", done: Boolean(user.address?.city) },
    { label: "Street", done: Boolean(user.address?.street) },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const complete = doneCount === checklist.length;

  const score = passwordScore(newPassword);
  const strength = STRENGTH[score];

  return (
    <div className="container-page min-h-screen bg-paper py-8 transition-colors duration-300 lg:py-10">
      <motion.div {...fadeUp()} className="mb-8">
        <p className="eyebrow mb-2">Account</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Hi, <span className="marker">{firstName}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          Your profile, address and password in one place.
        </p>
      </motion.div>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* ── Sidebar: avatar, checklist, quick links ── */}
        <motion.aside {...fadeUp(0.05)} className="space-y-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-4xl border border-hairline bg-panel text-center shadow-soft">
            <div className="relative h-24 overflow-hidden bg-night dark:border-b dark:border-hairline">
              <span
                aria-hidden
                className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 animate-drift rounded-full bg-signal/50 blur-3xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 top-2 h-24 w-24 animate-drift rounded-full bg-marigold/40 blur-3xl [animation-delay:-4s]"
              />
            </div>

            <div className="px-6 pb-6">
              <div className="relative mx-auto -mt-14 mb-4 h-28 w-28">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ ...bouncy, delay: 0.1 }}
                  className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-signal ring-4 ring-panel"
                >
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <span className="font-display text-3xl font-bold text-on-signal">
                      {initials(user.name)}
                    </span>
                  )}
                  <AnimatePresence>
                    {uploadingAvatar && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 grid place-items-center bg-night/55"
                      >
                        <Loader2 size={22} className="animate-spin text-on-night" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <label
                  htmlFor="avatar-upload"
                  title="Change photo"
                  className={`group absolute bottom-0.5 right-0.5 grid h-10 w-10 place-items-center rounded-full border-4 border-panel bg-ink text-paper shadow-lift transition-transform focus-within:ring-2 focus-within:ring-signal ${
                    uploadingAvatar ? "cursor-wait opacity-60" : "cursor-pointer hover:scale-110"
                  }`}
                >
                  <Camera size={15} aria-hidden="true" className="transition-transform group-hover:-rotate-12" />
                  <span className="sr-only">Change profile photo</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <p className="font-display text-lg font-bold text-ink wrap-break-word">{user.name}</p>
              <p className="mt-0.5 break-all text-xs text-slate">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {pills.map(({ label, icon: Icon, tone }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${tone}`}
                  >
                    <Icon size={11} aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-slate">JPG, PNG or WebP · up to 5 MB</p>
            </div>
          </div>

          {/* Profile checklist */}
          <div className="rounded-4xl border border-hairline bg-panel p-5">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-ink">
                {complete ? "Profile complete" : "Finish your profile"}
              </p>
              <p className="text-xs text-slate">
                {doneCount} of {checklist.length}
              </p>
            </div>
            <div
              className="mb-4 h-2 overflow-hidden rounded-full bg-mist"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuemin={0}
              aria-valuemax={checklist.length}
              aria-valuenow={doneCount}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(doneCount / checklist.length) * 100}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="h-full rounded-full bg-signal"
              />
            </div>
            <ul className="space-y-1.5">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      c.done ? "bg-ok text-paper" : "border-2 border-dashed border-hairline"
                    }`}
                  >
                    {c.done && <Check size={11} strokeWidth={3} aria-hidden />}
                  </span>
                  <span className={c.done ? "text-slate line-through decoration-slate-light" : "text-ink"}>
                    {c.label}
                  </span>
                  <span className="sr-only">{c.done ? "(done)" : "(missing)"}</span>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Account" className="space-y-0.5 rounded-4xl border border-hairline bg-panel p-2">
            {isStaff(user) && (
              <Link href={DASHBOARD_ROUTE} className={navRow}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blueprint-tint text-blueprint-dim">
                  <LayoutDashboard size={16} aria-hidden />
                </span>
                Dashboard
                <ChevronRight size={15} className="ml-auto text-slate transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link href={ORDERS_ROUTE} className={navRow}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-signal-tint text-signal-dim">
                <Package size={16} aria-hidden />
              </span>
              Order history
              <ChevronRight size={15} className="ml-auto text-slate transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href={PRODUCTS_ROUTE} className={navRow}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-marigold-tint text-marigold-dim">
                <ShoppingBag size={16} aria-hidden />
              </span>
              Keep shopping
              <ChevronRight size={15} className="ml-auto text-slate transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-danger/10">
                <LogOut size={16} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </span>
              Log out
            </button>
          </nav>
        </motion.aside>

        {/* ── Main: profile + password forms ── */}
        <div className="space-y-6">
          <motion.section
            {...fadeUp(0.08)}
            aria-labelledby="profile-heading"
            className="rounded-4xl border border-hairline bg-panel p-6 shadow-soft sm:p-8"
          >
            <SectionTitle
              id="profile-heading"
              icon={User}
              title="Personal information"
              description="Checkout fills your address in from here."
            />

            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              noValidate
              className="space-y-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatedField
                  label="Full name"
                  autoComplete="name"
                  required
                  {...registerProfile("name", USER_RULES.name)}
                  error={profileErrors.name?.message}
                />
                <AnimatedField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  disabled
                  hint="Email can't be changed here."
                  className="[&_input]:cursor-not-allowed [&_input]:bg-mist [&_input]:text-slate"
                  {...registerProfile("email")}
                />
              </div>

              <AnimatedField
                label="Phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98XXXXXXXX"
                required
                hint={profileErrors.phone ? undefined : "10 digits, e.g. 9800000000"}
                {...registerProfile("phone", USER_RULES.phone)}
                error={profileErrors.phone?.message}
              />

              <div className="rounded-3xl bg-mist/60 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-signal-dim" aria-hidden />
                  <h3 className="text-sm font-semibold text-ink">Shipping address</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="account-province"
                      className="mb-1.5 block text-xs font-semibold text-slate-dim"
                    >
                      Province
                    </label>
                    <div className="relative">
                      <select
                        id="account-province"
                        autoComplete="address-level1"
                        className="field cursor-pointer appearance-none pr-10"
                        {...registerProfile("province")}
                      >
                        <option value="">Select a province</option>
                        {NEPAL_PROVINCES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        aria-hidden
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate"
                      />
                    </div>
                  </div>
                  <AnimatedField
                    label="City"
                    autoComplete="address-level2"
                    placeholder="e.g. Bhaktapur"
                    {...registerProfile("city")}
                  />
                  <AnimatedField
                    label="Street"
                    autoComplete="street-address"
                    placeholder="e.g. Nagarkot Road"
                    {...registerProfile("street")}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
                <button
                  type="submit"
                  disabled={savingProfile || !profileDirty}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
                <AnimatePresence mode="wait" initial={false}>
                  {profileDirty ? (
                    <motion.div
                      key="dirty"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={spring}
                      className="flex items-center gap-3"
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-marigold-dim">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inset-0 animate-ping rounded-full bg-marigold/70" />
                          <span className="relative h-2 w-2 rounded-full bg-marigold" />
                        </span>
                        Unsaved changes
                      </span>
                      <button
                        type="button"
                        onClick={() => resetProfileForm()}
                        disabled={savingProfile}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        <RotateCcw size={12} /> Discard
                      </button>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="clean"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-1.5 text-xs text-slate"
                    >
                      <Check size={12} className="text-ok" aria-hidden /> All changes saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.section>

          <motion.section
            {...fadeUp(0.1)}
            aria-labelledby="password-heading"
            className="rounded-4xl border border-hairline bg-panel p-6 sm:p-8"
          >
            <SectionTitle
              id="password-heading"
              icon={Lock}
              title="Change password"
              description="You'll stay signed in on this device."
            >
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-pressed={showPasswords}
                className="chip hover:border-ink/25 hover:text-ink"
              >
                {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>
            </SectionTitle>

            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* Lets password managers pair the new password with this account. */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={user.email ?? ""}
                readOnly
                hidden
              />
              <AnimatedField
                label="Current password"
                type={passwordType}
                autoComplete="current-password"
                required
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
                error={passwordErrors.currentPassword?.message}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <AnimatedField
                    label="New password"
                    type={passwordType}
                    autoComplete="new-password"
                    required
                    hint={passwordErrors.newPassword ? undefined : "At least 6 characters"}
                    {...registerPassword("newPassword", {
                      ...USER_RULES.password,
                      required: "New password is required",
                      validate: (val, values) =>
                        val !== values.currentPassword ||
                        "Use a different password from your current one",
                      deps: ["confirmPassword"],
                    })}
                    error={passwordErrors.newPassword?.message}
                  />
                  <AnimatePresence initial={false}>
                    {newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 pt-2.5" aria-live="polite">
                          <div className="flex flex-1 gap-1" aria-hidden>
                            {[1, 2, 3, 4].map((n) => (
                              <span key={n} className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
                                <motion.span
                                  initial={false}
                                  animate={{ width: score >= n ? "100%" : "0%" }}
                                  transition={{ duration: 0.3 }}
                                  className={`block h-full rounded-full ${strength.bar}`}
                                />
                              </span>
                            ))}
                          </div>
                          <span className={`w-16 text-right text-[11px] font-semibold ${strength.text}`}>
                            {strength.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatedField
                  label="Confirm new password"
                  type={passwordType}
                  autoComplete="new-password"
                  required
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (val, values) =>
                      val === values.newPassword || "Passwords don't match",
                  })}
                  error={passwordErrors.confirmPassword?.message}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn-secondary mt-2 disabled:opacity-60"
              >
                {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
