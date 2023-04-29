import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Bindings } from "./bindings.js";

const require = createRequire(import.meta.url);

const BINDINGS_NAME = "simpleble.node";

let bindings: Bindings | undefined;

const dir = dirname(fileURLToPath(import.meta.url));
const moduleRoot = resolve(dir, '..');
const paths = [
    join(moduleRoot, 'build', 'Release', BINDINGS_NAME),
    join(moduleRoot, 'prebuilds', `${process.platform}-${process.arch}`, BINDINGS_NAME)
];

for (const path of paths) {
    try {
        bindings = require(path);
    } catch (_e) {
        continue;
    }
}
if (!bindings) {
    throw new Error("Failed to load addon");
}

export const adapters = bindings.getAdapters();

function unload(): void {
    if (adapters) {
        for (const adapter of adapters) {
            adapter.release();
        }
    }
}
process.on('exit', unload);
process.on('SIGINT', unload);
