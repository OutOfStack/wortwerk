import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wortwerk — German practice",
  description: "Focused A1–A2 German vocabulary and grammar practice.",
  icons: {
    icon: "/favicon-wortwerk.svg",
    shortcut: "/favicon-wortwerk.svg",
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
