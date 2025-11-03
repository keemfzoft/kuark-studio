import fs from "fs";
import path from "path";
import { loadEnv, transformWithEsbuild } from "vite"
import { Helper } from "./helper";

export function Kuark() {
    let env = null;
    let minify = false;
    let serving = false;
    let virtualLayouts = "";
    let virtualAesthetics = "";

    return {
        name: "kuark-vite-plugin",
        config(config, { mode }) {
            env = loadEnv(mode, process.cwd())
        },
        configResolved(config) {
            const isDev = config.command === "serve";

            serving = isDev;
            minify = config?.build?.minify !== false;
        },
        async buildStart(options) {
            const rootDir = path.resolve(path.join(process.cwd(), env.VITE_APP_BASE));
            const files =  Helper.getFiles(rootDir);

            Helper.set({
                env,
                serving,
            });

            for (let key in files) {
                const file = path.resolve(rootDir, files[key]);
                
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, "utf-8");

                    Helper.extract("curators", content);
                    Helper.extract("aesthetics", content);
                    Helper.extract("layouts", content);
                    Helper.extract("skins", content);
                    Helper.extract("motions", content);
                }
            }

            Helper.attach("curators", options.input);

            let source = Helper.compile("aesthetics");;

            virtualAesthetics = source;

            if (!serving) {
                const result = await transformWithEsbuild(source, "assets/aesthetics.css", {
                    loader: "css",
                    minify,
                });

                this.emitFile({
                    type: "asset",
                    fileName: "assets/aesthetics.css",
                    source: result.code,
                });
            }

            source =  Helper.compile("layouts");
            virtualLayouts = source;

            if (!serving) {
                const result = await transformWithEsbuild(source, "assets/layouts.css", {
                    loader: "css",
                    minify,
                });

                this.emitFile({
                    type: "asset",
                    fileName: "assets/layouts.css",
                    source: result.code,
                });
            }
        },
        resolveId(id) {
            if (id.endsWith("/assets/main.js")) {
                return `${env.VITE_APP_BASE}/index.jsx`;
            }
        },
        load(id) {
            const pattern = /curator/g;
            const rootDir = path.resolve(path.join(process.cwd(), env.VITE_APP_BASE));

            if (id === `${env.VITE_APP_BASE}/index.jsx`) {
                const file = path.join(rootDir, `/index.jsx`);
                const code = fs.readFileSync(file, "utf-8");

                return {
                    code, 
                };
            }

            if (id.endsWith("/assets/aesthetics.css?direct")) {
                return {
                    code: virtualAesthetics,
                    meta: {
                        vite: {
                            lang: "css",
                        },
                    },
                };
            } else if (id.endsWith("/assets/layouts.css?direct")) {
                return {
                    code: virtualLayouts,
                    meta: {
                        vite: {
                            lang: "css",
                        },
                    },
                };
            }

            if (pattern.test(id)) {
                const file = id;
                
                if (fs.existsSync(file)) {
                    const glyphs = [];
                    
                    let content = fs.readFileSync(file, "utf-8");
                    const pattern = /export function\s*(.*?)\(/g;

                    for (const match of content.matchAll(pattern)) {
                        const glyph = match[1];

                        if (!glyphs.includes(glyph)) {
                            glyphs.push(glyph);
                        }
                    }

                    content += '\n';

                    let list = "";

                    for (let glyph of glyphs) {
                        const name = glyph.toLowerCase();
                        
                        list += `{name: "${name}", component: ${glyph}},`;
                    }

                    content += `const glyphs = [${list}];\n`;
                    content += `self.onmessage = emit(glyphs)\n`;

                    return content;
                }
            }
        },
        transform(code, id) {
            const pattern = /curator/g;

            if (pattern.test(id)) {
                const transformed = `import { emit } from "kuark";\n${code}`;
                
                return {
                    code: transformed,
                    map: null // or generate source map
                };
            }
        },
        generateBundle(_, bundle) {
            
        },
        handleHotUpdate({ server, file }) {
            if (file.endsWith(".css")) {
                server.restart();
            }
        },
    };
}