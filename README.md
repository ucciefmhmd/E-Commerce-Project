# E-Commerce Store + Admin Panel (JavaScript, Firebase)

A training project, built as a team at ITI. It's a storefront and an admin panel written in **vanilla JavaScript**, bundled with **Vite** as a multi-page app, with **Firebase** (Authentication, Firestore, Storage) as the backend. There is no server of its own: every page talks to Firebase directly from the browser.

<!-- TODO(Youssef): confirm which parts you built yourself (e.g. "I built the admin panel's products and orders pages") before adding a "My role" section. -->

## Features

**Storefront** (`index.html`, `ecommerce/`)
- Home page: category carousel, all products, best sellers (50+ purchases), products on sale and a "special offer" (a product with 50%+ discount)
- Products of a category, with search by name and a brand filter
- Product details: image gallery, description, star rating, related products and a review form (reviews are saved to Firestore and added to the product's rating)
- Wishlist and shopping cart, kept in `localStorage`
- Checkout (requires a customer login) saves the cart as an order in Firestore
- Customer registration and login (a custom implementation on the `Customers` collection, not Firebase Authentication; see [Security limitations](#security-limitations))

**Admin panel** (`adminPanel/`)
- Login with Firebase Authentication (email/password). The login page creates the admin account from `VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` if it doesn't exist yet
- Dashboard (`adminPanel/dashboard/home.html`) with tables for:
  - categories: create, edit (name and cover image), enable/disable
  - products: enable/disable, delete, set a discount percentage
  - admin users: create a user with a role
  - customers, with a details page showing each customer's purchase history
  - orders: confirming an order decreases stock, increases the product's purchase count, adds the items to the customer's history and deletes the order
- Product create / edit / details pages with a TinyMCE rich-text description and 5 product images uploaded to Firebase Storage
- Profile (username, phone, picture), change email (with email verification) and change password
- Light/dark mode

**Data** lives in Firestore collections `Products`, `Categories`, `Orders`, `Customers`, `Users` and `Reviews`, and images in the Storage folders `Products/`, `Categories/` and `Users/`.

## Running it

You need Node.js 18+ and your own Firebase project with Authentication (email/password provider), Firestore and Storage enabled.

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web config and an admin account
npm run dev                  # http://localhost:5173
```

Environment variables (read at build time by Vite, see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Firebase web app config |
| `VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD` | Admin account seeded by the admin login page (demo only, see below) |

Other scripts:

```bash
npm test             # unit tests (Vitest) for the pure helpers and form validation
npm run build        # production build of all 17 pages into dist/
npm run check:dist   # fails if a page listed in vite.config.js is missing from dist/
npm run preview      # serve dist/ locally
```

The admin panel is at `/adminPanel/authentication/login`.

Pages link to each other without the `.html` extension (for example `/adminPanel/dashboard/home`). `vite dev` and `vite preview` resolve these; when deploying `dist/` elsewhere, use a host that serves `page.html` for `/page` ("clean URLs").

CI (`.github/workflows/build.yml`) runs `npm ci`, `npm test`, `npm run build` and `npm run check:dist` on every push to `main` and on pull requests.

## Project structure

```
index.html                    storefront home page
main.js                       Firebase initialisation (exports app and firestore)
vite.config.js                multi-page build: lists every HTML page
ecommerce/
  home/                       home page scripts (data + sliders)
  products/                   products of a category
  productDetails/             product page, reviews, related products
  shopping/                   cart, wishlist, order confirmation page
  login/, register/           customer login and registration
  shared/ecommerceLayout.js   storefront header (customer menu, cart/wishlist badges)
adminPanel/
  authentication/             admin login
  dashboard/                  dashboard page and DataTables setup (vendored jQuery/DataTables)
  products/, categories/,     feature modules used by the dashboard and the product pages
  customers/, orders/, users/
  shared/
    helpers.js                escapeHtml, safeUrl, prices, cart total, rating stars (pure, tested)
    validation.js             admin and review form validation (pure, tested)
    sanitize.js               DOMPurify wrapper for product descriptions
    storage.js                Firebase Storage upload/delete
    adminNavbar.js            admin profile dropdown and logout
    layout.js                 auth guard and header for admin pages other than the dashboard
    extensions.js             form-data and confirmation-dialog helpers
public/                       static files served as-is (css, images, a small file-input script)
imgs/                         storefront images bundled by Vite
scripts/check-dist.mjs        CI check that every page was built
tests/                        Vitest unit tests
```

## Security limitations

This is a classroom project and is **not safe to run as a real shop**. Everything happens in the browser, so anyone can open the developer tools and talk to Firestore directly with the same permissions the pages have. Specifically:

- **Admin authorization is client-side only.** The admin pages only check that *someone* is signed in with Firebase Authentication. The `Role` stored on a `Users` document is displayed but not checked anywhere, and nothing is enforced server-side.
- **Customer passwords are stored in plaintext in Firestore** (`Customers.Password`), and login is checked in the browser by reading the whole `Customers` collection and comparing values. The "token" saved in `localStorage` is a fixed string, not a credential; setting `customerId` in `localStorage` is enough to act as that customer.
- **Order totals and stock are computed in the browser.** The cart total, the order document and the stock/purchase-count updates on confirmation are all written by client code and can be changed by the user.
- **The admin password is bundled into the client JavaScript.** `VITE_ADMIN_PASSWORD` ends up in the build output. The admin panel uses it to seed the admin account and to sign the admin back in after creating another user.
- **Firestore and Storage security rules are not in this repository.** Whatever rules the Firebase project has decide what is actually protected; the code assumes broad read/write access.
- Values from the database are escaped (and product descriptions sanitized with DOMPurify) before they are inserted into the page. That stops stored markup from running as script in other users' browsers, but it is output encoding only: it does not restrict what can be written to the database.
- Earlier commits contained hard-coded configuration values. They were moved to environment variables, and the credentials they contained should be considered compromised.
- The TinyMCE editor is loaded from Tiny Cloud with the project's API key in `adminPanel/products/create.html` and `update.html`. That key is meant to be public, but it should be restricted to your domains in the Tiny Cloud dashboard.

What a proper fix needs:

1. **Firebase Authentication for customers** instead of the `Customers.Password` field (and deleting the stored passwords).
2. **Firestore and Storage security rules**, checked into the repo, that restrict each collection by `request.auth`, with admin access based on **custom claims** (set with the Firebase Admin SDK) rather than a `Role` field.
3. **Cloud Functions or a backend API** for anything that must be trusted: placing orders (prices and totals computed from `Products` on the server), confirming orders and updating stock, and creating admin users with the Admin SDK, so that no admin password ships to the browser.

## Known limitations

- A product's `Rating` is a running total, not an average: each review adds its 1-5 stars and each confirmed order adds 1. The UI shows one star per 50 points (capped at 5). A true average would need a review count on the product (or computing it from `Reviews`), which changes the data model, so it was left as is.
- The storefront user menu links to `/ecommerce/profile/profile`, which does not exist.
- The dashboard loads jQuery/DataTables from vendored files under `adminPanel/dashboard/assets/datatables/`, so its bundle is large (about 2.7 MB).

## Tech

JavaScript (ES modules) · Vite · Firebase Authentication · Cloud Firestore · Firebase Storage · DataTables (jQuery) · TinyMCE · DOMPurify · SweetAlert2 · Moment.js · Vitest
