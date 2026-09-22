import Script from "next/script";

export const dynamic = "force-dynamic";
export default async function Home() {
  return <><div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#" aria-label="Wortwerk home"><span>W</span>Wortwerk</a><nav aria-label="Main navigation"><button className="nav-item active" data-view="today"><b>⌂</b> Today</button><button className="nav-item" data-view="words"><b>W</b> Words</button><button className="nav-item" data-view="grammar"><b>§</b> Grammar</button><button className="nav-item" data-view="progress"><b>↗</b> Progress</button></nav><div className="sidebar-foot"><div className="level-ring" id="levelRing" role="img" aria-label="Level 1: Cadet"><span id="levelNumber">1</span></div><div className="rank-summary"><strong id="rankName">Cadet</strong><small id="rankProgress">0 / 30 XP · Level 1</small><small id="totalMastery">0 grammar rules passed</small></div></div></aside>
    <main><header className="topbar"><button id="menuBtn" className="icon-btn" aria-label="Open menu">☰</button><div className="streak">🔥 <strong id="streakCount">1</strong> day streak</div><button id="soundBtn" className="sound-toggle speech-toggle" type="button" hidden>🔊</button><div id="account" className="account" aria-live="polite">Loading account…</div></header><div id="syncStatus" role="status" aria-live="polite"></div><div id="content"><p className="page">Loading your progress…</p></div></main>
  </div><Script src="/app.js" type="module" strategy="afterInteractive" /></>;
}
