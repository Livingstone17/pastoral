import { useState } from 'react';
import { useStore } from '../store';

type Mode = 'login' | 'signup';

export default function Auth() {
  const { login, signup } = useStore();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup') {
      if (!name) {
        setError('Please enter your name.');
        return;
      }
      signup(name, email, password);
    } else {
      login(email, password);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bark shadow-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-ink">Shepherd</h1>
        <p className="mt-1 text-sm text-muted-ink">Your ministry companion</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-sm border border-warm-border">
        <h2 className="mb-6 font-serif text-xl font-semibold text-ink">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pastor Jane Smith"
                className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@church.org"
              autoCapitalize="none"
              className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-ink">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-warm-border bg-sand/40 px-4 py-3 text-ink placeholder:text-muted-ink/50 focus:outline-none focus:ring-2 focus:ring-bark/20"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-bark py-3.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            {mode === 'login' ? 'Sign In' : 'Get Started'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-sm text-bark-light"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-ink/60">
        Demo: any email and password will work
      </p>
    </div>
  );
}
