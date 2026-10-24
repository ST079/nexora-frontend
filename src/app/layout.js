import "./globals.css";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { config } from "@/config/config";
import AppProvider from "@/redux/provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
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
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f12" },
  ],
};

// Applies the persisted theme before first paint so dark-mode users don't see
// a white flash. redux-persist stores each slice as a JSON string under "persist:root".
const themeScript = `try{var r=JSON.parse(localStorage.getItem("persist:root")||"{}");var p=JSON.parse(r.userPreferences||"{}");if(p.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

const RootLayout = ({ children }) => {
  return (
    <html
      lang="en"
      className={`h-full ${spaceGrotesk.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full font-sans antialiased">
        <AppProvider>
          {children}
          <Toaster
            toastOptions={{
              duration: 3000,
              style: { fontSize: "14px", borderRadius: 0 },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
};

export default RootLayout;
