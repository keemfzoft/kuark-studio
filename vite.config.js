import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    resolve: {
        extensions: ["*", ".js", ".json"],
    },
    build: {
        target: "esnext",
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: "src/main.js",
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    }
});