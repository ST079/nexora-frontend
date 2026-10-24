import "./globals.css";
import { Bricolage_Grotesque, Figtree, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { config } from "@/config/config";
import AppProvider from "@/redux/provider";

// Bricolage Grotesque for headlines (variable, with optical sizing), Figtree
// for reading text and Geist Mono for prices, SKUs and small labels.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz", "wdth"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const appName = config.appName || "Nexora";

export const metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: `${appName} — Electronics, fashion & everyday essentials in Nepal`,
    template: `%s · ${appName}`,
  },
  description:
    "Shop phones, laptops, fashion and home essentials from trusted merchants across Nepal. Pay with Khalti, card or cash on delivery.",
  applicationName: appName,
  keywords: [
    "Nexora",
    "online shopping Nepal",
    "electronics Nepal",
    "Khalti",
    "cash on delivery",
  ],
  openGraph: {
    type: "website",
    siteName: appName,
    title: `${appName} — Shop smarter in Nepal`,
    description:
      "Phones, laptops, fashion and home essentials from trusted merchants. Khalti, card and cash on delivery.",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d14" },
  ],
};

// Applies the persisted theme before first paint so dark-mode users don't see
// a white flash. redux-persist stores each slice as a JSON string under "persist:root".
const themeScript = `try{var r=JSON.parse(localStorage.getItem("persist:root")||"{}");var p=JSON.parse(r.userPreferences||"{}");if(p.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

const RootLayout = ({ children }) => {
  return (
    <html
      lang="en"
      className={`h-full ${bricolage.variable} ${figtree.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full font-sans antialiased">
        <AppProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "999px",
                padding: "10px 16px",
                background: "var(--color-ink)",
                color: "var(--color-paper)",
                boxShadow: "var(--shadow-lift)",
              },
              success: {
                iconTheme: { primary: "#ffbf2e", secondary: "#17151c" },
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
