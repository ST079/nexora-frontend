# Nexora audit: findings and fixes

**Date:** 24 Oct 2026
**Scope:** `nexora-backend` (Express 5 + MongoDB) and `nexora-frontend` (Next.js 16, React 19, Tailwind 4)
**State:** the changes are committed in `nexora-frontend` `aa057c7` and `nexora-backend` `df1753f` (24 Oct, 12:51–12:52), under your git identity. The audit itself didn't stage or commit anything. No `.env` file was opened for editing, and no migration was run against your database.
**Redesign:** the frontend redesign in [section 11](#11-frontend-redesign) is **not committed**. It sits in the `nexora-frontend` working tree on top of `8c52465`.
**Algorithms:** the work in [section 12](#12-algorithms-bca-project-ii) is **not committed**, in either repo.

| | Frontend | Backend |
|---|---|---|
| Commit | `aa057c7` | `df1753f` |
| Files changed | 114 | 41 |
| Lines | +6,114 / −4,123 | +1,310 / −507 |
| ESLint | 0 problems in 126 files (was 6 errors, 3 warnings) | n/a |
| Build | `next build` passes, 22 routes | n/a |
| API tests | n/a | 82 of 82 end-to-end checks pass |

File and line counts come from the commits, so they include anything else committed with the audit work, such as the backend `package-lock.json` change that was already in your working tree.

Companion files:
- [`nexora-flow.excalidraw`](../../nexora-flow.excalidraw): full system flow (auth, shopping, payments, order lifecycle, roles, API map). Open it at excalidraw.com, or with the VS Code Excalidraw extension.
- [`audit/api-test/`](../../audit/api-test): the end-to-end API harness used to verify the backend (see [Verification](#9-verification)).
- [Nexora design canvas](https://claude.ai/artifact/D3K7tZpJf8xRnbai54cfcr): seven boards in place of a Figma file: design system, storefront, product, checkout, order, admin dashboard and merchant orders. The order and merchant-orders boards are clickable prototypes. The canvas is private until you share it. It still shows the look from before the redesign (orange accent, square cards).

---

## 1. Do these before you deploy

1. **Rotate the secrets in `nexora-backend/.env.example`.** The file is tracked in git and holds what look like real values for `DBURL`, `JWT_SECRET`, `KHALTI_API_KEY`, `CLOUDINARY_*`, `EMAIL_API_KEY` and `STRIPE_SECRET_KEY`. Deleting them isn't enough, because they stay in git history. Rotate each one with its provider, then replace the values with placeholders. (The frontend `.env-example` only holds a Stripe `pk_test_` publishable key, which is meant to be public.)
2. **Add the new environment variables** (all optional; defaults shown):

   | Where | Variable | Default | Purpose |
   |---|---|---|---|
   | backend | `CORS_ORIGINS` | *(empty: reflects any origin, as before)* | Comma-separated allowlist, e.g. `https://nexora.com.np`. **Set this in production.** |
   | backend | `DELIVERY_CHARGE` | `200` | Rs added to every order on the server. |
   | backend | `KHALTI_LOOKUP_URL` | derived from `KHALTI_API_URL` (`initiate` → `lookup`) | Khalti payment verification endpoint. |
   | backend | `TRUST_PROXY` | off (auto-on when `VERCEL` is set) | Trust one proxy hop so rate limits see the real client IP. |
   | backend | `GEMINI_API_KEY` | *(already read by the code, missing from `.env.example`)* | AI product descriptions. |
   | frontend | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URLs, sitemap, Open Graph. |
   | frontend | `NEXT_PUBLIC_DELIVERY_CHARGE` | `200` | Delivery estimate shown in the cart. **Must match `DELIVERY_CHARGE`.** |

3. **Check two existing variables:**
   - `APP_URL` must be the **storefront** URL. Password-reset emails link to `${APP_URL}/reset-password`, and Khalti returns to `${APP_URL}/${KHALTI_RETURN_URL}`.
   - `KHALTI_RETURN_URL` should be `orders/payment-callback` (no leading slash).
4. **Run the payment-status migration once**, after a backup:
   ```bash
   cd nexora-backend && node scripts/migrate-payment-status.js
   ```
   The old confirm-payment code wrote `status: "SUCCESS"`, which isn't in the Payment enum. The script rewrites those records to `COMPLETED` so they count as paid.
5. **Give products real stock numbers.** Stock is now enforced at checkout. The model's default is `1`, so a legacy product with no stock set will sell exactly once and then show as sold out.
6. **Review the commits.** `aa057c7` and `df1753f` hold this work. The backend commit also includes a 15-line `package-lock.json` removal that was in your working tree before the audit started; the audit didn't touch that file.

---

## 2. Security findings

Severity is rated for a live shop that takes money.

| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | Critical | **Customers could set their own order total.** `createOrder` spread the request body into the order, so `totalPrice`, `status` and `payment` came from the client. | Prices are read from the database. The body is limited to `{orderItems: [{product, quantity}], shippingAddress}`. Each line snapshots `name` and `price`; the server adds `DELIVERY_CHARGE` (`order.service.js`, `orderSchema.js`). |
| S2 | Critical | **Payments could be marked paid without paying.** `confirm-payment` trusted a client-sent `"COMPLETED"`, and it wrote the invalid status `SUCCESS`. | The server now checks with the provider: a Khalti lookup by `pidx` (status `Completed` and an exact paisa amount match), or a Stripe PaymentIntent retrieve (`succeeded` and the amount). Confirmation is idempotent, and failures mark the payment `FAILED`. |
| S3 | Critical | **Anyone could register as an admin.** The register endpoint accepted `roles` from the body. | `register` whitelists name, email, phone, address and password. Roles can only be changed by an admin. |
| S4 | High | **Login could sign you into someone else's account.** `$or: [{email}, {phone}]` with one field undefined can match an arbitrary user. | Lookup is by the one identifier provided. Both "no user" and "wrong password" return the same message. |
| S5 | High | **Password hashes were returned** by the user list and user detail endpoints. | `password` is `select: false` on the schema and is only selected for login and password change. |
| S6 | High | **Any customer could read any order (IDOR)**, and the pay endpoints had no ownership check. | Orders are visible to the owner, admins, and merchants with an item in the order. Paying requires the owner, an unpaid order, and status `PENDING`. |
| S7 | High | **Any merchant could edit or delete any product.** | `assertCanManage`: the product's creator or an admin, otherwise 403. |
| S8 | High | **Cancelling checked the wrong user's roles** (the order owner's, not the caller's), and allowed cancelling shipped or delivered orders. | Owner or admin only. Customers can cancel while `PENDING` or `CONFIRMED`. Delivered and cancelled orders are locked. Stock is returned on cancel. |
| S9 | Medium | **Regex injection / ReDoS.** Search input went straight into `$regex`. | `escapeRegex` on every user-supplied pattern (`utils/query.js`). |
| S10 | Medium | **Forgot-password revealed which emails have accounts**, and the reset link pointed at the API instead of a page. | Same response for every email. The link goes to `${APP_URL}/reset-password?userId…&token…`, and the frontend now has forgot and reset pages. |
| S11 | Medium | **Deactivated or deleted accounts kept working until their JWT expired**, and role changes needed a new sign-in. | `auth` re-reads `roles` and `isActive` on each request and returns 401 for inactive or missing accounts. The frontend signs the user out on 401. |
| S12 | Medium | **Admins could lock themselves out**: deactivate or delete their own account, or remove their own ADMIN role. | Blocked on the server and disabled in the UI (a "You" tag marks the admin's own row). |
| S13 | Medium | **No rate limiting on sign-in or password reset.** | Per-IP fixed windows: login 20 per 15 min, register 10 per hour, forgot-password 5 per 15 min, reset 10 per 15 min. Responses carry `RateLimit` and `Retry-After` headers. See the limitation in [section 10](#10-known-limitations-and-recommendations). |
| S14 | Medium | **Uploads had no size, type or count limit**, and Multer errors surfaced as 500s. | Shared `middlewares/upload.js`: images only, 5 MB each, at most 10 files. Clear 400 messages. |
| S15 | Medium | **Count endpoints were open and unscoped.** `/orders/count` and `/users/count` answered any user, for the whole database. | `/users/count` and `/users/stats` are admin only. Order counts are scoped to the caller's role. |
| S16 | Low | **The cookie token reader broke with more than one cookie** (`split("=")[1]`). | `nexora_token` is parsed by name. |
| S17 | Low | Unsafe `?next=` redirects were possible once login started honouring `next`. | `safeNext` only accepts same-site paths: it rejects `//host` and `/\host` (`utils/navigation.js`). |

Still to decide: the JWT is also kept in `localStorage`, where any XSS can read it. See [section 10](#10-known-limitations-and-recommendations).

---

## 3. Backend bugs fixed

**Data and models**
- `createdAt: { default: Date.now() }` ran once at server start, so every order, payment and user got the same timestamp. Reset tokens expired one hour after **server start**, not after the request. All now use `Date.now` / `() => Date.now() + 1h`.
- Product price `min: [, …]` had no number. Price is now ≥ 1, and stock is an integer ≥ 0.
- User phone validator typo (`messsage`) hid the error message.
- Orders snapshot each item's `name` and `price`, and store `deliveryCharge`, so old orders still add up after a product changes or is deleted. `orderItems[0].product.name` used to crash once a product was deleted.

**Orders and stock**
- Stock was never decremented. It's now reserved atomically (`stock >= qty` conditional update): 409 on a race, 400 on insufficient stock, and returned on cancel, delete, or a failed create.
- `restock` could run with `{_id: undefined}` and update an arbitrary product. Null ids are now skipped.
- Merchant orders used `$unwind`, which duplicated orders and left them unpopulated. Merchants now get each order once, trimmed to their own lines, with `merchantTotal`.
- Stripe amounts weren't converted to paisa (×100).
- Delivered COD orders now mark the payment `COMPLETED`, so revenue counts them.
- Cancel returned `201`; it now returns `200`.
- New `GET /orders/stats` (counts by status plus revenue, role-scoped) replaces the dashboard's unbounded fetches.

**Users and auth**
- `ROLE_ADMIN` wasn't imported in `user.service.js`, so an admin editing another user threw a ReferenceError.
- There was no change-password endpoint (the frontend called a function that didn't exist). Added `PATCH /users/change-password`.
- Register answered with `registeredUser`, but the frontend read `user`, so new customers weren't signed in after registering. Both keys are now sent.
- Profile updates replaced the whole address. Fields now merge (`address.city`, etc.).
- Admin "create user" sent the wrong payload. It now has its own schema (`createUserSchema`).
- `updateRolesSchema` didn't allow `ADMIN`.

**Platform**
- `validate` sent a 400 **and** called `next(error)` ("headers already sent"). It now returns, and assigns the parsed body, which strips unknown keys.
- `utils/token.js` did `throw reject(error)`; it now does `return reject(error)`.
- The payments router was never mounted, so `/payments/:id/status` returned 404. It's mounted behind `auth`, with an ownership check.
- The API crashed on boot if `EMAIL_API_KEY` was missing (Resend client created eagerly). The Resend and Gemini clients are now lazy.
- Cloudinary images saved the `http` URL. They now save `secure_url`.
- Product update had no validation (added `productUpdateSchema`), and "remove every image" was silently ignored (`existingImages=""` now clears them).
- Count endpoints ignored filters; they now use the same filters as their list endpoints.
- `app.js` listens only outside Vercel and always exports `app` (keeps your listen toggle). Duplicate `auth` on order routes and unused imports are removed, and so are `console.log` calls.
- Mongoose's deprecated `new: true` is replaced by `returnDocument: "after"`.

---

## 4. Frontend bugs fixed

### Platform and shared code
| Bug | Effect | Fix |
|---|---|---|
| `next.config.mjs` allowed only `http` Cloudinary images | **Every product photo** (stored as https) threw in `next/image` | Allow `https` (and `http` for old records) |
| Redux persisted `auth.loading`, `auth.error` and `cart.isOpen` | Stuck spinners and stale error banners after a reload | Persist transforms reset them. The persist key is unchanged, so nobody gets logged out. Also fixed the `ignoreActions` → `ignoredActions` typo. |
| `logout` reducer touched `localStorage` | Side effect inside a reducer | Moved to listener middleware |
| `api/index.js` read `localStorage` during SSR | Server render crash risk | Window guard. A 401 now signs the user out everywhere. |
| Dark mode class sat on a wrapper div | Dashboard and auth pages never went dark | Class moves to `<html>`. An inline script prevents a light flash on load. |
| Tokens used in markup but never defined (`blueprint*`, `signal-tint`, `signal-dim`, `panel`, `font-display`); fonts never loaded | Unstyled badges and buttons, fallback fonts | Tokens added to `globals.css`; Space Grotesk, IBM Plex Sans and IBM Plex Mono via `next/font` |
| `AnimatedField`: React Hook Form's `onBlur` overwrote the internal one; label not linked to its input | Focus underline stuck, screen readers can't name fields | `useId` label link, `error`/`hint` with `aria-describedby`, `aria-invalid` |
| Frontend statuses that don't exist on the backend (`SUCCESS`, `PROCESSING`, `RETURNED`, `REFUNDED`) | Revenue always 0, dead filter tabs | Constants match the backend's 5 order statuses and 4 payment statuses |
| `Pagination` only read the URL | "My orders" never changed page | Added a controlled `PaginationControls` |
| No root error boundary; the product error page was 379 lines of inline styles, showed the stack trace, and its button didn't refetch | Raw errors shown to shoppers; "Try again" didn't work | Shared `ErrorView`, new `app/error.js`, retry via `unstable_retry` |
| `fadeUp` imported from page modules; dead `OrderDashboard.js`; stray `console.log` calls and unused imports | Fragile imports, noise in the console | `utils/motion.js`; dead file deleted; cleaned up |

### Sign-in and account
- **Register:** customers weren't signed in after registering (payload key mismatch). The backend requires a province, but the form didn't ask for one. Fields had no validation messages, and an empty `country` string made registration fail.
- **Forgot/reset password:** the login page linked to a 404. Both pages now exist.
- **Redirects:** login always went to `/`. It now honours a safe `?next=` and sends staff to the dashboard.
- **Account page:**
  - Avatar upload never worked (it used `file` before declaring it).
  - The new avatar wasn't saved to the session.
  - Preview URLs leaked.
  - `changePassword` wasn't imported, so the password form always failed.
  - Saving the profile dropped province and country.
  - The password minimum was 8, while the backend and registration use 6.
- **Header:** search crashed (`navigate` undefined). The cart badge counted lines instead of items. The mobile menu always said "Sign in".
- **UserProfile:** crashed when `roles` was missing; merchants had no dashboard link; the Account link was commented out.
- **EmptyCart:** "Continue shopping" crashed (`dispatch` and `closeCart` undefined).
- **Footer:** `/profile` was a 404, and the category links weren't URL-encoded.

### Admin and merchant console
- **No role guards.** Any signed-in customer could open the admin pages (the API refused the data, but the UI loaded), and customers on `/account` got the admin sidebar. There's now one guard in `(client)/layout.js` with role-aware navigation.
- **Sidebar:** merchants saw "NEXORA · Admin" and links to admin-only pages. There was no mobile layout. A link pointed to a non-existent `/admin` route.
- **Dashboard:**
  - Merchants got 403s and a page of zeros, because it called admin-only endpoints.
  - Trend percentages were hard-coded fakes.
  - "Orders" linked to a 404.
  - Revenue was compared against `SUCCESS`.
  - It downloaded every order, user and product.
- **Order management:**
  - Merchants called the admin-only `GET /orders` (403).
  - The page fetched twice.
  - Status updates didn't refresh the row.
  - Client-side filtering ran on top of server pagination.
  - The detail modal showed the current product price instead of the price paid.
- **Product management:**
  - The count was fetched on the server without a token, so merchants saw the whole catalog's count.
  - Search, sort and stats only covered the current page.
  - Saving showed two toasts.
  - Preview URLs were created during render (memory leak).
  - Removing every image was ignored.
  - Delete had a fake delay and no error handling.
  - The stock badge used undefined colours.
- **User management:**
  - Pagination was broken (the page state never changed).
  - Stats only counted the current page.
  - The activate/deactivate button was faked (a 600 ms delay; the API call was commented out).
  - Admins could delete or deactivate themselves.
  - Errors were swallowed with `console.error`.
  - Modals didn't close on Escape.

### Shopping, checkout and payments
- **Checkout:**
  - Crashed for users without a saved address.
  - Didn't guard an empty cart or a signed-out visitor.
  - Used an invalid `autoComplete`.
  - Had no province field.
  - Sent a `totalPrice` the server ignores.
  - Landed on the orders list instead of the new order, where the customer pays.
- **Cart:** said shipping is "calculated at delivery", but Rs 200 is always charged. Signing in from the cart lost the way back. "Clear cart" had no confirmation.
- **Cart state:** `increaseQuantity` read the item before its null check. An undefined `stock` turned quantities into `NaN`. Out-of-stock products could be added with quantity 0.
- **Product card and detail:**
  - `imageUrls[0]` crashed on products without images.
  - No out-of-stock guard.
  - The add-to-cart button was invisible on touch screens (it only appeared on hover).
  - Every image loaded eagerly.
- **Cart drawer:** passed an array as an image `src`. The increase button ignored stock.
- **Filters:** didn't read the URL, so they reset on navigation. Reset didn't navigate. Empty values went into the URL. An empty brand chip showed by default.
- **Products page:**
  - No pagination (the whole catalog in one request).
  - The empty state's "Oops!" button did nothing.
  - The page description was still "Generated by create next app".
  - No `<h1>`.
- **Product detail:** a missing product showed the error page (the not-found branch was dead code). The product was fetched twice.
- **Order detail:**
  - Pay buttons appeared for non-owners and for orders that were no longer pending.
  - "Paid" was inferred from `CONFIRMED`, which is wrong for cash on delivery.
  - Cancel was offered only while `PENDING` (the server allows `CONFIRMED`).
  - One busy flag locked every button.
  - A success message used `toast.error`.
- **Khalti callback:** didn't send `pidx`. Treated "User canceled" as a failure. Had no Suspense boundary (fails the Next 16 build).
- **Stripe:** called `confirmPayment(orderId, "COMPLETED")` with the wrong argument shape and no error handling.
- **My orders:** referenced an undefined `ORDER_STATUS_PROCESSING`. `OrderCard` crashed on orders without a number. The timeline used a dollar icon for "Confirmed", which read as "paid".
- **Contact:**
  - Name and email fields stored the change event, so they showed `[object Object]`.
  - "Send" waited 1.2 s, showed success and **discarded the message**.
  - The FAQ left out card payments.
  - The phone hours contradicted the opening-hours card.

  The form now opens the visitor's mail app with the message filled in (see [section 10](#10-known-limitations-and-recommendations)).
- **404 page:** inline styles, no dark mode, and state set from `window.location` in an effect.

---

## 5. UX and UI improvements by role

**Shoppers (USER)**
- Stock is visible everywhere: "Only N left" and "Sold out" badges, and "Max in stock" hints. Quantities are capped at stock in the card, the detail page, the drawer and the cart.
- Cart and checkout show the delivery charge and the real total before the order is placed. "Place order · Rs X" leads straight to the order page to pay.
- The address form is prefilled from the profile, with a province picker and browser autofill.
- The order page explains the payment state in plain words ("Pay on delivery", "Not charged", "Paid"), shows a cancelled banner, and has a "Check again" option for pending Khalti payments.
- My orders has tabs with counts and an "N orders waiting for payment" banner.
- Shop filters live in the URL, so they're shareable, survive Back, and are paginated (12 per page). They work on mobile with a filter count badge.
- `/account` keeps the storefront header and footer.

**Merchants (MERCHANT)**
- A "Merchant hub" with only the pages a merchant can use.
- The dashboard, products and orders are scoped to the merchant's own catalog. Orders show "Your share" and only the merchant's own lines.
- Order status is read-only, with a note that the Nexora team handles fulfilment, because the API only lets admins change it.
- The product editor validates like the server, previews and removes images, gives clear rejection reasons for oversized or non-image files, and has an AI-description hint.

**Admins (ADMIN)**
- An "Admin console" with stats tiles that double as filters, and deep links from the dashboard ("Needs attention": pending orders, low and out of stock) into pre-filtered tables.
- Server-side search, sort and pagination on products, orders and users, with sortable headers (`aria-sort`).
- Activate/deactivate really works. Role editing locks your own admin role. Each dashboard section fails on its own with its own retry.

**Everyone**
- One design system: ink/paper/signal/blueprint tokens and consistent primary, secondary and ghost buttons with disabled states. The audit commit used Space Grotesk / IBM Plex and square cards; the redesign replaced both (see [section 11](#11-frontend-redesign)).
- Dark mode works on every page.
- A responsive staff sidebar with a mobile drawer and a collapsible desktop rail.
- Accessibility:
  - Dialogs have roles, Escape and focus handling.
  - `aria-current` on navigation; `aria-pressed` on chips and tabs.
  - Labelled form fields with inline errors.
  - Visible focus states.
  - Larger touch targets on mobile.

### Colour contrast (WCAG AA)

These text and background pairs were below the 4.5:1 that WCAG AA requires for normal text. The fixes are in the `globals.css` tokens, so every use picks them up.

This table covers the audit commit. The redesign replaced the orange `signal` with violet, so the current pairs are checked again in [section 11](#contrast-checked-again).

| Where | Before | After |
|---|---|---|
| Primary button hover | White on signal orange, 2.87:1 | Ink on signal, 6.36:1. Secondary and ghost hovers use `signal-tint` with ink text. |
| Helper text (6 places) | `slate-light`, 2.56:1 on white | `slate`, 4.76:1. `slate-light` is now for placeholders and icons only. |
| `ok`: success text, Paid and Delivered badges, solid green buttons | `#1f8a5f`: 3.81:1 on its tint; paper text on it 4.13:1 | `#17734f`: 5.06:1 and 5.58:1 |
| `danger`: errors, Cancelled and Failed badges | `#d8392b`: 4.00:1 on its tint | `#b32e22`: 5.37:1 on its tint, 6.31:1 on white |
| `signal-dim`: orange text, Pending badges | `#e2570f`: 3.20:1 on `signal-tint` | `#8a3a0a`: 6.66:1 |
| Grey badges on `hairline`: USER role, Refunded, Not charged, unknown statuses | `slate`, 3.84:1 | New `slate-dim` token `#475569`, 6.12:1 (7 places) |

The darker light-mode colours are too dark on the `#0e0f12` dark background, so `html.dark` lifts them: `ok` becomes `#3fbf87` (8.23:1), `danger` becomes `#f0675a` (6.20:1), and `signal-dim` becomes `signal` (6.69:1). Solid green and red buttons use ink text in dark mode, and the Stripe card form's error colour follows the theme.

---

## 6. SEO

- **Titles and metadata:** a title template (`%s · Nexora`) and real descriptions. `metadataBase` comes from `NEXT_PUBLIC_SITE_URL`.
- **Indexing:** private routes (account, cart, checkout, orders, admin, reset) are `noindex`. `robots.txt` disallows them.
- **Sitemap:** `sitemap.xml` covers the static pages and up to 1,000 products, refreshed hourly.
- **Product pages:** a server-rendered title and description, canonical URL, Open Graph and Twitter images, and `Product` JSON-LD with an NPR `Offer` and availability. A real 404 for missing products.
- **Listings:** the listing title follows the search or category. Filtered, sorted and paged variants are `noindex, follow`, with a canonical to the main listing.

---

## 7. Behaviour changes to know about

- **Stock is enforced.** See [step 5 above](#1-do-these-before-you-deploy).
- **Unpaid orders hold stock.** Stock is reserved when the order is created, not when it's paid. See [section 10](#10-known-limitations-and-recommendations).
- **Registration requires a province and city.** The model already required them; the form now asks for them.
- **Order rules:**
  - Customers cancel while `PENDING`/`CONFIRMED`.
  - Admins can't change `DELIVERED` or `CANCELLED` orders.
  - Choosing cash on delivery confirms the order; the payment stays pending until delivery.
- **Merchants can't change order status.** That was already true in the API; the UI now shows it.
- **Request bodies are stripped to their schema.** Unknown fields are dropped silently instead of being saved.
- **Response contracts kept:**
  - Lists are plain arrays and counts are `{totalCount}`.
  - `getProductById` returns `{message, productDetails}`.
  - `getMe` returns `{data, status, message}`.
- **New endpoints:**
  - `GET /orders/stats`
  - `GET /users/stats`
  - `PATCH /users/change-password`
  - `PUT /orders/:id/confirm-payment` (now takes `{pidx}`)
  - `/payments/*` (now mounted)

---

## 8. New files

**Backend**
- `src/middlewares/rateLimit.js`
- `src/middlewares/upload.js`
- `src/utils/query.js` (`escapeRegex`, `toInt`, `parseSort`, `isSameId`)
- `scripts/migrate-payment-status.js`

**Frontend**
- **Hooks:** `hooks/useResource.js`, `useQueryParams.js`, `useEscape.js`
- **Utils:** `utils/motion.js`, `navigation.js`, `sort.js`
- **Components:** `ErrorView`, `PaymentBadge`, `SearchField`, `SortableHeader`
- **Pages:** `(auth)/forgot-password`, `(auth)/reset-password`, `app/error.js`, `products/[id]/not-found.js`, `robots.js`, `sitemap.js`
- **Metadata:** 15 metadata-only `layout.js` files

---

## 9. Verification

| Check | Command | Result |
|---|---|---|
| Lint | `cd nexora-frontend && npx eslint src` | 0 errors, 0 warnings in 126 files |
| Production build | `cd nexora-frontend && npx next build` | Passes, 22 routes |
| API end-to-end | `cd audit/api-test && npm install && npm test` | 82 of 82 checks pass |
| Lint, after the redesign | `cd nexora-frontend && npx eslint src` | 0 errors, 0 warnings in 136 files |
| Build, after the redesign | `npx next build --webpack`, in a scratch copy of `nexora-frontend` | Passes, 22 routes |
| Screens, after the redesign | Headless Chrome against a seeded test API (see [section 11](#visual-qa)) | 37 screenshots; no console errors or sideways scrolling |

The redesign build ran in a copy so it couldn't overwrite the `.next` folder your dev server on :3000 uses. The copy links to the real `node_modules`, and Turbopack refuses links that point outside the project, so that build used `--webpack`. In the real folder, plain `npx next build` should work as before.

The API harness boots the real `nexora-backend/src/app.js` against an in-memory MongoDB, so it never touches your database. It covers:
- registration and role injection
- login
- password privacy
- product ownership and regex escaping
- order pricing, stock, races and cancellation
- payment ownership and verification
- merchant scoping
- counts and stats
- account deactivation
- upload limits
- rate limits

Khalti and Stripe calls are checked up to the provider boundary. Real sandbox payments still need a manual run with your test keys.

---

## 10. Known limitations and recommendations

| Priority | Item | Recommendation |
|---|---|---|
| High | Rate limits are in memory, per serverless instance | Fine as a speed bump. For a hard cap, back it with Upstash Redis (`@upstash/ratelimit`). |
| High | The JWT is also stored in `localStorage` (readable by any XSS) | The API already sets an `httpOnly` `nexora_token` cookie. Switch the frontend to `withCredentials` and drop the `localStorage` copy. |
| High | Abandoned unpaid Khalti/Stripe orders keep stock reserved | Add a scheduled job that cancels online-payment orders still `PENDING` after ~30 min (cancelling restocks automatically). |
| Medium | Payment confirmation depends on the customer reaching the callback page | Add the Khalti callback or webhook and Stripe `payment_intent.succeeded` webhook handling, so payments confirm even if the tab closes. |
| Medium | Minimum password length is 6 | Raise it to 8+ on both sides (`USER_RULES.password` and the backend schemas). |
| Medium | Resend sends from `onboarding@resend.dev` | In Resend's test mode that only delivers to your own address. Verify a domain before launch, or reset emails won't arrive. |
| Medium | Newsletter sign-up is cosmetic (toast only) | Connect a provider (Resend Audiences, Mailchimp) or hide the form. |
| Medium | Contact form opens the visitor's mail app | Add `POST /contact` (Resend plus a rate limit) when you want messages to arrive without a mail app. |
| Medium | The About page states facts nobody has checked: founded 2023, 500+ SKUs, 12k+ orders shipped, 8 categories, and a timeline that says third-party sellers can list through a public REST API (2025). These come from the original page. | Replace them with real figures, or remove them. The redesign removed one claim already: "orders placed before 12:00 PM leave the same day". |
| Low | Placeholder phone `+977 98-NEXORA-01` on the contact page | Replace it with a real number. |
| Low | The API harness lives outside the repo | Move it into `nexora-backend` as a dev test (vitest + supertest + mongodb-memory-server) and run it in CI. |
| Low | Existing `SUCCESS` payments | Run the migration in [step 4 above](#1-do-these-before-you-deploy). |
| Low | The brand filter in `constants/brands.js` is a fixed list that doesn't match the catalogue. The shop also shows brands found in the URL, but brands that only exist on products never show up. | Build the list from the products (a `distinct` on `brand`), or add a `GET /products/brands` endpoint. |
| Low | The courier copy at checkout ("the courier calls the number on your account") comes from the original page | Keep it only if that's how your courier works. |


---

## 11. Frontend redesign

**State:** not committed. 80 files changed (+6,912 / −5,436), 11 new files, and `components/HeroBackground.js` removed. No API module, Redux slice or route changed, and every fix in sections 3 and 4 is kept. The aim: fewer steps for each task, clear feedback after every action, and motion that explains what just happened.

### Design system

- **Colour.** The action colour is violet `signal` (`#5b3ff8`). Marigold is the accent for highlights and stickers, on warm paper and ink neutrals. Teal `blueprint` is the info colour, and `night` is a surface for the footer and feature panels that stays dark in both themes. Dark mode has its own lifted values rather than an automatic inversion.
- **Type.** Bricolage Grotesque for headlines (variable, with optical sizing), Figtree for body text and Geist Mono for prices, IDs and small labels. These replace Space Grotesk and IBM Plex.
- **Shape.** Pill buttons with a springy press, 1.5rem cards, soft and lifted shadows. `.glass` is for floating bars, `.sticker` is the tilted marigold label, and `.marker` draws a highlighter stroke behind a headline word.
- **Motion.** `utils/motion.js` holds the shared vocabulary: `spring`, `bouncy`, `fadeUp`, `revealUp`, `stagger`, `popIn`, `modalPanel` and `backdrop`. `<MotionConfig reducedMotion="user">` in `redux/provider.js` and a `prefers-reduced-motion` block in `globals.css` switch movement off for visitors who ask for that.
- **Page transitions.** `experimental.viewTransition` is on in `next.config.mjs`. A product photo morphs from its card into the detail page.

### Contrast, checked again

The palette is new, so every text pair was recomputed from the tokens in `globals.css`. All pass the 4.5:1 that WCAG AA requires, in both themes.

| Pair | Light | Dark |
|---|---|---|
| Body text: `ink` on `paper` | 16.48 | 17.27 |
| Helper text: `slate` on `panel` | 6.34 | 7.39 |
| Helper text: `slate` on `mist` | 5.38 | 6.76 |
| Primary button: `on-signal` on `signal` | 5.98 | 6.02 |
| Primary button, hover: `on-signal` on `signal-dim` | 7.61 | 7.79 |
| Violet pill: `signal-dim` on `signal-tint` | 6.36 | 6.44 |
| Sticker: `on-marigold` on `marigold` | 10.98 | 10.98 |
| Grey badge: `slate-dim` on `hairline` | 7.09 | 8.11 |
| Success badge: `ok` on its 12% tint | 4.91 | 6.34 |
| Error badge: `danger` on its 10% tint | 5.37 | 5.09 |
| Info badge: `blueprint-dim` on `blueprint-tint` | 7.26 | 8.28 |
| "Added" button: `paper` on `ok` | 5.31 | 8.28 |

Tints were computed as a plain blend over `panel`, which is close to the `color-mix` that Tailwind generates. The light success badge, at 4.91:1, has the least margin, so don't lighten `ok`.

### Shoppers

- **Getting around.**
  - On phones and tablets, a floating tab bar replaces the hamburger menu: Home, Shop, Search, Cart and Account sit within thumb reach.
  - On desktop, the active page sits on a sliding pill in the header.
  - ⌘K, Ctrl+K or `/` opens a search palette from anywhere. It shows matches as you type and remembers recent searches, and Enter opens the highlighted product.
- **Home page.**
  - A hero with a rotating headline word, and a fan of three product cards that leans toward the pointer.
  - A two-band marquee of what the store does, a bento category grid, "How it works" and a featured row.
  - The page now refreshes its products every five minutes (`revalidate = 300`). Before, it kept the products from build time forever.
  - If the API is down, the hero and categories still render and only the product row hides.
- **Product cards.**
  - The whole card is one tap target.
  - The add button flies a copy of the photo into whichever cart button is on screen. The cart count rolls up, and the card shows how many are in the bag.
  - "Only N left" and "Sold out" appear as stickers.
- **Shop page.**
  - Category chips switch category in one tap.
  - Each active filter is a removable pill.
  - Price bands are one tap each.
  - On phones, filters and sort open in a bottom sheet.
  - Skeleton cards are shaped like the real ones.
- **Product page.**
  - The photo zooms under the pointer (mouse only).
  - Long descriptions collapse behind "Read more".
  - On phones, an add-to-cart bar appears above the tab bar once the main buttons scroll away.
- **Cart, checkout and orders.**
  - A step indicator runs through cart, checkout and order.
  - Payment methods are large tappable rows.
  - On phones, the payment card comes first while payment is due.
  - The order timeline draws itself in, and the current step pulses until the order is delivered.
  - Order cards fan up to three thumbnails.
- **Sign-in pages.**
  - The auth pages share one frame (`AuthShell`) with an illustrated scene.
  - One submit button goes from idle to loading to done.
  - The error box shakes briefly when it appears.
  - New passwords show a strength guide.
  - Registration is two short steps, and step one never calls the API.
- **404 and About.**
  - The 404 page has an animated "4 (bag) 4", a search box, and Home and Back buttons.
  - The About page has a ticker, values, a timeline that draws itself in, and a call to action.

### Merchants and admins

- **Console building blocks** in `(admin)/_components/Console.js`:
  - `ConsoleHeader`.
  - `StatStrip` and `StatTile`. Tiles can double as filters, with `aria-pressed`.
  - `FilterChips` with a sliding highlight.
  - `TableCard`, which dims the rows on screen while the next page loads.
  - Table skeleton, error and empty states.
  - `RowAction` buttons.
- **One dialog.** Every modal now uses `components/Modal.js` (`Modal` and `ConfirmDialog`). It is a bottom sheet on phones, and Cancel takes focus, so Enter never confirms by accident.
- **Sidebar.** A floating night-coloured rail on desktop and a drawer on mobile.
- **Dashboard.**
  - Revenue leads on a night card, followed by KPI tiles, status bars and "Needs attention".
  - While a refresh is in flight, the previous numbers stay on screen, dimmed, instead of flashing back to skeletons.
- **Products.** The editor shows a live preview of the listing, and the photo gallery marks the cover.
- **Orders and users.**
  - Order and user views have copy buttons for IDs.
  - The user view's header is tinted by the user's highest role.
  - The user table shows each email under the name, so the separate Email column is gone.
- **Account page.**
  - A profile card and a checklist of what a courier needs to find you.
  - A password strength guide.
  - A bar that appears when there are unsaved changes.

### Fixes from visual QA

| Where | Problem | Fix |
|---|---|---|
| Dashboard status bars | Each bar was scaled to the largest status, so the biggest one always looked full while its label said, for example, 40% | Each bar is now its share of all orders, the same number printed beside it |
| Order view, cash orders | "Cash on delivery" appeared twice: as the method and again as the badge | Next to the method, the badge now reads "Due on delivery" (`PaymentBadge methodShown`) |
| Product cards, two per row on phones | The brand and stock pills overlapped | Both sit in one wrapping row, and the stock pill drops below the brand when space runs out |
| User stats, five tiles | One tile sat alone on the last row on phones and tablets | Rows run 1·2·2 on phones and 2·3 on tablets |
| Order stats | The four tiles didn't fill their rows evenly | Two per row on phones, four from tablet width up |
| Mobile tab bar | 10px labels were hard to read over busy pages | A denser background (`bg-paper/92`) |
| Headlines with a highlighted word | The comma after the word could wrap onto a line of its own | The word and its punctuation stay together |
| Confirm dialogs | Long button labels wrapped | Button labels stay on one line |
| Home hero fan | The front card covered the caption of the card behind it | That caption moves to the uncovered side |
| Shop filters, desktop | The footer's background showed past the card's rounded corners | Transparent on desktop |
| Copy | Delivery and returns claims the store hasn't committed to, including "We deliver anywhere in Nepal" at checkout and registration and "a return" on the contact page | Rewritten to describe only what the app does |
| Dashboard, 1024–1150px with the staff sidebar | Recent orders, Pipeline and Stock health ran past the right edge. The grids used `auto` columns, which grow to fit an order line's full unwrapped text. The page scrolled sideways inside `main`, so a check on the whole document missed it. The three stat tiles also left about 80px for text, which cut "confirmation" off mid-word | Every dashboard grid uses `minmax(0, …)` columns, and cards get `min-w-0`. Recent orders sits beside the side column only from `xl`. Below that it takes the full width, and Pipeline and Stock health share a row from `md`. From `sm` to `xl`, stat tiles stack the icon above the text and pin the arrow to the corner |

### Visual QA

- A seeded in-memory test API ran on :5055, with a scratch copy of the frontend on :3100 pointed at it, so your database was never used. Your dev servers on :3000 and :5000 were left alone.
- Headless Chrome captured 37 screenshots across desktop, dark mode and phone width. Each page was checked for console errors and sideways scrolling, and none remain.
- Staff pages scroll inside `main` from `lg` up, so they're checked by comparing `main`'s `scrollWidth` with its `clientWidth`, not the document's width. The dashboard was re-measured this way for admin and merchant at 360, 390, 768, 1024, 1180 and 1280px. None of them scroll sideways.
- Headless capture doesn't draw `backdrop-filter`, so the glass bars look more see-through in the screenshots than in a browser. Their computed styles were checked instead.
- The screenshots used test data. One more pass on your real catalogue, with real photos and long names, is still worth doing.

### Behaviour changes

- **Admin user table.** It no longer has an Email column or email sort. Sorting by name and join date remains.
- **Registration.** It takes two steps.
- **Home page.** It refreshes every five minutes instead of keeping the products from build time.
- **Search shortcut.** `/` opens search unless the visitor is typing in a field.
- **Fonts.** The new fonts are fetched through `next/font` at build time, like the old ones.

### New files

- **Components:** `AuthShell`, `CartCount`, `CheckoutSteps`, `CountUp`, `HowItWorks`, `MobileTabBar`, `Modal`, `ProductGridSkeleton`, `SearchPalette`
- **Admin:** `(admin)/_components/Console.js`
- **Utils:** `utils/flyToCart.js`
- **App icons:**
  - `app/icon.svg`: the Nexora mark, a violet tile with an "n" and a marigold dot.
  - `app/apple-icon.png`: 180×180, full-bleed, for iOS home screens.
  - `app/favicon.ico`: 16, 32 and 48 px. It replaces the default Next.js icon.
- **Removed:** `components/HeroBackground.js`, replaced by the new home hero

## 12. Algorithms (BCA Project II)

Four algorithms, written by hand with no ML library. Formulas, worked examples and all 56 unit test cases are in `nexora-backend/docs/ALGORITHMS.md`.

| Algorithm | Where it shows | Backend |
|---|---|---|
| TF-IDF + cosine similarity | Product page, "Similar products" | `GET /api/v1/products/:id/similar` |
| Apriori association rules | Product page, "Often bought with this" | `GET /api/v1/products/:id/bought-together` |
| Exponential smoothing + reorder point | Dashboard, "Restock planner" (merchant: own products, admin: all) | `GET /api/v1/products/restock-forecast` |
| Levenshtein distance | Shop search: close spellings and "Did you mean …?" when nothing matches exactly | `GET /api/v1/products` and `/count` |

- **Algorithm code.** `nexora-backend/src/algorithms/` holds `tfidf.js`, `apriori.js`, `forecast.js` and `levenshtein.js`. They take plain arrays and never touch the database.
- **Tests.** `nexora-backend/tests/` holds the unit tests. Run `npm test` in `nexora-backend`; all 56 pass.
- **Demo data.**
  - `node scripts/seed-demo-orders.js --yes` adds about 150 demo orders (`DEMO-` order numbers), and `--clean --yes` removes them.
  - Use it on a demo or local database only.
  - Without orders, "Often bought with this" stays hidden, and the planner shows every product as "No recent sales".
- **New frontend files.**
  - `components/BoughtTogether.js` is new.
  - `components/SimilarProducts.js` now asks for TF-IDF matches first and falls back to the newest products in the category.
  - The restock planner lives in `app/(client)/dashboard/page.js`.
- **Similar products: same category first.** For "Samsung Galaxy S25", text similarity alone ranked the Samsung Galaxy Book laptop above every phone. Category names are on many products, so they carry little weight. Products in the viewed product's category now come first.
- **Forecast copy.** The planner calls its figures estimates. It explains where demand comes from (the last 30 days of orders, cancelled ones excluded) and what the reorder quantity covers.
- **Checks.**
  - All checks ran against a scratch MongoDB and a scratch backend on :5155, with a frontend copy on :3100. Your dev servers on :3000 and :5000 and your database were not touched.
  - Screenshots were taken of the product page, the shop's fuzzy notice on a phone, and the planner on desktop, phone and dark mode, for both admin and merchant.
  - No page scrolls sideways.
  - ESLint is clean on the changed files.
