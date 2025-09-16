import { useEffect, useState } from "react";

const TOKEN_KEY = "csk_token";

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(Boolean(sessionStorage.getItem(TOKEN_KEY)));
  }, []);

  function handleLoginSuccess(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    setAuthed(true);
  }
  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  }

  return (
    <div className="app-wrap">
      <Header authed={authed} onLogout={handleLogout} />
      <main className="app-main">
        {!authed ? (
          <Login onSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
      </main>
      <footer className="app-footer">
        <small>Proof of Concept • No real data yet</small>
      </footer>
    </div>
  );
}

function Header({ authed, onLogout }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="dot" />
        <strong>Repair Manager</strong>
        <span className="muted"> POC</span>
      </div>
      <div className="header-actions">
        {!authed ? (
          <span className="tag">guest</span>
        ) : (
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        )}
      </div>
    </header>
  );
}

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    // very light validation
    if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setErr("Enter a valid email.");
      return;
    }
    if (!pass || pass.length < 4) {
      setErr("Password must be at least 4 characters.");
      return;
    }

    // Fake authentication (POC):
    // In real auth we'll redirect to Auth0; here we just pretend.
    await new Promise(r => setTimeout(r, 300)); // tiny delay so it feels real
    onSuccess("mock-jwt-token");
  }

  return (
    <section className="card login-card">
      <h2>Repair Shop Login</h2>
      <p className="sub">Sign in to access the manager.</p>

      {err && <div className="alert">{err}</div>}

      <form onSubmit={submit} className="form">
        <label>
          Email
          <input
            type="email"
            placeholder="you@yourstore.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>

      <p className="tiny-note">
        Demo only. Next step: swap this for Auth0 Universal Login.
      </p>
    </section>
  );
}

function Dashboard({ onLogout }) {
  return (
    <section className="card">
      <h2>Dashboard</h2>
      <p>Welcome! This is the in-house Repair Manager proof of concept.</p>
      <ul className="list">
        <li>Secure provider login (Auth0) — next</li>
        <li>Customers & Tickets (MongoDB)</li>
        <li>Square payments</li>
      </ul>
      <div className="actions">
        <button className="btn btn-outline" onClick={onLogout}>Logout</button>
      </div>
    </section>
  );
}
