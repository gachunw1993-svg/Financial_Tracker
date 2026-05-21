
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Wallet, CalendarDays, Plus, Search, AlertTriangle, PiggyBank, CreditCard, BarChart3, ListChecks, Settings, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import "./style.css";

const defaultCashSources = [
  { id: 1, category: "Cash with Adrian", amount: 4866 },
  { id: 2, category: "Cash with Auntie Ada", amount: 400 },
  { id: 3, category: "Cash on Hand", amount: 0 },
];

const oneTimeExpenses = [
  { category: "Move-in Costs", amount: 500 },
  { category: "Security Deposit", amount: 1800 },
  { category: "CPA Expenses", amount: 650 },
  { category: "Miscellaneous Buffer", amount: 200 },
];

const monthlyBudgets = [
  { month: "May", rent: 0, utilities: 0, food: 220, gas: 80, insurance: 50, phone: 35, gym: 25, other: 150 },
  { month: "June", rent: 900, utilities: 100, food: 200, gas: 100, insurance: 50, phone: 35, gym: 25, other: 150 },
  { month: "July", rent: 900, utilities: 100, food: 200, gas: 100, insurance: 50, phone: 35, gym: 25, other: 150 },
  { month: "August", rent: 900, utilities: 100, food: 200, gas: 100, insurance: 50, phone: 35, gym: 25, other: 150 },
  { month: "September", rent: 900, utilities: 100, food: 200, gas: 100, insurance: 50, phone: 35, gym: 25, other: 150 },
];

const debtRows = [
  { name: "Venmo Visa", type: "Credit Card", balance: 11879, apr: 27.99, minimum: 300, priority: "High" },
  { name: "Capital One", type: "Credit Card", balance: 1543.48, apr: 28.99, minimum: 50, priority: "High" },
  { name: "PayPal Mastercard", type: "Credit Card", balance: 1100, apr: 30.49, minimum: 40, priority: "High" },
  { name: "Nicholas", type: "Personal", balance: 33400, apr: 0, minimum: 0, priority: "Deferred" },
  { name: "Kit / Kai Gor", type: "Personal", balance: 53067, apr: 0, minimum: 0, priority: "Deferred" },
  { name: "Daisy", type: "Personal", balance: 6000, apr: 0, minimum: 0, priority: "Deferred" },
];

const starterCashflow = [
  { id: 1, date: "May 1", category: "Food", amount: -18.5, note: "Meal" },
  { id: 2, date: "May 3", category: "Gas", amount: -42.0, note: "Fuel" },
  { id: 3, date: "May 6", category: "Car Registration", amount: -160, note: "One-time" },
  { id: 4, date: "May 12", category: "Phone Bill", amount: -400, note: "Paid Chester" },
  { id: 5, date: "May 20", category: "Cash Transfer", amount: 500, note: "Support / reserve" },
];

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Button({ children, onClick, variant = "primary", className = "" }) {
  return <button onClick={onClick} className={`btn ${variant} ${className}`}>{children}</button>;
}

function Input(props) {
  return <input {...props} className={`input ${props.className || ""}`} />;
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <div className="stat">
        <div className="iconBox"><Icon size={20} /></div>
        <div className="statText">
          <p className="muted tiny">{label}</p>
          <p className="statValue">{value}</p>
          {sub && <p className="muted tiny">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

function PageTitle({ title, subtitle }) {
  return (
    <div className="pageTitle">
      <h2>{title}</h2>
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
  );
}

function BottomNav({ current, setCurrent }) {
  const items = [
    { id: "dashboard", label: "Home", icon: BarChart3 },
    { id: "cashflow", label: "Log", icon: Plus },
    { id: "budget", label: "Budget", icon: CalendarDays },
    { id: "debt", label: "Debt", icon: CreditCard },
    { id: "settings", label: "More", icon: Settings },
  ];
  return (
    <div className="bottomNav">
      <div className="bottomInner">
        {items.map(item => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button key={item.id} onClick={() => setCurrent(item.id)} className={`navBtn ${active ? "active" : ""}`}>
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FinancialTrackerIPhoneApp() {
  const [tab, setTab] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [cashSources, setCashSources] = useState(() => loadState("clarence_cash_sources", defaultCashSources));
  const [cashflow, setCashflow] = useState(() => loadState("clarence_cashflow", starterCashflow));
  const [newItem, setNewItem] = useState({ date: "", category: "", amount: "", note: "" });

  useEffect(() => localStorage.setItem("clarence_cash_sources", JSON.stringify(cashSources)), [cashSources]);
  useEffect(() => localStorage.setItem("clarence_cashflow", JSON.stringify(cashflow)), [cashflow]);

  const totalCash = useMemo(() => cashSources.reduce((sum, x) => sum + Number(x.amount || 0), 0), [cashSources]);
  const totalOneTime = useMemo(() => oneTimeExpenses.reduce((sum, x) => sum + x.amount, 0), []);
  const netAfterOneTime = totalCash - totalOneTime;
  const activeDebt = debtRows.filter(d => d.apr > 0).reduce((sum, d) => sum + d.balance, 0);
  const totalDebt = debtRows.reduce((sum, d) => sum + d.balance, 0);
  const cashflowTotal = cashflow.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const budgetChart = monthlyBudgets.map(m => ({
    month: m.month,
    total: m.rent + m.utilities + m.food + m.gas + m.insurance + m.phone + m.gym + m.other,
  }));

  const filteredCashflow = cashflow.filter(row => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase()));

  function addCashflowItem() {
    if (!newItem.date || !newItem.category || !newItem.amount) return;
    setCashflow([{ id: Date.now(), ...newItem, amount: Number(newItem.amount) }, ...cashflow]);
    setNewItem({ date: "", category: "", amount: "", note: "" });
  }

  function deleteCashflowItem(id) {
    setCashflow(cashflow.filter(row => row.id !== id));
  }

  function resetDemoData() {
    setCashSources(defaultCashSources);
    setCashflow(starterCashflow);
  }

  return (
    <div className="app">
      <main className="container">
        <header className="header">
          <div>
            <h1>Financial Tracker</h1>
            <p>iPhone app prototype</p>
          </div>
          <span className="pill">Local Save</span>
        </header>

        {tab === "dashboard" && (
          <section className="page">
            <PageTitle title="Dashboard" subtitle="Cash, runway pressure, budget, and debt overview." />
            <div className="grid2">
              <StatCard icon={Wallet} label="Cash" value={money(totalCash)} sub="Current sources" />
              <StatCard icon={PiggyBank} label="After setup" value={money(netAfterOneTime)} sub="After one-time costs" />
              <StatCard icon={CreditCard} label="Active debt" value={money(activeDebt)} sub="Interest-bearing" />
              <StatCard icon={ListChecks} label="Cashflow net" value={money(cashflowTotal)} sub="Logged entries" />
            </div>

            <Card>
              <p className="cardTitle">Monthly budget</p>
              <p className="muted tiny">Expected spending by month</p>
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="cardTitle">Cash movement</p>
              <p className="muted tiny">Running total from logged entries</p>
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...cashflow].reverse().map((r, i, arr) => ({ ...r, running: arr.slice(0, i + 1).reduce((s, x) => s + Number(x.amount || 0), 0) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Line type="monotone" dataKey="running" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>
        )}

        {tab === "cashflow" && (
          <section className="page">
            <PageTitle title="Log Cashflow" subtitle="Add income, expenses, transfers, and notes." />
            <Card>
              <div className="form">
                <Input placeholder="Date, e.g. May 21" value={newItem.date} onChange={e => setNewItem({ ...newItem, date: e.target.value })} />
                <Input placeholder="Category, e.g. Rent / Food / EDD" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                <Input placeholder="Amount, use negative for expense" inputMode="decimal" type="number" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} />
                <Input placeholder="Note" value={newItem.note} onChange={e => setNewItem({ ...newItem, note: e.target.value })} />
                <Button onClick={addCashflowItem}><Plus size={17} /> Add Entry</Button>
              </div>
            </Card>

            <div className="searchWrap">
              <Search size={16} />
              <Input placeholder="Search entries" value={query} onChange={e => setQuery(e.target.value)} />
            </div>

            <div className="list">
              {filteredCashflow.map(row => (
                <Card key={row.id}>
                  <div className="row">
                    <div>
                      <p className="cardTitle">{row.category}</p>
                      <p className="muted tiny">{row.date}</p>
                      {row.note && <p className="muted note">{row.note}</p>}
                    </div>
                    <div className="right">
                      <p className="amount">{money(row.amount)}</p>
                      <button className="trash" onClick={() => deleteCashflowItem(row.id)}><Trash2 size={17} /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {tab === "budget" && (
          <section className="page">
            <PageTitle title="Budget" subtitle="Monthly expected spending from the spreadsheet tabs." />
            {monthlyBudgets.map(month => {
              const total = Object.entries(month).filter(([k]) => k !== "month").reduce((s, [, v]) => s + v, 0);
              return (
                <Card key={month.month}>
                  <div className="monthHeader">
                    <p className="cardTitle">{month.month}</p>
                    <p className="amount">{money(total)}</p>
                  </div>
                  <div className="budgetRows">
                    {Object.entries(month).filter(([k]) => k !== "month").map(([k, v]) => (
                      <div key={k} className="budgetRow"><span>{k}</span><strong>{money(v)}</strong></div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </section>
        )}

        {tab === "debt" && (
          <section className="page">
            <PageTitle title="Debt" subtitle="Active interest debt plus deferred personal balances." />
            <div className="grid2">
              <StatCard icon={CreditCard} label="Active" value={money(activeDebt)} sub="Interest-bearing" />
              <StatCard icon={ListChecks} label="Total" value={money(totalDebt)} sub="Includes deferred" />
            </div>
            {debtRows.map(row => (
              <Card key={row.name}>
                <div className="monthHeader">
                  <div>
                    <p className="cardTitle">{row.name}</p>
                    <p className="muted tiny">{row.type} · {row.priority}</p>
                  </div>
                  <p className="amount">{money(row.balance)}</p>
                </div>
                <div className="grid2 smallGrid">
                  <div className="miniBox"><p className="muted tiny">APR</p><strong>{row.apr}%</strong></div>
                  <div className="miniBox"><p className="muted tiny">Minimum</p><strong>{money(row.minimum)}</strong></div>
                </div>
              </Card>
            ))}
          </section>
        )}

        {tab === "settings" && (
          <section className="page">
            <PageTitle title="More" subtitle="Install instructions and next upgrades." />
            <Card>
              <div className="row start">
                <AlertTriangle size={20} />
                <div>
                  <p className="cardTitle">Install on iPhone</p>
                  <p className="muted note">Deploy this as a web app, open it in Safari, tap Share, then Add to Home Screen.</p>
                </div>
              </div>
            </Card>
            <Card>
              <p className="cardTitle">Next upgrades</p>
              <ol className="muted nextList">
                <li>Import the real Google Sheet data automatically.</li>
                <li>Add editable budget and debt fields.</li>
                <li>Add runway alerts and monthly reports.</li>
                <li>Add Supabase/Firebase login for cloud sync.</li>
              </ol>
              <Button variant="secondary" onClick={resetDemoData}>Reset Demo Data</Button>
            </Card>
          </section>
        )}
      </main>
      <BottomNav current={tab} setCurrent={setTab} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<FinancialTrackerIPhoneApp />);
