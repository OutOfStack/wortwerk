'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';

const checks = [
  { label: '8–128 characters', test: (s: string) => [...s].length >= 8 && [...s].length <= 128 },
  { label: 'Uppercase and lowercase letters', test: (s: string) => /\p{Lu}/u.test(s) && /\p{Ll}/u.test(s) },
  { label: 'A number', test: (s: string) => /\p{N}/u.test(s) },
  { label: 'A symbol, such as ! or #', test: (s: string) => /[^\p{L}\p{N}\s]/u.test(s) },
];

export default function SignIn() {
  const [register, setRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    if (register && !checks.every(c => c.test(password))) { setError('Please meet all the password requirements below.'); return; }
    if (register && form.get('confirmPassword') !== password) { setError('Passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/auth/${register ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password, confirmPassword: form.get('confirmPassword') }),
      });
      // Cloudflare can return HTML/plain text when the Worker hits a limit.
      // Keep that failure readable instead of exposing a JSON parse exception.
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok || !result) {
        throw new Error(typeof result?.error === 'string' ? result.error
          : `Account service temporarily unavailable (HTTP ${response.status}). Please try again later.`);
      }
      // Full navigation reinitializes account-specific learning state.
      window.location.assign('/');
    } catch (e) { setError(e instanceof Error ? e.message : 'Connection failed. Please try again.'); setBusy(false); }
  }
  return <><link rel="stylesheet" href="/styles.css" /><main className="auth-page">
    <a className="brand auth-brand" href="/"><span>W</span>Wortwerk</a>
    <section className="auth-card"><span className="eyebrow">Your German workshop</span>
      <h1>{register ? 'Make it yours.' : 'Welcome back.'}</h1>
      <p>{register ? 'Create an account to save your words and grammar progress.' : 'Sign in to continue where you left off.'}</p>
      <form onSubmit={submit} className="auth-form">
        <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={busy} />
        <label htmlFor="password">Password</label>
        <div className="password-row"><input id="password" name="password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} required disabled={busy} aria-describedby={register ? 'password-rules' : undefined} /><button type="button" className="secondary" onClick={() => setShow(!show)} aria-pressed={show}>{show ? 'Hide' : 'Show'}</button></div>
        {register && <><ul id="password-rules" className="password-rules">{checks.map(c => <li key={c.label} className={c.test(password) ? 'met' : ''}>{c.test(password) ? '✓ ' : '○ '}{c.label}</li>)}</ul><label htmlFor="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" required disabled={busy} /></>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
      </form>
      <button className="auth-switch" disabled={busy} onClick={() => { setRegister(!register); setError(''); setPassword(''); }}>{register ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      <a className="guest-link" href="/">Continue as a guest</a>
    </section>
  </main></>;
}
