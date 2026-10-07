// "Review us on Google" on the menu (index.html). Café 52 collects reviews on Google only, not on the menu.
//  • Under an order in the cart's tracker once staff mark it served.
//  • A card at the top of the menu for a few hours after this phone's order was served, until the guest taps it or closes it.
//  • A link in the menu's footer, any time.
// Google review page: MENU_CONFIG.googleReviewUrl (the "Ask for reviews" link from Google Business Profile, like
// https://g.page/r/XXXX/review) opens the review box directly; without it, Google Maps opens on Café 52, where guests
// tap "Write a review". Every guest is asked the same way (Google doesn't allow asking only happy guests).
// Needs window.MENU_CONFIG (config.js); load after cart/cart.js.
(() => {
  "use strict";
  const C = window.MENU_CONFIG;
  if (!C) return;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = C.googleReviewUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.googlePlaceQuery || C.restaurantName);
  const DONE_KEY = "greview:" + C.restaurantId;   // orders whose card was tapped or closed
  const ASK_FOR_MS = 8 * 3600e3;                   // show the card for 8 hours after the order was placed
  let done = [];
  try { done = JSON.parse(localStorage.getItem(DONE_KEY) || "[]"); } catch (_) {}
  const markDone = id => { if (!id || done.includes(id)) return; done.push(id); try { localStorage.setItem(DONE_KEY, JSON.stringify(done.slice(-50))); } catch (_) {} };
  const link = (label, id, cls) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener" data-greview="${esc(id || "")}">${label}</a>`;

  // In the order tracker, under a served order
  C.trackerExtra = o => o.status === "served" ? link("★ Review us on Google", o.id, "rate-open") : "";

  // The card at the top of the menu
  function paintPrompt() {
    const box = document.getElementById("rate-prompt");
    if (!box) return;
    const o = (window.MenuCart?.trackedOrders?.() || []).find(o => o.status === "served" && !done.includes(o.id) && Date.now() - o.at < ASK_FOR_MS);
    box.hidden = !o;
    if (o) box.innerHTML = `<div><b>Enjoyed your food?</b><span>Tell others about Café 52 on Google. It takes a few seconds.</span></div>`
      + link("Review", o.id, "rate-open")
      + `<button type="button" class="rate-x" data-greview-close="${esc(o.id)}" aria-label="Not now">×</button>`;
  }

  // The footer link
  function addFooterLink() {
    const f = document.querySelector("footer");
    if (f && !f.querySelector(".greview-foot")) f.insertAdjacentHTML("beforeend", link("★ Review Café 52 on Google", "", "greview-foot"));
  }

  document.addEventListener("click", e => {
    const a = e.target.closest("[data-greview]");
    if (a) { markDone(a.dataset.greview); setTimeout(paintPrompt); return; }
    const x = e.target.closest("[data-greview-close]");
    if (x) { markDone(x.dataset.greviewClose); paintPrompt(); }
  });
  document.addEventListener("cart:orders", paintPrompt);
  const start = () => { addFooterLink(); setTimeout(paintPrompt); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  setInterval(paintPrompt, 60e3);
})();
