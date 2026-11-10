import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

// Every HTML page of the multi-page app. Vite only builds index.html by default,
// so each page has to be listed here to end up in dist/.
// scripts/check-dist.mjs fails the CI build if a page is missing from dist/.
export const pages = [
    "index.html",

    // storefront
    "ecommerce/login/login.html",
    "ecommerce/register/register.html",
    "ecommerce/products/products.html",
    "ecommerce/productDetails/productDetails.html",
    "ecommerce/shopping/shoppingCart.html",
    "ecommerce/shopping/shoppingMessage.html",
    "ecommerce/shopping/whishlistCart.html",

    // admin panel
    "adminPanel/authentication/login.html",
    "adminPanel/dashboard/home.html",
    "adminPanel/customers/customer.html",
    "adminPanel/products/create.html",
    "adminPanel/products/details.html",
    "adminPanel/products/update.html",
    "adminPanel/users/profile.html",
    "adminPanel/users/changeEmail.html",
    "adminPanel/users/changePassword.html",
];

export default defineConfig({
    build: {
        rollupOptions: {
            input: Object.fromEntries(
                pages.map((page) => [page.replace(/\.html$/, ""), resolve(root, page)])
            ),
        },
    },
});
