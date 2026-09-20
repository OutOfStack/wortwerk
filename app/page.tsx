import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  return <><link rel="stylesheet" href="/styles.css" /><div className="app-shell" data-authenticated={user ? "true" : "false"}>
    <aside className="sidebar"><a className="brand" href="#" aria-label="Wortwerk home"><span>W</span>Wortwerk</a><nav aria-label="Main navigation"><button className="nav-item active" data-view="today"><b>⌂</b> Today</button><button className="nav-item" data-view="words"><b>W</b> Words</button><button className="nav-item" data-view="grammar"><b>§</b> Grammar</button><button className="nav-item" data-view="progress"><b>↗</b> Progress</button></nav><div className="sidebar-foot"><div className="level-ring"><span id="levelPct">0%</span></div><div><strong>A1 Explorer</strong><small id="totalMastery">0 skills mastered</small></div></div></aside>
    <main><header className="topbar"><button id="menuBtn" className="icon-btn" aria-label="Open menu">☰</button><div className="streak">🔥 <strong id="streakCount">1</strong> day streak</div>{user ? <div className="account"><span>{user.displayName}</span><a className="sound-toggle" href={chatGPTSignOutPath("/")}>Sign out</a></div> : <a className="sound-toggle" href={chatGPTSignInPath("/")} target="_top">Sign in to sync</a>}</header><div id="content"></div></main>
  </div><div id="toast" role="status" aria-live="polite"></div><script src="/app.js" defer></script></>;
}
