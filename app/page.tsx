import Script from "next/script";

// Stroke icons drawn with currentColor (Lucide-style paths).
const icon = (paths: string[]) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths.map(d => <path key={d} d={d} />)}</svg>;
const nav = [
  { view: "today", label: "Today", icon: icon(["M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", "M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"]) },
  { view: "words", label: "Words", icon: icon(["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]) },
  { view: "grammar", label: "Grammar", icon: <b className="nav-glyph" aria-hidden="true">§</b> },
  { view: "progress", label: "Progress", icon: icon(["M22 7 13.5 15.5 8.5 10.5 2 17", "M16 7h6v6"]) },
  { view: "help", label: "Help", icon: icon(["M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20", "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3", "M12 17h.01"]) },
];
const flame = icon(["M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"]);

export const dynamic = "force-dynamic";
export default async function Home() {
  return <><div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#" aria-label="Wortwerk home"><span>W</span>Wortwerk</a><nav aria-label="Main navigation">{nav.map((item, i) => <button key={item.view} className={`nav-item${i ? "" : " active"}`} data-view={item.view}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav><div className="sidebar-foot"><div className="level-ring" id="levelRing" role="img" aria-label="Level 1: Holz 1"><span id="levelNumber">1</span></div><div className="rank-summary"><strong id="rankName">Holz 1</strong><small id="rankProgress">0 / 30 XP · Level 1</small><small id="totalMastery">0 grammar rules passed</small></div></div></aside>
    <main><header className="topbar"><a className="brand topbar-brand" href="#" aria-label="Wortwerk home"><span>W</span>Wortwerk</a><div className="streak">{flame} <strong id="streakCount">1</strong> <span className="streak-label">day streak</span><span className="streak-short" id="streakUnit">day</span></div><button id="soundBtn" className="sound-toggle speech-toggle" type="button" hidden>🔊</button><div id="account" className="account" aria-live="polite">Loading account…</div></header><div id="syncStatus" role="status" aria-live="polite"></div><div id="content"><p className="page">Loading your progress…</p></div></main>
  </div><Script src="/app.js" type="module" strategy="afterInteractive" /></>;
}
