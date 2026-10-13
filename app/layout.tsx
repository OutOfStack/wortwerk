import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
