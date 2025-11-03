import path from "path";
import { defineConfig } from "vite";
import { Kuark } from "./kits/kuark/plugins/vite";

export default defineConfig(() => {
    return {
        base: "./",
        resolve: {
            extensions: ["*", ".js", ".jsx", ".json"],
            alias: {
                kuark: path.resolve(__dirname, "kits/kuark"),
                app: path.resolve(__dirname, "src/app"),
            },
        },
        build: {
            target: "esnext",
            outDir: "dist",
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: "src/app",
                },
                output: {
                    entryFileNames: "assets/[name].js",
                    chunkFileNames: "assets/[name].js",
                    assetFileNames: "assets/[name].[ext]",
                },
            },
        },
        plugins: [
            Kuark(),
        ],
        esbuild: {
            jsx: "automatic",
            jsxImportSource: "kuark/core",
        },
    }
});