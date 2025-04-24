import { defineConfig } from 'vite';

export default defineConfig({
    base: "/platformer/",
    publicDir: "public",
    build: {
        outDir: "dist",
    }
});