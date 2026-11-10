// Fails (exit 1) if any page listed in vite.config.js is missing from dist/,
// or if a non-empty HTML page in the source tree is not listed in vite.config.js.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { pages } from "../vite.config.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const skip = new Set(["node_modules", "dist", "public", ".git"]);

const findHtml = (dir) =>
    readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        if (skip.has(name)) return [];
        if (statSync(full).isDirectory()) return findHtml(full);
        return name.endsWith(".html") && statSync(full).size > 0
            ? [relative(root, full).split(sep).join("/")]
            : [];
    });

const errors = [];

for (const page of findHtml(root)) {
    if (!pages.includes(page)) errors.push(`not listed in vite.config.js: ${page}`);
}
for (const page of pages) {
    if (!existsSync(join(root, "dist", page))) errors.push(`missing from dist/: ${page}`);
}

if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
}
console.log(`dist/ contains all ${pages.length} pages.`);
