// Staff screen: keeps the dish averages that guests see on the menu up to date.
// Guests save ratings to restaurants/{id}/ratings/{orderId} with counted: false. While the staff screen is open, each
// new rating is added to restaurants/{id}/public/ratings ({ items: { "item-1": { s: sum, n: count } } }) and marked
// counted, in one transaction, so two tablets never count the same rating twice.
const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
const { initializeApp, getApps } = await import(SDK + "firebase-app.js");
const { getAuth, onAuthStateChanged } = await import(SDK + "firebase-auth.js");
const { getFirestore, doc, collection, query, where, limit, onSnapshot, runTransaction, increment, serverTimestamp } = await import(SDK + "firebase-firestore.js");

const C = window.MENU_CONFIG;
const app = getApps()[0] || initializeApp(C.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const aggRef = doc(db, "restaurants", C.restaurantId, "public", "ratings");
const busy = new Set();
let stop = null;

async function count(ratingRef) {
  if (busy.has(ratingRef.id)) return;
  busy.add(ratingRef.id);
  try {
    await runTransaction(db, async tx => {
      const snap = await tx.get(ratingRef);
      if (!snap.exists() || snap.get("counted") === true) return;
      const items = {};
      for (const [id, stars] of Object.entries(snap.get("items") || {}))
        if (/^item-\d+$/.test(id) && Number.isInteger(stars) && stars >= 1 && stars <= 5) items[id] = { s: increment(stars), n: increment(1) };
      if (Object.keys(items).length) tx.set(aggRef, { items, updatedAt: serverTimestamp() }, { merge: true });
      tx.update(ratingRef, { counted: true });
    });
  } catch (err) {
    console.error("[staff] Couldn't count a rating:", err);
  }
  busy.delete(ratingRef.id);
}

onAuthStateChanged(auth, user => {
  if (stop) { stop(); stop = null; }
  if (!user) return;
  stop = onSnapshot(query(collection(db, "restaurants", C.restaurantId, "ratings"), where("counted", "==", false), limit(50)),
    snap => snap.docs.forEach(d => count(d.ref)),
    err => console.error("[staff] Ratings:", err));
});
