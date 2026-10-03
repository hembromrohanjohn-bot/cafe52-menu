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
// cart.js loads this phone's orders when the page has finished loading, which can be after this script runs
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(paintPrompt));
else setTimeout(paintPrompt);
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
    + '<label class="rate-comment">Write a review <span>(optional)</span><textarea rows="3" maxlength="500" placeholder="What did you like? What could be better?"></textarea></label>'
    + '<label class="rate-phone">Your mobile number <span>(optional)</span><span class="rate-phone-in"><span aria-hidden="true">+91</span>'
    + '<input type="tel" inputmode="numeric" maxlength="16" autocomplete="tel-national" placeholder="10-digit number" aria-describedby="rate-phone-why"></span>'
    + '<small id="rate-phone-why">Only Café 52 sees it, to thank you or follow up on your review. We never share it.</small></label>';
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
  const comment = (dlg.querySelector(".rate-comment textarea")?.value || "").trim().slice(0, 500);
  const phoneIn = dlg.querySelector(".rate-phone input");
  // Indian mobile numbers: 10 digits starting 6–9; "+91" or a leading 0 typed in are dropped
  const phone = (phoneIn?.value || "").replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  if (phone && !/^[6-9]\d{9}$/.test(phone)) {
    c.error = "Please enter a 10-digit mobile number, or leave it empty.";
    paintFoot(); phoneIn.setAttribute("aria-invalid", "true"); phoneIn.focus();
    return;
  }
  c.review = comment;
  c.sending = true; c.error = ""; paintFoot();
  try {
    await setDoc(doc(db, "restaurants", C.restaurantId, "ratings", c.id),
      { order: c.id, items: c.stars, comment, phone, createdAt: serverTimestamp(), counted: false });
    markRated(c.id);
  } catch (err) {
    console.warn("[ratings] Couldn't send:", err);
    if (err.code === "permission-denied") markRated(c.id);   // already rated (or not served): don't ask again
    else { c.sending = false; c.error = "Couldn’t send your rating. Check the internet connection and try again."; paintFoot(); return; }
  }
  // Offer Google to everyone who rates, whatever their stars (Google doesn't allow asking only happy guests)
  dlg.querySelector(".rate-body").innerHTML = '<div class="rate-done"><div class="rate-done-mark" aria-hidden="true">★</div><p><b>Thank you!</b></p><p class="rate-note">We’re glad you came to Café 52.</p></div>'
    + '<div class="rate-google"><p><b>Share it on Google?</b> Your review helps other people find Café 52. It takes a few seconds with your Google account.</p>'
    + (c.review ? '<p class="rate-note">We’ll copy your review, so you can just paste it on Google.</p>' : "")
    + '<button type="button" class="rate-google-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4z"/></svg>Post on Google</button>'
    + '<p class="rate-copied" role="status" hidden></p></div>';
  dlg.querySelector(".rate-foot").innerHTML = '<button type="button" class="rate-send rate-close">Back to the menu</button>';
  paintPrompt();
  window.MenuCart?.refresh?.();
}

// Google review page: MENU_CONFIG.googleReviewUrl (the "Ask for reviews" link from Google Business Profile) opens the
// review box directly; without it, Google Maps opens on Café 52, where guests tap "Write a review".
function googleUrl() {
  return C.googleReviewUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.googlePlaceQuery || C.restaurantName);
}
async function openGoogle() {
  const note = dlg.querySelector(".rate-copied");
  // Copy first: opening a tab uses up the tap, and browsers only allow copying during a tap
  const copying = current?.review && navigator.clipboard ? navigator.clipboard.writeText(current.review) : null;
  const win = window.open(googleUrl(), "_blank");
  if (win) win.opener = null;
  else location.href = googleUrl();   // pop-ups blocked: go there in this tab
  if (current?.review) {
    try { await copying; note.textContent = "Your review is copied. On Google, tap the text box and choose Paste."; }
    catch (_) { note.textContent = "On Google, tap the stars and type your review."; }
    note.hidden = false;
  }
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
  if (e.target.closest(".rate-google-btn")) { openGoogle(); return; }
  if (e.target.closest(".rate-send") && !e.target.closest(".rate-close")) send();
}

// "Rate it" / "★ Rate your food" anywhere on the page (the prompt card or the cart's order tracker)
document.addEventListener("click", e => {
  const b = e.target.closest(".rate-open");
  if (b) { e.preventDefault(); openRating(b.dataset.rate); }
});
