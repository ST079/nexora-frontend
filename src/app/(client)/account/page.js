"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Camera,
  Loader2,
  Lock,
  Package,
  LogOut,
  LayoutDashboard,
  Eye,
  EyeOff,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
import { logout, setUser } from "@/redux/auth/authSlice";
import {
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  ORDERS_ROUTE,
} from "@/constants/routes";
import { NEPAL_PROVINCES, USER_RULES } from "@/constants/user";
import { isStaff } from "@/constants/navLinks";
import { apiErrorMessage, initials } from "@/utils/format";
import { fadeUp } from "@/utils/motion";
import { changePassword, updateProfileImage, updateUser } from "@/api/user";

// Same limit the backend upload middleware enforces.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

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
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

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

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      <motion.div {...fadeUp()} className="mb-8">
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account</p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
          My profile
        </h1>
        <p className="mt-1 text-sm text-slate dark:text-[#8b8fa8]">
          Keep your details current so orders reach you without a call.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* ── Sidebar: avatar + quick links ── */}
        <motion.div {...fadeUp(0.05)} className="space-y-4">
          <div className="card-frame p-6 text-center dark:border-[#262932]">
            <div className="relative h-24 w-24 mx-auto mb-4">
              <div className="h-24 w-24 overflow-hidden border border-hairline dark:border-[#262932] bg-ink dark:bg-[#262932] grid place-items-center">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <span className="font-display text-2xl text-paper dark:text-[#f0efe8]">
                    {initials(user.name)}
                  </span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 grid place-items-center bg-ink/50">
                    <Loader2 size={18} className="animate-spin text-paper" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                title="Change photo"
                className={`absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12] transition-opacity focus-within:ring-2 focus-within:ring-signal ${
                  uploadingAvatar
                    ? "opacity-50 cursor-wait"
                    : "cursor-pointer hover:opacity-90"
                }`}
              >
                <Camera size={13} aria-hidden="true" />
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
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8] wrap-break-word">
              {user.name}
            </p>
            <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5 break-all">
              {user.email}
            </p>
            {user.roles?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {user.roles.map((r) => (
                  <span
                    key={r}
                    className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-hairline dark:bg-[#262932] text-slate-dim dark:text-[#8b8fa8]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-4 font-mono text-[10px] text-slate dark:text-[#8b8fa8]">
              JPG, PNG or WebP · up to 5 MB
            </p>
          </div>

          <nav
            aria-label="Account"
            className="card-frame divide-y divide-hairline dark:divide-[#262932] dark:border-[#262932]"
          >
            {isStaff(user) && (
              <Link
                href={DASHBOARD_ROUTE}
                className="flex items-center gap-3 px-4 py-3 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
              >
                <LayoutDashboard size={15} className="text-signal" />
                Dashboard
              </Link>
            )}
            <Link
              href={ORDERS_ROUTE}
              className="flex items-center gap-3 px-4 py-3 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
            >
              <Package size={15} className="text-signal" />
              Order history
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger/5 dark:hover:bg-danger/10 transition-colors"
            >
              <LogOut size={15} />
              Log out
            </button>
          </nav>
        </motion.div>

        {/* ── Main: profile + password forms ── */}
        <div className="space-y-6">
          <motion.section
            {...fadeUp(0.08)}
            aria-labelledby="profile-heading"
            className="card-frame p-6 dark:border-[#262932]"
          >
            <div className="flex items-center gap-2 mb-5">
              <User size={15} className="text-signal" />
              <h2 id="profile-heading" className="eyebrow dark:text-[#8b8fa8]">
                Personal information
              </h2>
            </div>

            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              noValidate
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
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
                {...registerProfile("phone", USER_RULES.phone)}
                error={profileErrors.phone?.message}
              />

              <div className="pt-2 border-t border-hairline dark:border-[#262932] mt-2">
                <div className="flex items-center gap-2 mb-4 mt-4">
                  <MapPin size={14} className="text-signal" />
                  <h3 className="eyebrow dark:text-[#8b8fa8]">
                    Shipping address
                  </h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="account-province"
                      className="font-mono text-xs text-slate dark:text-[#8b8fa8] mb-1 block"
                    >
                      Province
                    </label>
                    <select
                      id="account-province"
                      autoComplete="address-level1"
                      className="w-full border border-hairline dark:border-[#262932] bg-paper dark:bg-[#16181f] text-ink dark:text-[#f0efe8] px-4 py-3 text-sm outline-none focus:border-signal"
                      {...registerProfile("province")}
                    >
                      <option value="">Select a province</option>
                      {NEPAL_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
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

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="submit"
                  disabled={savingProfile || !profileDirty}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingProfile && <Loader2 size={14} className="animate-spin" />}
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
                {!profileDirty && (
                  <span className="font-mono text-[11px] text-slate dark:text-[#8b8fa8]">
                    No unsaved changes
                  </span>
                )}
              </div>
            </form>
          </motion.section>

          <motion.section
            {...fadeUp(0.1)}
            aria-labelledby="password-heading"
            className="card-frame p-6 dark:border-[#262932]"
          >
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-signal" />
                <h2 id="password-heading" className="eyebrow dark:text-[#8b8fa8]">
                  Change password
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((v) => !v)}
                aria-pressed={showPasswords}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate dark:text-[#8b8fa8] hover:text-ink dark:hover:text-[#f0efe8]"
              >
                {showPasswords ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>

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

              <div className="grid sm:grid-cols-2 gap-4">
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
                className="btn-secondary disabled:opacity-60 mt-2"
              >
                {savingPassword && <Loader2 size={14} className="animate-spin" />}
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
