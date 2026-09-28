// Sales report (sales.html): what sold on a day, in a month or in a year, from the orders in Firestore.
// Staff only: it uses the staff screen's sign-in (Firebase keeps it for the whole site). Cancelled orders are left out.
const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
const { initializeApp, getApps } = await import(SDK + "firebase-app.js");
const { getAuth, onAuthStateChanged } = await import(SDK + "firebase-auth.js");
const { getFirestore, collection, query, where, orderBy, getDocs, Timestamp } = await import(SDK + "firebase-firestore.js");

const C = window.MENU_CONFIG;
const app = getApps()[0] || initializeApp(C.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => (C.currency || "₹") + Math.round(Number(n) || 0).toLocaleString(C.locale || "en-IN");
const num = n => Number(n || 0).toLocaleString(C.locale || "en-IN");
const FIRST_YEAR = 2026;                   // the year Café 52 started taking orders online
const pad = n => String(n).padStart(2, "0");
const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDay = d => d.toLocaleDateString(C.locale || "en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Dish number from the cart id ("item-106" → 106); anything else sorts last
const dishNo = id => { const m = /^item-(\d+)$/.exec(id || ""); return m ? Number(m[1]) : null; };

const state = { mode: "day", date: new Date(), sort: "qty" };
state.date.setHours(0, 0, 0, 0);
const cache = new Map();   // "start-end" → orders
let last = null;           // the report on screen, for the CSV download

/* ---------- periods ---------- */

function period() {
  const d = state.date;
  if (state.mode === "day") {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return { start, end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), label: fmtDay(start), file: dayKey(start) };
  }
  if (state.mode === "month") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    return { start, end: new Date(d.getFullYear(), d.getMonth() + 1, 1), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, file: `${d.getFullYear()}-${pad(d.getMonth() + 1)}` };
  }
  const start = new Date(d.getFullYear(), 0, 1);
  return { start, end: new Date(d.getFullYear() + 1, 0, 1), label: String(d.getFullYear()), file: String(d.getFullYear()) };
}

function step(dir) {
  const d = new Date(state.date);
  if (state.mode === "day") d.setDate(d.getDate() + dir);
  else if (state.mode === "month") d.setMonth(d.getMonth() + dir, 1);
  else d.setFullYear(d.getFullYear() + dir, 0, 1);
  state.date = d;
  load();
}

/* ---------- loading and adding up ---------- */

async function fetchOrders(start, end) {
  const key = start.getTime() + "-" + end.getTime();
  // Past periods never change, so they're kept; anything that includes today is fetched fresh each time
  if (cache.has(key) && end <= new Date()) return cache.get(key);
  const q = query(collection(db, "restaurants", C.restaurantId, "orders"),
    where("placedAt", ">=", Timestamp.fromDate(start)), where("placedAt", "<", Timestamp.fromDate(end)), orderBy("placedAt"));
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => d.data()).filter(o => o.status !== "cancelled");
  cache.set(key, orders);
  return orders;
}

function tally(orders) {
  const items = new Map(), days = new Map(), months = new Map();
  let revenue = 0, count = 0;
  for (const o of orders) {
    const when = o.placedAt?.toDate ? o.placedAt.toDate() : new Date(o.createdAt);
    const orderItems = Array.isArray(o.items) ? o.items : [];
    const orderQty = orderItems.reduce((n, i) => n + (Number(i.qty) || 0), 0);
    const orderTotal = Number(o.subtotal) || orderItems.reduce((n, i) => n + (Number(i.lineTotal) || 0), 0);
    revenue += orderTotal; count += orderQty;
    for (const [map, k] of [[days, dayKey(when)], [months, when.getMonth()]]) {
      const r = map.get(k) || { orders: 0, qty: 0, revenue: 0, date: when };
      r.orders++; r.qty += orderQty; r.revenue += orderTotal;
      map.set(k, r);
    }
    for (const i of orderItems) {
      // The same dish at a different price (a price change, or add-ons) gets its own row
      const name = i.name + (i.variant ? ` (${i.variant})` : "") + (i.extras?.length ? ` + ${i.extras.map(e => e.name).join(", ")}` : "");
      const key = `${i.id}|${name}|${i.unitPrice}`;
      const r = items.get(key) || { no: dishNo(i.id), name, price: Number(i.unitPrice) || 0, qty: 0, revenue: 0 };
      r.qty += Number(i.qty) || 0;
      r.revenue += Number(i.lineTotal) || (Number(i.unitPrice) || 0) * (Number(i.qty) || 0);
      items.set(key, r);
    }
  }
  return { orders: orders.length, count, revenue, items: [...items.values()], days: [...days.entries()].sort(), months };
}

async function load() {
  paintControls();
  const p = period();
  $("#period").textContent = p.label;
  $("#results").setAttribute("aria-busy", "true");
  $("#status").hidden = false;
  $("#status").textContent = "Adding up the orders…";
  try {
    const orders = await fetchOrders(p.start, p.end);
    last = { ...tally(orders), p };
    $("#status").hidden = true;
    paint();
  } catch (err) {
    console.error("[sales] Couldn't load orders:", err);
    $("#status").textContent = err.code === "permission-denied"
      ? "This account can't see Café 52's orders. Sign in with the staff account on the Orders screen."
      : "Couldn't load the orders. Check the internet connection and try again.";
  }
  $("#results").removeAttribute("aria-busy");
}

/* ---------- drawing ---------- */

const SORTS = {
  qty: (a, b) => b.qty - a.qty || b.revenue - a.revenue,
  revenue: (a, b) => b.revenue - a.revenue || b.qty - a.qty,
  no: (a, b) => (a.no ?? 1e9) - (b.no ?? 1e9) || a.price - b.price,
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => b.price - a.price
};

function paint() {
  const r = last;
  $("#k-orders").textContent = num(r.orders);
  $("#k-items").textContent = num(r.count);
  $("#k-revenue").textContent = money(r.revenue);
  $("#k-avg").textContent = r.orders ? money(r.revenue / r.orders) : "–";
  $("#csv").disabled = !r.items.length;

  const rows = r.items.slice().sort(SORTS[state.sort]);
  document.querySelectorAll("#items th[data-sort]").forEach(th => th.setAttribute("aria-sort", th.dataset.sort === state.sort ? (state.sort === "name" || state.sort === "no" ? "ascending" : "descending") : "none"));
  $("#items tbody").innerHTML = rows.length
    ? rows.map((i, n) => `<tr><td class="rank">${n + 1}</td><td class="no">${i.no ?? ""}</td><td class="nm">${esc(i.name)}</td><td class="r">${money(i.price)}</td><td class="r q">${num(i.qty)}</td><td class="r">${money(i.revenue)}</td></tr>`).join("")
    : `<tr><td colspan="6" class="none">No orders ${state.mode === "day" ? "on this day" : state.mode === "month" ? "in this month" : "in this year"}.</td></tr>`;
  $("#items tfoot").innerHTML = rows.length
    ? `<tr><td></td><td></td><td>Total</td><td></td><td class="r q">${num(r.count)}</td><td class="r">${money(r.revenue)}</td></tr>` : "";

  // Month: one row per day. Year: one row per month. Tapping a row opens it.
  const by = $("#by");
  if (state.mode === "day" || !r.orders) { by.hidden = true; return; }
  by.hidden = false;
  if (state.mode === "month") {
    $("#by-h").textContent = "Day by day";
    $("#by-body").innerHTML = r.days.map(([k, d]) => `<tr data-day="${k}" tabindex="0"><td>${esc(fmtDay(d.date))}</td><td class="r">${num(d.orders)}</td><td class="r">${num(d.qty)}</td><td class="r">${money(d.revenue)}</td></tr>`).join("");
  } else {
    $("#by-h").textContent = "Month by month";
    $("#by-body").innerHTML = MONTHS.map((m, i) => {
      const d = r.months.get(i);
      return d ? `<tr data-month="${i}" tabindex="0"><td>${m}</td><td class="r">${num(d.orders)}</td><td class="r">${num(d.qty)}</td><td class="r">${money(d.revenue)}</td></tr>` : "";
    }).join("");
  }
}

function paintControls() {
  document.querySelectorAll(".modes button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
  const d = state.date;
  $("#pick-day").hidden = state.mode !== "day";
  $("#pick-month").hidden = state.mode !== "month";
  $("#pick-year").hidden = state.mode !== "year";
  $("#pick-day").value = dayKey(d);
  $("#pick-month").value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  const years = [];
  for (let y = new Date().getFullYear(); y >= FIRST_YEAR; y--) years.push(y);
  if (!years.includes(d.getFullYear())) years.push(d.getFullYear());
  $("#pick-year").innerHTML = years.map(y => `<option${y === d.getFullYear() ? " selected" : ""}>${y}</option>`).join("");
  // No stepping into the future
  const now = new Date(), p = period();
  $("#next").disabled = p.end > now;
}

/* ---------- CSV ---------- */

$("#csv").addEventListener("click", () => {
  if (!last) return;
  const cell = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  const rows = [["No.", "Item", "Price", "Quantity sold", "Revenue"]]
    .concat(last.items.slice().sort(SORTS[state.sort]).map(i => [i.no ?? "", i.name, i.price, i.qty, i.revenue]))
    .concat([["", "Total", "", last.count, last.revenue]]);
  const blob = new Blob(["﻿" + rows.map(r => r.map(cell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `cafe52-sales-${last.p.file}.csv` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

/* ---------- events ---------- */

document.querySelector(".modes").addEventListener("click", e => {
  const b = e.target.closest("button[data-mode]"); if (!b) return;
  state.mode = b.dataset.mode;
  load();
});
$("#prev").addEventListener("click", () => step(-1));
$("#next").addEventListener("click", () => step(1));
$("#today").addEventListener("click", () => { state.date = new Date(); state.date.setHours(0, 0, 0, 0); load(); });
$("#pick-day").addEventListener("change", e => { const [y, m, d] = e.target.value.split("-").map(Number); if (y) { state.date = new Date(y, m - 1, d); load(); } });
$("#pick-month").addEventListener("change", e => { const [y, m] = e.target.value.split("-").map(Number); if (y) { state.date = new Date(y, m - 1, 1); load(); } });
$("#pick-year").addEventListener("change", e => { state.date = new Date(Number(e.target.value), 0, 1); load(); });
$("#items thead").addEventListener("click", e => { const th = e.target.closest("th[data-sort]"); if (th && last) { state.sort = th.dataset.sort; paint(); } });
function openRow(tr) {
  if (!tr) return;
  if (tr.dataset.day) { const [y, m, d] = tr.dataset.day.split("-").map(Number); state.date = new Date(y, m - 1, d); state.mode = "day"; }
  else if (tr.dataset.month) { state.date = new Date(state.date.getFullYear(), Number(tr.dataset.month), 1); state.mode = "month"; }
  else return;
  load();
  window.scrollTo({ top: 0 });
}
$("#by-body").addEventListener("click", e => openRow(e.target.closest("tr")));
$("#by-body").addEventListener("keydown", e => { if (e.key === "Enter") openRow(e.target.closest("tr")); });

/* ---------- sign-in ---------- */

onAuthStateChanged(auth, user => {
  $("#booting").hidden = true;
  $("#signin").hidden = !!user;
  $("#report").hidden = !user;
  $("#who").textContent = user ? "Signed in as " + user.email : "";
  if (user) load();
});
