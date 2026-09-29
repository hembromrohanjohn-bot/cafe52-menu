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

// Guest ratings given in the period (cart/ratings.js): { items: { "item-1": 5 }, comment, createdAt }
async function fetchRatings(start, end) {
  const key = "r" + start.getTime() + "-" + end.getTime();
  if (cache.has(key) && end <= new Date()) return cache.get(key);
  const q = query(collection(db, "restaurants", C.restaurantId, "ratings"),
    where("createdAt", ">=", Timestamp.fromDate(start)), where("createdAt", "<", Timestamp.fromDate(end)), orderBy("createdAt", "desc"));
  const list = (await getDocs(q)).docs.map(d => d.data());
  cache.set(key, list);
  return list;
}

const STAR_WORDS = ["", "Poor", "Not great", "Good", "Very good", "Loved it"];
const starText = n => "★".repeat(n) + "☆".repeat(5 - n);
// Adds up guest ratings: per-dish averages (best first), the overall average, and the notes guests left
function rateData(list) {
  const names = {};
  // MENU and EXTRAS come from menu-data.js (top-level consts, so not on window)
  for (const secs of Object.values(typeof MENU !== "undefined" ? MENU : {}))
    for (const [, , groups] of secs) for (const [, , items] of groups) for (const [no, name] of items) names["item-" + no] = name;
  for (const [no, name] of (typeof EXTRAS !== "undefined" ? EXTRAS[2] : [])) names["item-" + no] = name;
  const byDish = new Map();
  for (const r of list) for (const [id, n] of Object.entries(r.items || {})) {
    const d = byDish.get(id) || { id, no: dishNo(id), name: names[id] || id, s: 0, n: 0 };
    d.s += n; d.n++; byDish.set(id, d);
  }
  const rows = [...byDish.values()].map(d => ({ ...d, avg: d.s / d.n })).sort((a, b) => b.avg - a.avg || b.n - a.n);
  const all = rows.reduce((t, d) => ({ s: t.s + d.s, n: t.n + d.n }), { s: 0, n: 0 });
  const notes = list.filter(r => r.comment).map(r => ({
    when: r.createdAt?.toDate ? r.createdAt.toDate() : null,
    comment: r.comment,
    dishes: Object.entries(r.items || {}).map(([id, n]) => ({ name: names[id] || id, n }))
  }));
  return { rows, avg: all.n ? all.s / all.n : null, count: all.n, notes };
}
const noteTime = d => d ? d.toLocaleString(C.locale || "en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";

function paintRatings(rt) {
  $("#k-rating").textContent = rt.avg != null ? `★ ${rt.avg.toFixed(1)}` : "–";
  $("#ratings-body").innerHTML = rt.rows.length
    ? rt.rows.map(d => `<tr><td class="no">${d.no ?? ""}</td><td class="nm">${esc(d.name)}</td><td class="r stars">★ ${d.avg.toFixed(1)}</td><td class="r">${num(d.n)}</td></tr>`).join("")
    : '<tr><td colspan="4" class="none">No ratings yet for this period.</td></tr>';
  $("#comments").innerHTML = rt.notes.length
    ? rt.notes.map(r => `<li><p>“${esc(r.comment)}”</p><div class="c-meta">${esc(noteTime(r.when))}</div><div class="c-dishes">`
        + r.dishes.map(d => `<span title="${esc(STAR_WORDS[d.n])}">${esc(d.name)} <b>${starText(d.n)}</b></span>`).join("") + "</div></li>").join("")
    : '<li class="none">No notes from guests in this period.</li>';
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
    const [orders, ratings] = await Promise.all([fetchOrders(p.start, p.end), fetchRatings(p.start, p.end).catch(err => { console.warn("[sales] Ratings:", err); return []; })]);
    last = { ...tally(orders), p, rt: rateData(ratings) };
    $("#status").hidden = true;
    paint();
    paintRatings(last.rt);
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
  $("#xlsx").disabled = $("#print").disabled = false;

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

/* ---------- Excel (.xlsx) and print ---------- */

// ExcelJS is only downloaded when someone asks for a spreadsheet
let excelLib = null;
function loadExcel() {
  excelLib = excelLib || new Promise((resolve, reject) => {
    const el = Object.assign(document.createElement("script"), { src: "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js" });
    el.onload = () => resolve(window.ExcelJS);
    el.onerror = () => { excelLib = null; reject(new Error("Couldn't load the Excel library")); };
    document.head.append(el);
  });
  return excelLib;
}

// A workbook with three sheets, each set up to print on A4: Summary, Items sold, Ratings
async function buildWorkbook(ExcelJS) {
  const r = last, p = r.p;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Café 52"; wb.created = new Date();
  const RUPEE = '"₹"#,##0', CRIMSON = "FFC0182F", GOLD = "FFF2BD2C", SLATE = "FF2A323C", LINE = "FFD9DDE3";
  const thin = { style: "thin", color: { argb: LINE } };
  const printed = `Printed ${new Date().toLocaleString(C.locale || "en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}`;
  const sheet = (name, widths, landscape = false) => {
    const ws = wb.addWorksheet(name, {
      pageSetup: { paperSize: 9, orientation: landscape ? "landscape" : "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0,
        margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } },
      headerFooter: { oddFooter: `&L&8Café 52 · ${p.label}&R&8Page &P of &N` },
      views: [{ showGridLines: false }]
    });
    ws.columns = widths.map(width => ({ width }));
    // Title block: "CAFÉ 52 — Sales", the period, and when it was printed
    ws.mergeCells(1, 1, 1, widths.length);
    Object.assign(ws.getCell(1, 1), { value: `CAFÉ 52  ·  ${name.toUpperCase()}` });
    ws.getCell(1, 1).font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    ws.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: CRIMSON } };
    ws.getCell(1, 1).border = { bottom: { style: "thick", color: { argb: GOLD } } };
    ws.getRow(1).height = 30;
    ws.mergeCells(2, 1, 2, widths.length);
    ws.getCell(2, 1).value = `${p.label}   ·   ${printed}`;
    ws.getCell(2, 1).font = { italic: true, size: 11, color: { argb: "FF5D6877" } };
    ws.addRow([]);
    return ws;
  };
  const header = (ws, cells, rightFrom) => {
    const row = ws.addRow(cells);
    row.eachCell((c, i) => {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE } };
      c.alignment = { horizontal: i >= rightFrom ? "right" : "left", vertical: "middle" };
    });
    row.height = 20;
    return row;
  };
  const body = (row, money = [], right = []) => row.eachCell({ includeEmpty: true }, (c, i) => {
    c.border = { bottom: thin };
    if (money.includes(i)) c.numFmt = RUPEE;
    if (money.includes(i) || right.includes(i)) c.alignment = { horizontal: "right" };
  });
  const totalRow = row => row.eachCell({ includeEmpty: true }, c => {
    c.font = { bold: true }; c.border = { top: { style: "medium", color: { argb: GOLD } } };
  });

  // 1. Summary
  const s1 = sheet("Summary", [26, 16, 16, 18]);
  const kpis = [["Orders", r.orders], ["Items sold", r.count], ["Sales", r.revenue], ["Average order", r.orders ? Math.round(r.revenue / r.orders) : 0],
    ["Guest rating", r.rt.avg != null ? `${r.rt.avg.toFixed(1)} / 5  (${r.rt.count} ratings)` : "No ratings"]];
  for (const [k, v] of kpis) {
    const row = s1.addRow([k, v]);
    row.getCell(1).font = { bold: true, color: { argb: "FF5D6877" } };
    row.getCell(2).font = { bold: true, size: 13 };
    if (k === "Sales" || k === "Average order") row.getCell(2).numFmt = RUPEE;
    row.getCell(2).alignment = { horizontal: "left" };
    row.height = 20;
  }
  if (state.mode !== "day" && r.orders) {
    s1.addRow([]);
    header(s1, [state.mode === "month" ? "Day" : "Month", "Orders", "Items", "Sales"], 2);
    const list = state.mode === "month"
      ? r.days.map(([, d]) => [d.date.toLocaleDateString(C.locale || "en-IN", { weekday: "short", day: "numeric", month: "short" }), d.orders, d.qty, d.revenue])
      : MONTHS.map((m, i) => r.months.get(i) ? [m, r.months.get(i).orders, r.months.get(i).qty, r.months.get(i).revenue] : null).filter(Boolean);
    const first = s1.rowCount + 1;
    list.forEach(v => body(s1.addRow(v), [4], [2, 3]));
    const last_ = s1.rowCount;
    const sum = k => list.reduce((n, v) => n + v[k], 0);
    totalRow(s1.addRow(["Total", { formula: `SUM(B${first}:B${last_})`, result: sum(1) }, { formula: `SUM(C${first}:C${last_})`, result: sum(2) }, { formula: `SUM(D${first}:D${last_})`, result: sum(3) }]));
    s1.getCell(`D${s1.rowCount}`).numFmt = RUPEE;
  }

  // 2. Items sold: number, name, price, quantity, sales
  const s2 = sheet("Items sold", [8, 44, 12, 10, 14]);
  const h2 = header(s2, ["No.", "Item", "Price", "Sold", "Sales"], 3);
  s2.pageSetup.printTitlesRow = `${h2.number}:${h2.number}`;
  const items = r.items.slice().sort(SORTS[state.sort]);
  const f2 = s2.rowCount + 1;
  items.forEach(i => body(s2.addRow([i.no ?? "", i.name, i.price, i.qty, i.revenue]), [3, 5], [1, 4]));
  if (items.length) {
    const l2 = s2.rowCount;
    totalRow(s2.addRow(["", "Total", "", { formula: `SUM(D${f2}:D${l2})`, result: r.count }, { formula: `SUM(E${f2}:E${l2})`, result: r.revenue }]));
    s2.getCell(`E${s2.rowCount}`).numFmt = RUPEE;
    s2.getCell(`D${s2.rowCount}`).alignment = s2.getCell(`E${s2.rowCount}`).alignment = { horizontal: "right" };
  } else s2.addRow(["", "No orders in this period."]);

  // 3. Ratings: per-dish averages, then the notes guests left
  const s3 = sheet("Ratings", [8, 40, 12, 12, 40]);
  const h3 = header(s3, ["No.", "Dish", "Average", "Ratings"], 3);
  s3.pageSetup.printTitlesRow = `${h3.number}:${h3.number}`;
  if (r.rt.rows.length) r.rt.rows.forEach(d => {
    const row = s3.addRow([d.no ?? "", d.name, Math.round(d.avg * 10) / 10, d.n]);
    body(row, [], [1, 3, 4]);
    row.getCell(3).numFmt = '0.0" ★"';
  });
  else s3.addRow(["", "No ratings in this period."]);
  s3.addRow([]);
  const hn = s3.addRow(["", "Notes from guests"]);
  hn.getCell(2).font = { bold: true, size: 13, color: { argb: CRIMSON } };
  header(s3, ["When", "Note", "", "", "Dishes rated"], 99);
  if (r.rt.notes.length) r.rt.notes.forEach(n => {
    const row = s3.addRow([noteTime(n.when), n.comment, "", "", n.dishes.map(d => `${d.name} ${starText(d.n)}`).join("\n")]);
    s3.mergeCells(row.number, 2, row.number, 4);
    row.eachCell({ includeEmpty: true }, c => { c.alignment = { wrapText: true, vertical: "top" }; c.border = { bottom: thin }; });
    row.getCell(2).font = { italic: true };
  });
  else s3.addRow(["", "No notes from guests in this period."]);

  return wb;
}

$("#xlsx").addEventListener("click", async () => {
  if (!last) return;
  const btn = $("#xlsx");
  btn.disabled = true; btn.textContent = "Preparing…";
  try {
    const wb = await buildWorkbook(await loadExcel());
    const blob = new Blob([await wb.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `Cafe52-sales-${last.p.file}.xlsx` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch (err) {
    console.error("[sales] Excel:", err);
    alert("Couldn't make the spreadsheet. Check the internet connection and try again.");
  }
  btn.disabled = false; btn.textContent = "Download Excel";
});

// Print: the page has a print layout (sales.html); stamp when it was printed
$("#print").addEventListener("click", () => {
  $("#printed").textContent = "Printed " + new Date().toLocaleString(C.locale || "en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  window.print();
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
