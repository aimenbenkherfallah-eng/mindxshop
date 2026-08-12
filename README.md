# Sidahmed Shop 🛍️

A production-ready MERN e-commerce store built for **Cash-on-Delivery (COD) shopping in Algeria** — dual Arabic/French UI, all 69 wilayas supported at checkout, Meta/TikTok pixel + Conversions API tracking, and a fully separate admin panel.

> ⚠️ **Before you start:** this project was generated in a sandbox with no network access, so dependencies could not be installed or the app run end-to-end. Every file was hand-written and syntax-checked (Node `--check` for the backend, `esbuild` for the JSX frontend, plus an import-resolution pass), but you should still run through **"First run checklist"** below carefully and watch your terminal for errors the first time you boot it.

---

## 1. Tech stack

| Layer      | Choice                                                                 |
|------------|-------------------------------------------------------------------------|
| Frontend   | React 18 + Vite, React Router 6, Tailwind CSS, Context API, Axios, lucide-react, react-hot-toast |
| Backend    | Node.js + Express 4, Mongoose 8                                       |
| Auth       | JWT in httpOnly/Secure/SameSite=Strict cookies, bcryptjs (salt 12)     |
| Security   | helmet, cors, express-rate-limit, express-mongo-sanitize, express-validator, multer |
| Tracking   | Meta Pixel + Conversions API, TikTok Pixel + Events API (SHA-256 hashed phone, shared `eventId` dedup) |

---

## 2. Project structure

```
sidahmed-shop/
├── server/                  # Express API
│   ├── config/db.js
│   ├── data/algeriaProvinces.js   # canonical 69-wilaya list (code, name, nameAr)
│   ├── models/               # User, Product, Order, Settings
│   ├── middleware/           # auth, rate limiters, security, validators, upload
│   ├── controllers/
│   ├── routes/
│   ├── utils/                 # JWT, SHA-256 hashing, Meta/TikTok CAPI, bot verification
│   ├── seeder.js             # creates admin user + settings + sample products
│   └── server.js
└── client/                  # React (Vite) storefront + admin panel
    └── src/
        ├── context/           # Lang (AR/FR + RTL), Settings, Cart, Auth
        ├── components/        # layout, product, cart, admin
        ├── pages/              # storefront pages + pages/admin/*
        ├── data/algeriaProvinces.js
        └── utils/              # pixels.js, botProtection.js, format.js
```

---

## 3. First run checklist

### 3.1 Prerequisites
- Node.js 18+ and npm
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)

### 3.2 Backend setup
```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI and a real JWT_SECRET, e.g.
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

npm install
npm run seed      # creates the admin user (sidahmed / slhgta62004), default
                   # shipping fees for all 69 provinces, and 8 sample products
npm run dev        # starts the API on http://localhost:5000
```

### 3.3 Frontend setup
```bash
cd client
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # starts the storefront on http://localhost:5173
```

Open **http://localhost:5173** for the storefront and **http://localhost:5173/admin/login** for the admin panel.

### 3.4 First things to verify
1. `npm run dev` in `server/` starts without the "Missing required environment variables" error — meaning `.env` is filled in.
2. `npm run seed` printed "Done." — check MongoDB has a `users`, `products`, and `settings` collection.
3. The homepage loads sample products. If images look broken, that's expected — the seeder uses `picsum.photos` placeholder images; replace them with real product photos from Admin → Products.
4. Log in at `/admin/login` with `sidahmed` / `slhgta62004`, **then change this password** by creating a new admin user directly in MongoDB or extending the seeder — there's no self-service "change password" UI in this MVP by design (reduces attack surface on a single-admin store). Simplest path: edit `ADMIN_PASSWORD` in `.env` and re-run `npm run seed:destroy && npm run seed`.
5. Place a test order as a customer, then confirm it appears in Admin → Orders and its status can be changed.

---

## 4. Algeria's 69 provinces

`server/data/algeriaProvinces.js` and `client/src/data/algeriaProvinces.js` hold the canonical list. As of this writing, Algeria has 69 wilayas following an April 2026 decentralization law that split 11 more provinces off the existing 58 (which themselves grew from 48 in December 2019). Codes 1–58 are the well-established list; codes 59–69 are the newest provinces, ordered as most commonly reported at the time this project was built. **If you have the official Journal Officiel numbering for 59–69, update those two files** — every part of the app (checkout dropdown, admin shipping-fee table, order province filter) reads from them, so one edit propagates everywhere.

---

## 5. Security features implemented (per spec)

- **Rate limiting**: 5 failed admin-login attempts / 15 min, 3 order submissions / IP / 10 min, plus a general 300 req/15 min API-wide limiter (`server/middleware/rateLimiters.js`).
- **Duplicate-order throttle**: an additional DB-level check blocks a second order from the same phone number or IP within 5 minutes, even within the rate limiter's allowance (`orderController.js`).
- **Headers**: `helmet` with a CSP scoped to self + Meta/TikTok pixel domains + Google Fonts (`middleware/security.js`).
- **NoSQL injection**: `express-mongo-sanitize` strips `$`/`.` from `req.body/query/params`.
- **CORS**: locked to `CLIENT_URL` from `.env`, credentials enabled for the admin cookie.
- **Payload limits**: `express.json({ limit: '10kb' })`; images go through `multer` (multipart), not JSON.
- **Password hashing**: bcrypt, salt factor 12, `select: false` on the field.
- **JWT**: httpOnly + Secure (prod) + SameSite=Strict cookie — inaccessible to JS, not sent cross-site.
- **Route guards**: `protect` (verifies JWT) + `adminOnly` (checks role) on every `/api/admin/*` route.
- **Validation**: `express-validator` chains on every public/admin write endpoint (`middleware/validators.js`).
- **Bot protection**: reCAPTCHA v3 or Cloudflare Turnstile, toggleable from Admin → Settings → Bot Protection; verified server-side before an order is created (`utils/botProtection.js`).
- **Strict schemas**: Mongoose's default `strict: true` on every model rejects unlisted fields.

**Before going to production**, also do the standard hardening the spec doesn't cover in code: deploy behind HTTPS (Secure cookies require it), rotate `JWT_SECRET`, set `COOKIE_DOMAIN` to your real domain, and move image storage off local disk to S3/Cloudinary if you expect meaningful traffic or run multiple server instances.

---

## 6. Meta Pixel / TikTok Pixel + server-side CAPI

1. In Admin → Settings → Pixels, paste your Meta Pixel ID + Conversions API access token, and/or TikTok Pixel ID + Events API access token, and toggle them **Enabled**.
2. The storefront auto-loads whichever pixels are enabled (`SettingsContext` → `utils/pixels.js`) and fires `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout` client-side, and `Purchase` / `CompletePayment` right after a successful order.
3. The server independently sends a matching `Purchase` event to Meta CAPI and TikTok Events API right after the order is saved (`utils/metaConversionsAPI.js`, `utils/tiktokEventsAPI.js`), using the **same `eventId`** the browser used, with the customer's phone number **SHA-256 hashed** before it's sent — this is what lets Meta/TikTok deduplicate the browser + server events into one.
4. Server-side calls happen *after* the HTTP response is sent to the customer, so pixel/CAPI latency never slows down checkout.

---

## 7. What to double-check yourself

Since this couldn't be run in the sandbox that generated it:
- Run `npm install` in both `server/` and `client/` and watch for any peer-dependency warnings.
- Confirm the Tailwind build actually picks up the custom color tokens (`client/tailwind.config.js`) — run `npm run dev` and check the hero section renders in blue/green, not default Tailwind colors.
- Test the review photo upload end-to-end (`POST /api/uploads/review-photos`) — multer writes to `server/uploads/`, make sure that folder is writable in your deployment environment.
- If you deploy frontend and backend on different subdomains, set `COOKIE_DOMAIN` in `server/.env` accordingly or the admin cookie won't be readable across them.
- **Order number generation** (`orderController.js`) counts existing orders to build `SDS-000123`. Under very high concurrent order volume this has a small race-condition window (two simultaneous orders could compute the same number); the `unique` index on `orderNumber` means the second request would fail loudly rather than silently duplicate, but for a high-traffic store you'd want to swap this for an atomic counter document (`findOneAndUpdate` with `$inc`) or a UUID-based order number instead.

---

## 8. Default admin credentials (change in production!)

```
URL:      /admin/login
Username: sidahmed
Password: slhgta62004
```
