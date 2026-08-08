"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Loader2,
  Lock,
  Package,
  LogOut,
} from "lucide-react";
import AnimatedField from "@/components/AnimatedField";
// import { updateProfile, changePassword } from "@/api/user";
import { logout } from "@/redux/auth/authSlice";
import { LOGIN_ROUTE, ORDERS_ROUTE } from "@/constants/routes";
import { initials } from "@/utils/format";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] },
});

const AccountPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!user) router.replace(LOGIN_ROUTE);
  }, [user, router]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      city: user?.address?.city ?? "",
      street: user?.address?.street ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

  if (!user) return null;

  const onProfileSubmit = async (data) => {
    setSavingProfile(true);
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone,
        address: { city: data.city, street: data.street },
      });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed.");
      resetPasswordForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    // TODO: wire this file into an actual upload call (e.g. updateProfile with FormData)
    toast("Avatar upload not wired up yet — preview only.");
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push(LOGIN_ROUTE);
  };

  return (
    <div className="container-page py-10 bg-paper dark:bg-[#0e0f12] min-h-screen transition-colors duration-300">
      {/* Header */}
      <motion.div {...fadeUp()} className="mb-8">
        <p className="eyebrow dark:text-[#8b8fa8] mb-2">Account</p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-[#f0efe8]">
          My profile
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* ── Sidebar: avatar + quick links ── */}
        <motion.div {...fadeUp(0.05)} className="space-y-4">
          <div className="card-frame p-6 text-center dark:border-[#262932]">
            <div className="relative h-24 w-24 mx-auto mb-4">
              <div className="h-24 w-24 overflow-hidden border border-hairline dark:border-[#262932] bg-ink dark:bg-[#262932] grid place-items-center">
                {avatarPreview || user.profileImageUrl ? (
                  <Image
                    src={avatarPreview || user.profileImageUrl}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-2xl text-paper dark:text-[#f0efe8]">
                    {initials(user.name)}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center bg-ink dark:bg-[#f0efe8] text-paper dark:text-[#0e0f12] cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Camera size={13} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="font-display font-semibold text-ink dark:text-[#f0efe8]">
              {user.name}
            </p>
            <p className="text-xs text-slate dark:text-[#8b8fa8] mt-0.5">
              {user.email}
            </p>
            {user.roles?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {user.roles.map((r) => (
                  <span
                    key={r}
                    className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-hairline dark:bg-[#262932] text-slate dark:text-[#8b8fa8]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="card-frame divide-y divide-hairline dark:divide-[#262932] dark:border-[#262932]">
            <Link
              href={ORDERS_ROUTE}
              className="flex items-center gap-3 px-4 py-3 text-sm text-ink dark:text-[#f0efe8] hover:bg-hairline/20 dark:hover:bg-[#262932]/40 transition-colors"
            >
              <Package size={15} className="text-signal" />
              Order history
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger/5 dark:hover:bg-danger/10 transition-colors"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </motion.div>

        {/* ── Main: profile + password forms ── */}
        <div className="space-y-6">
          {/* Personal info */}
          <motion.div
            {...fadeUp(0.08)}
            className="card-frame p-6 dark:border-[#262932]"
          >
            <div className="flex items-center gap-2 mb-5">
              <User size={15} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">
                Personal information
              </p>
            </div>

            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatedField
                  label="Full name"
                  type="text"
                  {...registerProfile("name", { required: "Name is required" })}
                  error={profileErrors.name?.message}
                />
                <AnimatedField
                  label="Email"
                  type="email"
                  disabled
                  {...registerProfile("email")}
                />
              </div>

              <AnimatedField
                label="Phone"
                type="tel"
                placeholder="e.g 98XXXXXXXX"
                {...registerProfile("phone")}
              />

              <div className="pt-2 border-t border-hairline dark:border-[#262932] mt-2">
                <div className="flex items-center gap-2 mb-4 mt-4">
                  <MapPin size={14} className="text-signal" />
                  <p className="eyebrow dark:text-[#8b8fa8]">
                    Shipping address
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnimatedField
                    label="City"
                    type="text"
                    placeholder="e.g Bhaktapur"
                    {...registerProfile("city")}
                  />
                  <AnimatedField
                    label="Street"
                    type="text"
                    placeholder="e.g nagarkot road"
                    {...registerProfile("street")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn-primary disabled:opacity-60 mt-2"
              >
                {savingProfile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </form>
          </motion.div>

          {/* Password */}
          <motion.div
            {...fadeUp(0.1)}
            className="card-frame p-6 dark:border-[#262932]"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lock size={15} className="text-signal" />
              <p className="eyebrow dark:text-[#8b8fa8]">Change password</p>
            </div>

            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <AnimatedField
                label="Current password"
                type="password"
                {...registerPassword("currentPassword", {
                  required: "Current password is required",
                })}
                error={passwordErrors.currentPassword?.message}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatedField
                  label="New password"
                  type="password"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "At least 8 characters",
                    },
                  })}
                  error={passwordErrors.newPassword?.message}
                />
                <AnimatedField
                  label="Confirm new password"
                  type="password"
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your new password",
                    validate: (val) =>
                      val === watch("newPassword") || "Passwords don't match",
                  })}
                  error={passwordErrors.confirmPassword?.message}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="btn-secondary disabled:opacity-60 mt-2"
              >
                {savingPassword ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
