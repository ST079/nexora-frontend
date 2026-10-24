import {
  ABOUT_ROUTE,
  ACCOUNT_SETTING_ROUTE,
  CONTACT_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  ORDER_MANAGEMENT_ROUTE,
  PRODUCT_MANAGEMENT_ROUTE,
  USER_MANAGEMENT_ROUTE,
} from "./routes";
import { ROLE_ADMIN, ROLE_MERCHANT } from "./user";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Globe,
} from "lucide-react";

export const navLinks = [
  {
    label: "Home",
    route: HOME_ROUTE,
  },
  {
    label: "About",
    route: ABOUT_ROUTE,
  },
  {
    label: "Contact",
    route: CONTACT_ROUTE,
  },
];

const STAFF = [ROLE_ADMIN, ROLE_MERCHANT];

// `roles` lists who may see (and open) each item; no `roles` means any
// signed-in user. The (client) layout uses the same rules to guard routes.
export const adminNavLinks = [
  {
    label: "Overview",
    items: [
      { label: "Storefront", href: HOME_ROUTE, icon: Globe },
      {
        label: "Dashboard",
        href: DASHBOARD_ROUTE,
        icon: LayoutDashboard,
        roles: STAFF,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: PRODUCT_MANAGEMENT_ROUTE,
        icon: Package,
        roles: STAFF,
      },
      {
        label: "Orders",
        href: ORDER_MANAGEMENT_ROUTE,
        icon: ShoppingCart,
        roles: STAFF,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Users",
        href: USER_MANAGEMENT_ROUTE,
        icon: Users,
        roles: [ROLE_ADMIN],
      },
      { label: "Account", href: ACCOUNT_SETTING_ROUTE, icon: Settings },
    ],
  },
];

// Routes inside the (client) group that need a specific role.
export const ROUTE_ROLES = {
  [DASHBOARD_ROUTE]: STAFF,
  [PRODUCT_MANAGEMENT_ROUTE]: STAFF,
  [ORDER_MANAGEMENT_ROUTE]: STAFF,
  [USER_MANAGEMENT_ROUTE]: [ROLE_ADMIN],
};

export const hasAnyRole = (user, roles) =>
  !roles || roles.some((role) => user?.roles?.includes(role));

export const isStaff = (user) => hasAnyRole(user, STAFF);

export const canAccessRoute = (user, pathname = "") => {
  const route = Object.keys(ROUTE_ROLES).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return route ? hasAnyRole(user, ROUTE_ROLES[route]) : true;
};

// Nav groups filtered down to what this user may open.
export const navFor = (user) =>
  adminNavLinks
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAnyRole(user, item.roles)),
    }))
    .filter((group) => group.items.length);
