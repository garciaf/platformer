import { defineConfig } from 'vite';

export default defineConfig({
    base: "/platformer/",
    publicDir: "assets",
    build: {
        outDir: "dist",
    }
});