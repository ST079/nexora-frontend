export const ROLE_USER = "USER";
export const ROLE_ADMIN = "ADMIN";
export const ROLE_MERCHANT = "MERCHANT";

export const ROLES = [ROLE_USER, ROLE_ADMIN, ROLE_MERCHANT];

export const ROLE_THEME = {
  [ROLE_ADMIN]: {
    accent: "border-blueprint",
    bg: "bg-blueprint-tint/60 dark:bg-blueprint/10",
    avatarBg: "bg-blueprint",
    text: "text-blueprint",
  },
  [ROLE_MERCHANT]: {
    accent: "border-signal",
    bg: "bg-signal-tint/60 dark:bg-signal/10",
    avatarBg: "bg-signal",
    text: "text-signal",
  },
  [ROLE_USER]: {
    accent: "border-hairline",
    bg: "bg-paper dark:bg-panel",
    avatarBg: "bg-ink dark:bg-hairline",
    text: "text-slate",
  },
};

export const NEPAL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// Mirrors the backend's user schema so the form can explain problems inline.
export const USER_RULES = {
  name: {
    required: "Name is required",
    minLength: { value: 3, message: "At least 3 characters" },
  },
  phone: {
    required: "Phone is required",
    pattern: { value: /^\d{10}$/, message: "10 digits, e.g. 9800000000" },
  },
  email: {
    required: "Email is required",
    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
  },
  password: {
    required: "Password is required",
    minLength: { value: 6, message: "At least 6 characters" },
  },
};
