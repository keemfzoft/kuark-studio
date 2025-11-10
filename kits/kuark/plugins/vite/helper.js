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

function adapt(resource, device, type = "layout") {
    const breakpoints = {
        mobile: "(max-width: 600px)",
        tablet: "(min-width: 600px) and (max-width: 900px)",
        laptop: "(min-width: 900px) and (max-width: 1200px)",
        desktop: "(min-width: 1200px) and (max-width: 1600px)",
        tv: "(min-width: 1600px)",
    };

    let group = "layouts";

    switch (type) {
        case "aesthetic":
            group = "aesthetics";
            break;
        case "skin":
            group = "skins";
            break;
        case "motion":
            group = "motions";
            break;
    }

    const rootDir = path.resolve(path.join(process.cwd(), config.env.VITE_APP_BASE));
    const file = path.join(rootDir, `${group}/${device}/${resource}.css`);

    if (fs.existsSync(file)) {
        const content = patch(file, type);

        return `
            @container ${breakpoints[device]} {
                ${content}
            }
        `;
    }

    return "";
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

        source += adapt(aesthetic, "mobile", "aesthetic");
        source += adapt(aesthetic, "tablet", "aesthetic");
        source += adapt(aesthetic, "laptop", "aesthetic");
        source += adapt(aesthetic, "desktop", "aesthetic");
        source += adapt(aesthetic, "tv", "aesthetic");
    }

    for (let skin of skins) {
        const file = path.join(rootDir, `skins/${skin}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "skin");

            source += content + '\n';
        }

        source += adapt(skin, "mobile", "skin");
        source += adapt(skin, "tablet", "skin");
        source += adapt(skin, "laptop", "skin");
        source += adapt(skin, "desktop", "skin");
        source += adapt(skin, "tv", "skin");
    }

    for (let motion of motions) {
        const file = path.join(rootDir, `motions/${motion}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "motion");

            source += content + '\n';
        }

        source += adapt(motion, "mobile", "motion");
        source += adapt(motion, "tablet", "motion");
        source += adapt(motion, "laptop", "motion");
        source += adapt(motion, "desktop", "motion");
        source += adapt(motion, "tv", "motion");
    }

    return source;
}

function patchLayouts() {
    const rootDir = path.resolve(path.join(process.cwd(), config.env.VITE_APP_BASE));

    let source = "";

    for (let layout of layouts) {
        let file = path.join(rootDir, `layouts/${layout}.css`);

        if (fs.existsSync(file)) {
            const content = patch(file, "layout");

            source += content + '\n';
        }

        source += adapt(layout, "mobile", "layout");
        source += adapt(layout, "tablet", "layout");
        source += adapt(layout, "laptop", "layout");
        source += adapt(layout, "desktop", "layout");
        source += adapt(layout, "tv", "layout");
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