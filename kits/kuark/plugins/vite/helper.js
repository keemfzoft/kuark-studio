import path from "path";
import fs from "fs";

let curators = [];
let aesthetics = [];
let layouts = [];
let skins = [];
let motions = [];

function extract(pattern, content) {
    const matches = [];

    for (const match of content.matchAll(pattern)) {
        const name = match[1];

        if (!matches.includes(name)) {
            matches.push(name);
        }
    }

    return matches;
}

function extractCurators(content) {
    const matches = extract(/curator="(.+?)"/g, content);

    curators = curators.concat(matches);

    return matches;
}

function extractAesthetics(content) {
    const matches = extract(/aesthetic="(.+?)"/g, content);

    aesthetics = aesthetics.concat(matches);

    return matches;
}

function extractLayouts(content) {
    const matches = extract(/layout="(.+?)"/g, content);

    layouts = layouts.concat(matches);

    return matches;
}

function extractSkins(content) {
    const matches = extract(/skin="(.+?)"|skin:\s*"(.+?)"/g, content);

    skins = skins.concat(matches);

    return matches;
}

function extractMotions(content) {
    const matches = extract(/motion="(.+?)"/g, content);

    motions = motions.concat(matches);

    return matches;
}

function patch(file, type) {
    let content = fs.readFileSync(file, "utf-8");

    const pattern = /(\..+?)\s*{/g;
    const patched = [];

    for (const match of content.matchAll(pattern)) {
        const selector = match[1];
        const pattern2 = new RegExp(`${selector}`, "g");

        if (!patched.includes(selector)) {
            content = content.replace(pattern2, `${selector}-${type}`);    
            patched.push(selector);
        }
    }

    return content;
}

function patchAesthetics() {
    const rootDir = path.resolve(path.join(process.cwd(), config.env.VITE_APP_BASE));

    let source = "";

    for (let aesthetic of aesthetics) {
        const file = path.join(rootDir, `aesthetics/${aesthetic}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "aesthetic");

            source += content + '\n';
        }
    }

    for (let skin of skins) {
        const file = path.join(rootDir, `skins/${skin}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "skin");

            source += content + '\n';
        }
    }

    for (let motion of motions) {
        const file = path.join(rootDir, `motions/${motion}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "motion");

            source += content + '\n';
        }
    }

    return source;
}

function patchLayouts() {
    const rootDir = path.resolve(path.join(process.cwd(), config.env.VITE_APP_BASE));

    let source = "";

    for (let layout of layouts) {
        const file = path.join(rootDir, `layouts/${layout}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "layout");

            source += content + '\n';
        }
    }

    return source;
}

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

let config = null;

export const Helper = {
    set(params) {
        config = params;
    },
    extract(type, content) {
        switch (type) {
            case "curators":
                return extractCurators(content);
            case "aesthetics":
                return extractAesthetics(content);
            case "layouts":
                return extractLayouts(content);
            case "skins":
                return extractSkins(content);
            case "motions":
                return extractMotions(content);
        }
    },
    compile(type) {
        if (type === "aesthetics") {
            return patchAesthetics();
        } else if (type === "layouts") {
            return patchLayouts();
        }
    },
    attach(type, registry) {
        if (type === "curators") {
            for (let curator of curators) {
                const name = capitalize(curator);

                if (config.serving) {
                    registry[`${curator}`] = path.join(process.cwd(), `${config.env.VITE_APP_BASE}/curators/${name}.jsx`);
                } else {
                    registry[`${curator}-curator`] = path.join(process.cwd(), `${config.env.VITE_APP_BASE}/curators/${name}.jsx`);
                }
            }
        }

        return registry;
    },
    getFiles(dir) {
        let results = [];

        const list = fs.readdirSync(dir);
    
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
    
            if (stat && stat.isDirectory()) {
                results = results.concat(this.getFiles(fullPath));
            } else {
                results.push(fullPath);
            }
        });
    
        return results;
    },
}