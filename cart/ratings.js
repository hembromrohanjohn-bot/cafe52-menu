// Guest ratings on the menu (index.html).
//  • Shows each dish's average rating (restaurants/{id}/public/ratings, kept up to date by the staff screen).
//  • Once an order from this phone is served, offers "How was your food?": 1–5 stars per dish and an optional note.
//    Saved to restaurants/{id}/ratings/{orderId}; the rules accept one rating per served order.
// Needs window.MENU_CONFIG (config.js) and cart.js; the menu page provides renderRatings() and ITEM.
const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
const { initializeApp, getApps } = await import(SDK + "firebase-app.js");
const { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } = await import(SDK + "firebase-firestore.js");

const C = window.MENU_CONFIG;
const app = getApps()[0] || initializeApp(C.firebase);
const db = getFirestore(app);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const RATED_KEY = "rated:" + C.restaurantId;
const ASK_FOR_MS = 8 * 3600e3;            // offer a rating for 8 hours after the order was placed
const WORDS = ["", "Poor", "Not great", "Good", "Very good", "Loved it"];

/* ---------- averages on the menu ---------- */

onSnapshot(doc(db, "restaurants", C.restaurantId, "public", "ratings"), snap => {
  window.RATINGS = snap.exists() && snap.get("items") ? snap.get("items") : {};
  if (typeof window.renderRatings === "function") window.renderRatings();
}, err => console.warn("[ratings] Couldn't load ratings:", err));

/* ---------- which orders can be rated ---------- */

let rated = [];
try { rated = JSON.parse(localStorage.getItem(RATED_KEY) || "[]"); } catch (_) {}
const markRated = id => { rated.push(id); try { localStorage.setItem(RATED_KEY, JSON.stringify(rated.slice(-50))); } catch (_) {} };
const rateable = () => (window.MenuCart?.trackedOrders?.() || [])
  .filter(o => o.status === "served" && !rated.includes(o.id) && Date.now() - o.at < ASK_FOR_MS);

// A "Rate your food" button under a served order in the cart's order tracker
C.trackerExtra = o => o.status === "served" && !rated.includes(o.id)
  ? `<button type="button" class="rate-open" data-rate="${esc(o.id)}">★ Rate your food</button>` : "";

// A card at the top of the menu while there's a served order to rate
function paintPrompt() {
  const box = document.getElementById("rate-prompt");
  if (!box) return;
  const o = rateable()[0];
  box.hidden = !o;
  if (o) box.innerHTML = `<div><b>How was your food?</b><span>Order #${esc(o.code)} has been served. Tell us in a few taps.</span></div>`
    + `<button type="button" class="rate-open" data-rate="${esc(o.id)}">Rate it</button>`;
}
document.addEventListener("cart:orders", paintPrompt);
paintPrompt();
setInterval(paintPrompt, 60e3);

/* ---------- the rating sheet ---------- */

let dlg = null, current = null;
function ensureDialog() {
  if (dlg) return dlg;
  dlg = document.createElement("dialog");
  dlg.className = "rate-dialog";
  dlg.setAttribute("aria-labelledby", "rate-title");
  dlg.innerHTML = '<div class="rate-head"><h2 id="rate-title">How was your food?</h2><button type="button" class="rate-x" aria-label="Close">×</button></div>'
    + '<div class="rate-body"></div><div class="rate-foot"></div>';
  document.body.append(dlg);
  dlg.addEventListener("click", onClick);
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  return dlg;
}

async function openRating(orderId) {
  ensureDialog();
  current = { id: orderId, stars: {}, dishes: [], sending: false, error: "" };
  dlg.querySelector(".rate-body").innerHTML = '<p class="rate-note">Loading your order…</p>';
  dlg.querySelector(".rate-foot").innerHTML = "";
  if (!dlg.open) dlg.showModal();
  try {
    const snap = await getDoc(doc(db, "restaurants", C.restaurantId, "orders", orderId));
    if (!snap.exists()) throw new Error("missing");
    // One row per dish, even if it was ordered twice or with different add-ons
    const seen = new Map();
    for (const i of snap.get("items") || []) if (i && i.id && !seen.has(i.id)) seen.set(i.id, i.name);
    current.dishes = [...seen.entries()].map(([id, name]) => ({ id, name }));
    paintDialog();
  } catch (err) {
    console.warn("[ratings] Couldn't load the order:", err);
    dlg.querySelector(".rate-body").innerHTML = '<p class="rate-note">Couldn’t load your order. Check the internet connection and try again.</p>';
  }
}

function paintDialog() {
  const c = current;
  dlg.querySelector(".rate-body").innerHTML = '<p class="rate-note">Tap the stars for each dish. Your ratings help other guests choose.</p>'
    + c.dishes.map(d => `<div class="rate-row" data-id="${esc(d.id)}"><span class="rate-name">${esc(d.name)}</span>`
      + `<span class="rate-stars" role="radiogroup" aria-label="Rating for ${esc(d.name)}">`
      + [1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="${c.stars[d.id] === n}" aria-label="${n} star${n > 1 ? "s" : ""}, ${WORDS[n]}" data-star="${n}" class="${(c.stars[d.id] || 0) >= n ? "on" : ""}">★</button>`).join("")
      + `</span><span class="rate-word">${WORDS[c.stars[d.id] || 0]}</span></div>`).join("")
    + '<label class="rate-comment">Anything to tell the kitchen? <span>(optional, only staff see this)</span><textarea rows="2" maxlength="300"></textarea></label>';
  paintFoot();
}
function paintFoot() {
  const n = Object.keys(current.stars).length;
  dlg.querySelector(".rate-foot").innerHTML = (current.error ? `<p class="rate-error" role="alert">${esc(current.error)}</p>` : "")
    + `<button type="button" class="rate-send"${!n || current.sending ? " disabled" : ""}>${current.sending ? "Sending…" : n ? `Send rating${n > 1 ? "s" : ""}` : "Tap the stars to rate"}</button>`;
}

async function send() {
  const c = current;
  if (c.sending || !Object.keys(c.stars).length) return;
  c.sending = true; c.error = ""; paintFoot();
  const comment = (dlg.querySelector(".rate-comment textarea")?.value || "").trim().slice(0, 300);
  try {
    await setDoc(doc(db, "restaurants", C.restaurantId, "ratings", c.id),
      { order: c.id, items: c.stars, comment, createdAt: serverTimestamp(), counted: false });
    markRated(c.id);
  } catch (err) {
    console.warn("[ratings] Couldn't send:", err);
    if (err.code === "permission-denied") markRated(c.id);   // already rated (or not served): don't ask again
    else { c.sending = false; c.error = "Couldn’t send your rating. Check the internet connection and try again."; paintFoot(); return; }
  }
  dlg.querySelector(".rate-body").innerHTML = '<div class="rate-done"><div class="rate-done-mark" aria-hidden="true">★</div><p><b>Thank you!</b></p><p class="rate-note">We’re glad you came to Café 52.</p></div>';
  dlg.querySelector(".rate-foot").innerHTML = '<button type="button" class="rate-send rate-close">Back to the menu</button>';
  paintPrompt();
  window.MenuCart?.refresh?.();
}

function onClick(e) {
  if (e.target.closest(".rate-x, .rate-close")) { dlg.close(); return; }
  const star = e.target.closest("[data-star]");
  if (star) {
    const id = star.closest(".rate-row").dataset.id, n = Number(star.dataset.star);
    current.stars[id] = n;
    const row = star.closest(".rate-row");
    row.querySelectorAll("[data-star]").forEach(b => { const v = Number(b.dataset.star); b.classList.toggle("on", v <= n); b.setAttribute("aria-checked", String(v === n)); });
    row.querySelector(".rate-word").textContent = WORDS[n];
    paintFoot();
    return;
  }
  if (e.target.closest(".rate-send") && !e.target.closest(".rate-close")) send();
}

// "Rate it" / "★ Rate your food" anywhere on the page (the prompt card or the cart's order tracker)
document.addEventListener("click", e => {
  const b = e.target.closest(".rate-open");
  if (b) { e.preventDefault(); openRating(b.dataset.rate); }
});
