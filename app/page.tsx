export const dynamic = "force-dynamic";
export default async function Home() {
  return <><div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#" aria-label="Wortwerk home"><span>W</span>Wortwerk</a><nav aria-label="Main navigation"><button className="nav-item active" data-view="today"><b>⌂</b> Today</button><button className="nav-item" data-view="words"><b>W</b> Words</button><button className="nav-item" data-view="grammar"><b>§</b> Grammar</button><button className="nav-item" data-view="progress"><b>↗</b> Progress</button></nav><div className="sidebar-foot"><div className="level-ring"><span id="levelPct">0%</span></div><div><strong>A1 Explorer</strong><small id="totalMastery">0 skills mastered</small></div></div></aside>
    <main><header className="topbar"><button id="menuBtn" className="icon-btn" aria-label="Open menu">☰</button><div className="streak">🔥 <strong id="streakCount">1</strong> day streak</div><div id="account" className="account" aria-live="polite">Loading account…</div></header><div id="syncStatus" role="status" aria-live="polite"></div><div id="content"><p className="page">Loading your progress…</p></div></main>
  </div><script src="/app.js" type="module" defer></script></>;
}
