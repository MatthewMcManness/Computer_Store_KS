import { useEffect, useMemo, useState } from "react";

const API = (typeof import.meta !== "undefined" && import.meta.env.VITE_API_URL)
  || window.API
  || "http://localhost:4000";

/** ====== helpers (NEW) ====== */
// Very small, no-deps JWT payload decode (no signature verification — not needed client-side)
function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function getToken() {
  return sessionStorage.getItem("csk_token");
}
function getUserFromToken() {
  const t = getToken();
  if (!t) return { email: null, roles: [] };
  const p = decodeJwtPayload(t);
  return { email: p?.email || null, roles: p?.roles || [] };
}

/** --- simple hash router (no deps) --- */
const useRoute = () => {
  const [path, setPath] = useState(() => window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = (to) => {
    if (!to.startsWith("#")) window.location.hash = to;
    else window.location.hash = to.slice(1);
  };
  return { path, navigate };
};

/** --- storage helpers (sessionStorage for POC) --- */
const TOKEN_KEY = "csk_token";
const K_CUSTOMERS = "csk_customers";
const K_TICKETS = "csk_tickets";

const load = (k, fallback) => {
  try { return JSON.parse(sessionStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};
const save = (k, v) => sessionStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2, 9);

/** ========= APP ========= */
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState({ email:null, roles:[] }); // NEW
  const { path, navigate } = useRoute();

  // auth bootstrap
  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const isAuthed = Boolean(token);
    setAuthed(isAuthed);
    setUser(isAuthed ? getUserFromToken() : {email:null, roles:[]});
  }, []);

  // seed demo data once per session if empty
  useEffect(() => {
    if (!load(K_CUSTOMERS)) {
      const seedCustomers = [
        { id: uid(), name: "Jane Miller", phone: "785-555-0123", email: "jane@example.com" },
        { id: uid(), name: "Ron Patel",  phone: "785-555-0456", email: "ron@example.com"  },
      ];
      save(K_CUSTOMERS, seedCustomers);
    }
    if (!load(K_TICKETS)) {
      const cust = load(K_CUSTOMERS, []);
      const seedTickets = [
        { id: uid(), title: "Laptop won’t boot", customerId: cust[0]?.id, status: "Open", priority: "High", createdAt: Date.now() },
        { id: uid(), title: "Slow desktop",     customerId: cust[1]?.id, status: "In Progress", priority: "Normal", createdAt: Date.now() },
      ];
      save(K_TICKETS, seedTickets);
    }
  }, []);

  function handleLoginSuccess(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
    setAuthed(true);
    setUser(getUserFromToken());        // NEW
    navigate("/"); // go home
  }
  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    setUser({email:null, roles:[]});    // NEW
    navigate("/login");
  }

  const isPlatform = user.roles?.includes("platform"); // NEW

  // route switch
  let content = null;
  if (!authed) {
    content = <Login onSuccess={handleLoginSuccess} />;
  } else {
    switch (true) {
      case path === "/":
        content = <Dashboard />;
        break;
      case path.startsWith("/customers"):
        content = <Customers />;
        break;
      case path.startsWith("/tickets"):
        content = <Tickets />;
        break;
      case path.startsWith("/admin") && isPlatform:   // NEW guarded route
        content = <Admin />;
        break;
      default:
        content = <NotFound />;
    }
  }

  return (
    <div className="app-wrap">
      <Header
        authed={authed}
        path={path}
        onLogout={handleLogout}
        onNav={(to)=>navigate(to)}
        isPlatform={isPlatform}         // NEW
      />
      <main className="app-main">{content}</main>
      <footer className="app-footer"><small>POC — data is session-only</small></footer>
    </div>
  );
}

/** ========= HEADER (show Admin if platform) ========= */
function Header({ authed, path, onLogout, onNav, isPlatform }) {
  const [open, setOpen] = useState(false);
  const is = (p) => path === p || path.startsWith(p + "/");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  function MobileLinks() {
    return (
      <nav className="mobile-menu-nav" role="menu" aria-label="Primary mobile">
        {authed ? (
          <>
            <a role="menuitem" href="#/"          className={is("/") ? "active" : ""}          onClick={() => setOpen(false)}>Dashboard</a>
            <a role="menuitem" href="#/customers" className={is("/customers") ? "active" : ""} onClick={() => setOpen(false)}>Customers</a>
            <a role="menuitem" href="#/tickets"   className={is("/tickets") ? "active" : ""}   onClick={() => setOpen(false)}>Tickets</a>
            {isPlatform && (
              <a role="menuitem" href="#/admin"  className={is("/admin") ? "active" : ""}      onClick={() => setOpen(false)}>Admin</a>
            )}
          </>
        ) : (
          <a role="menuitem" href="#/login" className="active" onClick={() => setOpen(false)}>Login</a>
        )}
      </nav>
    );
  }

  return (
    <>
      <header className="app-header app-header--blue">
        <div className="brand">
          <span className="dot" />
          <strong>Repair Manager</strong>
          <span className="muted"> POC</span>
        </div>

        {/* Desktop tabs */}
        <nav className="top-tabs" role="tablist" aria-label="Primary">
          {authed ? (
            <>
              <a role="tab" aria-selected={is("/")}         className={`tab ${is("/") ? "active" : ""}`}         href="#/">Dashboard</a>
              <a role="tab" aria-selected={is("/customers")} className={`tab ${is("/customers") ? "active" : ""}`} href="#/customers">Customers</a>
              <a role="tab" aria-selected={is("/tickets")}   className={`tab ${is("/tickets") ? "active" : ""}`}   href="#/tickets">Tickets</a>
              {isPlatform && (
                <a role="tab" aria-selected={is("/admin")} className={`tab ${is("/admin") ? "active" : ""}`} href="#/admin">Admin</a>
              )}
            </>
          ) : (
            <a role="tab" aria-selected className="tab active" href="#/login">Login</a>
          )}
        </nav>

        <div className="header-right">
          {authed ? (
            <button className="btn btn-outline btn-outline--light hide-sm" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <span className="tag tag--light hide-sm">guest</span>
          )}

          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open} />
      <aside id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-header">
          <div className="brand brand--light">
            <span className="dot" />
            <strong>Repair Manager</strong>
          </div>
          <button className="close-x" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>
        </div>
        <MobileLinks />
        <div className="mobile-menu-footer">
          {authed ? (
            <button className="btn btn-primary" onClick={() => { setOpen(false); onLogout(); }}>
              Logout
            </button>
          ) : (
            <span className="tag tag--light">guest</span>
          )}
        </div>
      </aside>
    </>
  );
}

/** ----------------- Pages you already have (Dashboard/Customers/Tickets/NotFound) -----------------
 *  (… keep your existing implementations …)
 *  Below we add the Admin page only.
 */

/** ========= Admin (NEW) =========
 *  Create org + owner from the UI (platform only)
 */
function Admin() {
  const token = getToken();
  const [orgName, setOrgName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!orgName || !ownerEmail || !password) {
      setMsg({ type:"error", text:"org name, owner email and password are required."});
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("${APE_URL}/.../api/admin/createOrgWithOwner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orgName, ownerName, ownerEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMsg({ type:"ok", text:`Created org "${data.org.name}" and owner "${data.owner.email}".` });
      setOrgName(""); setOwnerName(""); setOwnerEmail(""); setPassword("");
    } catch (err) {
      setMsg({ type:"error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="stack">
      <div className="card">
        <div className="card-title-row">
          <h2>Platform Admin</h2>
          <span className="sub">Create organization & owner</span>
        </div>

        {msg && (
          <div className={`alert ${msg.type === "ok" ? "success" : ""}`}>
            {msg.text}
          </div>
        )}

        <form className="form grid2" onSubmit={submit}>
          <label>Organization name
            <input value={orgName} onChange={e=>setOrgName(e.target.value)} placeholder="Computer Store KS" required />
          </label>
          <label>Owner name
            <input value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="Max" />
          </label>
          <label>Owner email
            <input type="email" value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} placeholder="max@company.com" required />
          </label>
          <label>Temporary password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="OwnerTemp123" required />
          </label>
          <div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create"}
            </button>
          </div>
        </form>

        <p className="tiny-note">
          This calls <code>POST /api/admin/createOrgWithOwner</code> with your Bearer token.
        </p>
      </div>
    </section>
  );
}
