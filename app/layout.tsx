import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../public/styles.css";

export const metadata: Metadata = {
  title: "Wortwerk — German practice",
  description: "Focused A1–A2 German vocabulary and grammar practice.",
  // Installed launches show the manifest icon full screen, so it needs large PNGs.
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-wortwerk.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-wortwerk.svg",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

// Tints the mobile browser bar to match the page in each theme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1210" },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Fraunces headings and Inter body text; system fonts cover a failed load. */}
        {/* The root layout wraps every page, so the pages/_document rule does not apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500..700&family=Inter:wght@400..800&display=swap" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
