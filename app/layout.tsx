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

// Runs in <head> before first paint so a saved theme never flashes the other one.
// The #themeBtn click cycles auto → light → dark; "auto" follows the device setting live.
// It owns the single theme-color meta, so the mobile browser bar matches the chosen theme.
const themeScript = `(()=>{const key='wortwerk-theme',root=document.documentElement,mq=matchMedia('(prefers-color-scheme: dark)'),next={auto:'light',light:'dark',dark:'auto'},labels={auto:'Theme: match device',light:'Theme: light',dark:'Theme: dark'};
let pref;try{pref=localStorage.getItem(key)}catch{}if(!next[pref])pref='auto';
const meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta);
const apply=()=>{const dark=pref==='dark'||(pref==='auto'&&mq.matches);root.dataset.theme=dark?'dark':'light';root.dataset.themePref=pref;
meta.content=dark?'#0f1210':'#f5f2ea';
const button=document.getElementById('themeBtn');if(button){button.setAttribute('aria-label',labels[pref]);button.title=labels[pref]}};
apply();mq.addEventListener('change',apply);document.addEventListener('DOMContentLoaded',apply);
document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#themeBtn'))return;pref=next[pref];try{localStorage.setItem(key,pref)}catch{}apply()})})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme script sets data-theme attributes on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
