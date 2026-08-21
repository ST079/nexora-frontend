![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?logo=stripe)

## Nexora Frontend

A spec-first electronics storefront for the Kathmandu market, built on the 
[Nexora Express API](https://nexora-express-api.vercel.app).

Every listing is built around the numbers that matter — price, stock, brand — 
no marketing fog. Pay with Khalti, Stripe, or cash on delivery, and track 
your order from checkout to doorstep in real time.

### Features

- **Product catalog** — filter by category, brand, price range with live search
- **Cart** — Redux-persisted drawer with stock validation
- **Checkout** — Khalti digital wallet, Stripe card payments, cash on delivery
- **Order tracking** — real-time status timeline, cancel and pay from order detail
- **Auth** — JWT login/register with Redux Thunk, dark-mode-aware auth pages
- **Dark mode** — full `dark:` Tailwind v4 support with `ThemeToggler` and `localStorage` persistence
- **Admin dashboard** — product, order, and user management with modals, sortable tables, and pagination

### Stack

| Layer       | Tech                                      |
|-------------|-------------------------------------------|
| Framework   | Next.js 16 (App Router)                   |
| State       | Redux Toolkit + Redux Thunk               |
| Styling     | Tailwind CSS v4                           |
| Animation   | Framer Motion                             |
| Payments    | Stripe · Khalti                           |
| Forms       | React Hook Form                           |
| HTTP        | Axios                                     |
| Backend     | [Nexora Express API](https://nexora-express-api.vercel.app) |

isverified