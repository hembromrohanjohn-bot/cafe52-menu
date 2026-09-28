// Staff screen: mark dishes sold out. The list lives at restaurants/{restaurantId}/public/soldout as dish ids
// ("item-106"); guests' menus follow it live, show "Sold out" and take those dishes out of their baskets.
// Needs MENU and EXTRAS (menu-data.js) and window.MENU_CONFIG (config.js) loaded first.
const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
const { initializeApp, getApps } = await import(SDK + "firebase-app.js");
const { getAuth, onAuthStateChanged } = await import(SDK + "firebase-auth.js");
const { getFirestore, doc, onSnapshot, setDoc, arrayUnion, arrayRemove, serverTimestamp } = await import(SDK + "firebase-firestore.js");

const C = window.MENU_CONFIG;
const app = getApps()[0] || initializeApp(C.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const ref = doc(db, "restaurants", C.restaurantId, "public", "soldout");
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Every dish, in menu order: { id, no, name, section }
const DISHES = [];
for (const secs of Object.values(MENU))
  for (const [title, , groups] of secs)
    for (const [glabel, , items] of groups)
      for (const [no, name] of items) DISHES.push({ id: "item-" + no, no, name, section: glabel ? `${title} · ${glabel}` : title });
for (const [no, name] of EXTRAS[2]) DISHES.push({ id: "item-" + no, no, name, section: EXTRAS[0] });
const byId = Object.fromEntries(DISHES.map(d => [d.id, d]));

let soldOut = new Set();
let stop = null;
const busy = new Set();

onAuthStateChanged(auth, user => {
  $("#soldout").hidden = !user;
  if (stop) { stop(); stop = null; }
  if (!user) { if ($("#so-dialog").open) $("#so-dialog").close(); return; }
  stop = onSnapshot(ref, snap => {
    soldOut = new Set(snap.exists() && Array.isArray(snap.get("items")) ? snap.get("items") : []);
    paint();
  }, err => { console.error("[staff] Sold out list:", err); showErr("Couldn't load the sold-out list. Reload the page."); });
});

async function toggle(id) {
  if (busy.has(id)) return;
  busy.add(id);
  const makeSoldOut = !soldOut.has(id);
  paint();
  try {
    await setDoc(ref, { items: makeSoldOut ? arrayUnion(id) : arrayRemove(id), updatedAt: serverTimestamp(), updatedBy: auth.currentUser.email }, { merge: true });
    showErr("");
  } catch (err) {
    console.error("[staff] Couldn't change sold out:", err);
    showErr(err.code === "permission-denied" ? "This account can't change sold-out dishes." : "Couldn't save. Check the internet connection and try again.");
  }
  busy.delete(id);
  paint();
}

function showErr(msg) { $("#so-err").textContent = msg; $("#so-err").hidden = !msg; }

function paint() {
  const list = DISHES.filter(d => soldOut.has(d.id));
  $("#so-summary").textContent = list.length ? `${list.length} dish${list.length === 1 ? "" : "es"} sold out` : "Everything is available";
  $("#so-chips").innerHTML = list.map(d =>
    `<button type="button" class="so-chip" data-id="${d.id}" title="Tap when it's available again"${busy.has(d.id) ? " disabled" : ""}>${esc(d.name)} <small>No. ${d.no}</small><span aria-hidden="true">×</span><span class="sr">, make available again</span></button>`).join("");
  if ($("#so-dialog").open) paintList();
}

function paintList() {
  const q = $("#so-q").value.trim().toLowerCase();
  let html = "", last = "";
  for (const d of DISHES) {
    if (q && !`${d.no} ${d.name} ${d.section}`.toLowerCase().includes(q)) continue;
    if (d.section !== last) { html += `<h3>${esc(d.section)}</h3>`; last = d.section; }
    const out = soldOut.has(d.id);
    html += `<button type="button" class="so-row${out ? " out" : ""}" data-id="${d.id}" aria-pressed="${out}"${busy.has(d.id) ? " disabled" : ""}>`
      + `<span class="so-name">${esc(d.name)}<small>No. ${d.no}</small></span><span class="so-state">${busy.has(d.id) ? "Saving…" : out ? "Sold out" : "Available"}</span></button>`;
  }
  $("#so-list").innerHTML = html || '<p class="none">No dish matches that search.</p>';
}

$("#so-open").addEventListener("click", () => { $("#so-q").value = ""; paintList(); $("#so-dialog").showModal(); $("#so-q").focus(); });
$("#so-done").addEventListener("click", () => $("#so-dialog").close());
$("#so-x").addEventListener("click", () => $("#so-dialog").close());
$("#so-dialog").addEventListener("click", e => { if (e.target === $("#so-dialog")) $("#so-dialog").close(); });
$("#so-q").addEventListener("input", paintList);
$("#so-list").addEventListener("click", e => { const b = e.target.closest(".so-row"); if (b) toggle(b.dataset.id); });
$("#so-chips").addEventListener("click", e => { const b = e.target.closest(".so-chip"); if (b && byId[b.dataset.id]) toggle(b.dataset.id); });
