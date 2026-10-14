// Café 52 settings, shared by the menu (index.html) and the staff order screen (staff.html).
// Everything restaurant-specific for the cart lives here.
window.MENU_CONFIG = {
  restaurantId: "cafe52",
  restaurantName: "Café 52",
  address: "Convent St, Sadar Bazaar, Pune, Maharashtra 411001",   // printed on the bill
  currency: "₹",
  locale: "en-IN",
  serviceChargePercent: 0,
  orderingEnabled: true,        // false = view-only menu
  orderWebhookUrl: "",          // only used when firebase (below) isn't set
  soldOut: [],                  // dish names that can't be ordered today, e.g. ["Chicken 65"]
  menuSelector: "#pages",       // where the menu items are rendered
  dailyCode: false,             // no daily code (removed 2026-10-14): table QR guests order straight away
  dailyCodeResetHour: 5,        // a new code is made automatically at 5 am each day
  getItem: id => cartItem(id),  // lets the cart re-check a saved order against today's menu
  getExtras: id => addonsFor(id),  // add-ons for a dish ("Customise"); index.html reads them from menu-data.js ADDONS
  extrasLabel: "add-ons",

  // Pay by UPI after ordering: the guest's order screen shows "Pay ₹X with UPI", which opens GPay / PhonePe / Paytm
  // with this UPI ID and the order total filled in. Staff check the payment arrived and tap "Paid" on the staff screen.
  // Leave id empty to hide the Pay button. A business/merchant UPI ID works most reliably.
  // Bills: guests can open "View bill" under their order. With billPhone true the order screen also asks for an
  // optional mobile number, which the staff screen uses for "SMS bill". Needs the "phone" rule in firestore.rules
  // to be published first, or orders with a number are refused.
  billPhone: true,

  // Dine in / Takeaway / Delivery. Dine-in needs the table and today's code as before. Takeaway and delivery can be
  // ordered from anywhere with the menu link (no code), need a name and mobile number (delivery also an address),
  // and are paid first by UPI: the staff screen won't accept them until they're marked Paid.
  // Needs the takeaway/delivery rule in firestore.rules published first.
  orderTypes: true,
  deliveryCharge: 50,            // added to delivery orders

  upi: { id: "paytmqr61mzr3@ptys", name: "Café 52" },

  // "Post on Google" after a guest rates their food. Best: the "Ask for reviews" link from Google Business Profile
  // (looks like https://g.page/r/XXXX/review), which opens the review box directly. Until it's set, Google Maps opens
  // on the search below and guests tap "Write a review".
  googleReviewUrl: "https://g.page/r/Cb1JARiFiwFTEAE/review",
  googlePlaceQuery: "Café 52, Convent St, Sadar Bazaar, Pune, Maharashtra 411001",

  // Orders are saved to Café 52's own Firebase project, and the staff screen reads them.
  // These values are meant to be public; the Firestore security rules decide who can read and change orders.
  firebase: {
    apiKey: "AIzaSyC6U-TvcFU0uDVtpflIZ9Ndq6IpvM7rUFA",
    authDomain: "cafe52-orders.firebaseapp.com",
    projectId: "cafe52-orders",
    storageBucket: "cafe52-orders.firebasestorage.app",
    messagingSenderId: "431070590385",
    appId: "1:431070590385:web:3f1d03d5ab07b4efa07990"
  }
};
