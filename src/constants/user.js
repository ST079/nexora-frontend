export const ROLE_USER = "USER";
export const ROLE_ADMIN = "ADMIN";
export const ROLE_MERCHANT = "MERCHANT";

export const ROLES = [ROLE_USER, ROLE_ADMIN, ROLE_MERCHANT];

export const ROLE_THEME = {
  [ROLE_ADMIN]: {
    accent: "border-[#5C2D91]",
    bg: "bg-[#5C2D91]/5 dark:bg-[#5C2D91]/10",
    avatarBg: "bg-[#5C2D91]",
    text: "text-[#5C2D91]",
  },
  [ROLE_MERCHANT]: {
    accent: "border-[#635BFF]",
    bg: "bg-[#635BFF]/5 dark:bg-[#635BFF]/10",
    avatarBg: "bg-[#635BFF]",
    text: "text-[#635BFF]",
  },
  [ROLE_USER]: {
    accent: "border-hairline dark:border-[#262932]",
    bg: "bg-paper dark:bg-[#16181f]",
    avatarBg: "bg-ink dark:bg-[#262932]",
    text: "text-slate dark:text-[#8b8fa8]",
  },
};
