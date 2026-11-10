# E-Commerce Store + Admin Panel (JavaScript, Firebase)

A training project, built as a team at ITI. It's a storefront and an admin panel written in **vanilla JavaScript**, bundled with **Vite**, with **Firebase** (Authentication, Firestore, Storage) as the backend.

<!-- TODO(Youssef): confirm which parts you built yourself (e.g. "I built the admin panel's products and orders pages") before adding a "My role" section. -->

## Features

**Storefront** (`ecommerce/`)
- Home page, product list and product details with reviews
- Customer registration and login (Firebase Authentication)
- Wishlist and shopping cart (kept in `localStorage`), with orders saved to Firestore

**Admin panel** (`adminPanel/`)
- Dashboard
- Product and category management, including image upload to Firebase Storage
- Orders and customers
- Admin users: create users, change email and password, profile

**Data** lives in Firestore collections: `Products`, `Categories`, `Orders`, `Customers`, `Users`, `Reviews`.

## Running it

You need Node.js 18+ and your own Firebase project with Authentication (email/password), Firestore and Storage enabled.

```bash
npm install
cp .env.example .env.local   # fill in your Firebase web config and an admin account
npm run dev
```

## Security notes

* All configuration comes from environment variables (`.env.example`). Earlier commits contained hard-coded values. They were moved out of the source, and the credentials they contained should be considered compromised.
* This is a **client-only** app. Anything Vite bundles, including `VITE_ADMIN_PASSWORD`, ends up in the browser. The admin-seeding approach is fine for a classroom demo but not for production. A real deployment would create admins with the Firebase Admin SDK (for example in a Cloud Function) and protect data with Firestore security rules.

## Tech

JavaScript (ES modules) · Vite · Firebase Authentication · Cloud Firestore · Firebase Storage · SweetAlert2 · Moment.js
