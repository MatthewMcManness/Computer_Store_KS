import { useEffect, useMemo, useState } from "react";

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

export default function App() {
  const [authed, setAuthed] = useState(false);
  const { path, navigate } = useRoute();

  // auth bootstrap
  useEffect(() => setAuthed(Boolean(sessionStorage.getItem(TOKEN_KEY))), []);

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
    navigate("/"); // go home
  }
  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
    navigate("/login");
  }

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
      default:
        content = <NotFound />;
    }
  }

  return (
    <div className="app-wrap">
      <Header authed={authed} path={path} onLogout={handleLogout} onNav={(to)=>navigate(to)} />
      <main className="app-main">{content}</main>
      <footer className="app-footer"><small>POC — data is session-only</small></footer>
    </div>
  );
}

function Header({ authed, path, onLogout, onNav }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="dot" />
        <strong>Repair Manager</strong><span className="muted"> POC</span>
      </div>
      <nav className="top-tabs">
        {authed ? (
          <>
            <a href="#/"        className={path === "/" ? "active" : ""}>Dashboard</a>
            <a href="#/customers" className={path.startsWith("/customers") ? "active" : ""}>Customers</a>
            <a href="#/tickets"   className={path.startsWith("/tickets")   ? "active" : ""}>Tickets</a>
          </>
        ) : (
          <a href="#/login" className="active">Login</a>
        )}
      </nav>
      <div className="header-actions">
        {!authed ? <span className="tag">guest</span> : <button className="btn btn-outline" onClick={onLogout}>Logout</button>}
      </div>
    </header>
  );
}

/** ----------------- Pages ----------------- */

function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault(); setErr("");
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return setErr("Enter a valid email.");
    if (pass.length < 4) return setErr("Password must be at least 4 characters.");
    await new Promise(r => setTimeout(r, 250));
    onSuccess("mock-jwt-token");
  }

  return (
    <section className="card login-card">
      <h2>Repair Shop Login</h2>
      {err && <div className="alert">{err}</div>}
      <form onSubmit={submit} className="form">
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourstore.com" required /></label>
        <label>Password<input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required /></label>
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </section>
  );
}

function Dashboard() {
  const customers = load(K_CUSTOMERS, []);
  const tickets = load(K_TICKETS, []);
  const openCount = tickets.filter(t=>t.status!=="Closed").length;

  return (
    <section className="grid2">
      <div className="card">
        <h2>At a glance</h2>
        <div className="metrics">
          <Metric label="Customers" value={customers.length} />
          <Metric label="Tickets (open)" value={openCount} />
          <Metric label="Tickets (total)" value={tickets.length} />
        </div>
        <p className="tiny-note">Role-specific dashboards (technician/receptionist/admin) coming soon.</p>
      </div>
      <div className="card">
        <h3>Recent Tickets</h3>
        <TicketsTable tickets={tickets.slice().sort((a,b)=>b.createdAt-a.createdAt).slice(0,5)} compact />
      </div>
    </section>
  );
}

function Customers() {
  const [list, setList] = useState(() => load(K_CUSTOMERS, []));
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name:"", phone:"", email:"" });

  const filtered = useMemo(() => {
    if (!q) return list;
    const s = q.toLowerCase();
    return list.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s)
    );
  }, [q, list]);

  function addCustomer(e){
    e.preventDefault();
    if (!form.name.trim()) return;
    const next = [{ id: uid(), ...form }, ...list];
    setList(next); save(K_CUSTOMERS, next);
    setForm({ name:"", phone:"", email:"" });
  }

  return (
    <section className="stack">
      <div className="card">
        <h2>Customers</h2>
        <div className="toolbar">
          <input className="input" placeholder="Search name, phone, email…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <CustomersTable customers={filtered} />
      </div>

      <div className="card">
        <h3>Add Customer</h3>
        <form className="form grid2" onSubmit={addCustomer}>
          <label>Name<input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required /></label>
          <label>Phone<input value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} /></label>
          <label>Email<input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} /></label>
          <div><button className="btn btn-primary" type="submit">Add</button></div>
        </form>
      </div>
    </section>
  );
}

function Tickets() {
  const [customers] = useState(() => load(K_CUSTOMERS, []));
  const [tickets, setTickets] = useState(() => load(K_TICKETS, []));
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    title:"", customerId: customers[0]?.id || "", priority:"Normal", status:"Open"
  });

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return tickets.filter(t => {
      const c = customers.find(x=>x.id===t.customerId);
      const custName = c?.name ?? "";
      return !q || t.title.toLowerCase().includes(s) || custName.toLowerCase().includes(s) || t.status.toLowerCase().includes(s);
    });
  }, [q, tickets, customers]);

  function addTicket(e){
    e.preventDefault();
    if (!form.title.trim() || !form.customerId) return;
    const next = [{ id: uid(), createdAt: Date.now(), ...form }, ...tickets];
    setTickets(next); save(K_TICKETS, next);
    setForm(f=>({ ...f, title:"" }));
  }
  function updateStatus(id, status){
    const next = tickets.map(t => t.id===id ? { ...t, status } : t);
    setTickets(next); save(K_TICKETS, next);
  }

  return (
    <section className="stack">
      <div className="card">
        <h2>Tickets</h2>
        <div className="toolbar">
          <input className="input" placeholder="Search tickets…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <TicketsTable
          tickets={filtered}
          customers={customers}
          onStatusChange={updateStatus}
        />
      </div>

      <div className="card">
        <h3>New Ticket</h3>
        <form className="form grid2" onSubmit={addTicket}>
          <label>Title<input value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required /></label>
          <label>Customer
            <select value={form.customerId} onChange={e=>setForm(f=>({...f, customerId:e.target.value}))}>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={e=>setForm(f=>({...f, priority:e.target.value}))}>
              <option>Low</option><option>Normal</option><option>High</option>
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={e=>setForm(f=>({...f, status:e.target.value}))}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </select>
          </label>
          <div><button className="btn btn-primary" type="submit">Create</button></div>
        </form>
      </div>
    </section>
  );
}

function NotFound(){ return <div className="card"><h2>Not found</h2></div>; }

/** -------- small components -------- */

function Metric({ label, value }){
  return <div className="metric"><div className="metric-value">{value}</div><div className="metric-label">{label}</div></div>;
}
function CustomersTable({ customers }){
  return (
    <div className="table">
      <div className="t-head"><span>Name</span><span>Phone</span><span>Email</span></div>
      {customers.map(c=>(
        <div className="t-row" key={c.id}><span>{c.name}</span><span>{c.phone}</span><span>{c.email}</span></div>
      ))}
      {!customers.length && <div className="empty">No customers yet.</div>}
    </div>
  );
}
function TicketsTable({ tickets, customers=[], onStatusChange=()=>{}, compact=false }){
  const nameOf = (id)=> customers.find(c=>c.id===id)?.name ?? "—";
  return (
    <div className={`table ${compact ? "compact" : ""}`}>
      <div className="t-head">
        <span>Title</span><span>Customer</span><span>Status</span><span>Priority</span><span>Created</span>
      </div>
      {tickets.map(t=>(
        <div className="t-row" key={t.id}>
          <span>{t.title}</span>
          <span>{nameOf(t.customerId)}</span>
          <span>
            <select className="pill" value={t.status} onChange={e=>onStatusChange(t.id, e.target.value)}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </select>
          </span>
          <span><span className={`badge ${t.priority.toLowerCase()}`}>{t.priority}</span></span>
          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
      {!tickets.length && <div className="empty">No tickets yet.</div>}
    </div>
  );
}
