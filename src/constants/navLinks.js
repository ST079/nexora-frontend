import {
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  DASHBOARD_ROUTE,
  HOME_ROUTE,
  ORDER_MANAGEMENT_ROUTE,
  PRODUCT_MANAGEMENT_ROUTE,
  PRODUCTS_ROUTE,
  USER_MANAGEMENT_ROUTE,
} from "./routes";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
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

export const adminNavLinks = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: DASHBOARD_ROUTE, icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", href: PRODUCT_MANAGEMENT_ROUTE, icon: Package },
      { label: "Orders", href: ORDER_MANAGEMENT_ROUTE, icon: ShoppingCart },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: USER_MANAGEMENT_ROUTE, icon: Users },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];
