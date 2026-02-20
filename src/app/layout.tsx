import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "FieldForge - Field Service Management",
  description: "Complete field service management solution with photo documentation and offline capabilities",
  keywords: "field service, job management, photo documentation, offline, PWA",
  authors: [{ name: "FieldForge Team" }],
  creator: "FieldForge",
  publisher: "FieldForge",
  robots: "index, follow",
  openGraph: {
    title: "FieldForge - Field Service Management",
    description: "Complete field service management solution with photo documentation and offline capabilities",
    type: "website",
    siteName: "FieldForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "FieldForge - Field Service Management",
    description: "Complete field service management solution with photo documentation and offline capabilities",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FieldForge",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1f2937" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FieldForge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className="antialiased min-h-screen bg-gray-50"
      >
        <ServiceWorkerRegistration />
        {children}
        <PWAInstallBanner />
      </body>
    </html>
  );
}
