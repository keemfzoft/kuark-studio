import { spawn } from "./index";

const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const curators = [];

/**
 * Function used to compose a visual fragment and renders the resulting glyph to the parent element.
 * 
 * @param {*} glyph 
 * @param {HTMLElement} parent 
 * @param {string} option 
 * @returns 
 */
export function render(glyph, parent, option) {
    if (option == "prefetch-curators") {
        prefetch(glyph);
        render(glyph, parent, "paint");

        return;
    }

    let dom = null;

    if (glyph.class === "kuark.glyph" && typeof glyph.type === "string") {
        dom = document.createElementNS(XHTML_NAMESPACE, glyph.type);

        if (glyph.props.className) {
            dom.className = glyph.props.className;
        }

        if (glyph.props.layout) {
            dom.className = `${dom.className} ${glyph.props.layout}-layout`;
        }

        if (glyph.props.aesthetic) {
            dom.className = `${dom.className} ${glyph.props.aesthetic}-aesthetic`;
        }

        if (glyph.props.skin) {
            dom.className = `${dom.className} ${glyph.props.skin}-skin`;
        }

        if (glyph.props.motion) {
            dom.className = `${dom.className} ${glyph.props.motion}-motion`;
        }

        // For testing purposes
        if (glyph.props.source) {
            dom.src = glyph.props.source;
        }

        if (glyph.props.hint) {
            const hintDom = document.createElementNS(XHTML_NAMESPACE, "span");
            const hintText = document.createTextNode(glyph.props.hint);

            hintDom.appendChild(hintText);
            hintDom.id = "test-reader-hint";
            hintDom.className = "visually-hidden";

            dom.setAttribute("aria-describedby", "test-reader-hint");
            parent.appendChild(hintDom);
        }

        if (glyph.props.curator) {
            if (glyph.props.glyph) {
                dom.id = glyph.props.glyph;
            } else {
                dom.id = glyph.props.curator;
            }

            if (option === "paint") {
                for (const curator of curators) {
                    if (curator.name == glyph.props.curator) {
                        if (glyph.props.glyph) {
                            curator.instance.paint(glyph.props.glyph);
                        } else {
                            curator.instance.paint(glyph.props.curator);
                        }
                        
                        break;
                    }
                }
            } else {
                if (import.meta.env.DEV) {
                    const base = import.meta.env.VITE_APP_BASE;

                    spawn(`/${base}/curators/${glyph.props.curator}.jsx`);
                } else {
                    spawn("/dist/assets/" + glyph.props.curator + "-curator.js");
                }
            }
        }
    } else if (typeof glyph === "string") {
        dom = document.createTextNode(glyph);
    } else if (typeof glyph.type === "function") {
        render(glyph.type(glyph.props), parent, option);
    }

    if (dom) {
        if (typeof glyph === "object" && glyph.props.children) {
            let children = glyph.props.children;

            if (!Array.isArray(children)) {
                children = [children];
            }

            if (Array.isArray(children)) {
                for (let child of children) {
                    render(child, dom, option);

                    parent.appendChild(dom);
                }
            }
        } else {
            parent.appendChild(dom);
        }
    }

    return dom;
}

/**
 * Function used to emit requested glyphs from curators.
 * 
 * @param {array} glyphs 
 * @returns 
 */
export function emit(glyphs) {
    return (ev) => {
        if (typeof ev.data === "object") {
            if (ev.data.action == "paint") {
                for (let glyph of glyphs) {
                    if (glyph.name == ev.data.glyph) {
                        self.postMessage({
                            target: ev.data.glyph,
                            glyph: resolve(glyph.component()),
                        });
                        
                        break;
                    }
                }
            }
        } else if (ev.data === "paint") {
            const glyph = glyphs[0];
            
            self.postMessage({
                target: glyph.name,
                glyph: resolve(glyph.component()),
            });
        }
    }
}

/**
 * Function used to prefetch and spawn curators on-demand.
 * 
 * @param {*} glyph 
 */
function prefetch(glyph) {
    if (glyph.class === "kuark.glyph" && typeof glyph.type === "string") {
        if (glyph.props.curator) {
            if (!curators.some(item => item.name == glyph.props.curator)) {
                const base = import.meta.env.VITE_APP_BASE;
                let curator = null;
                
                if (import.meta.env.DEV) {
                    curator = spawn(`/${base}/curators/${glyph.props.curator}.jsx`, false);
                } else {
                    curator = spawn("/dist/assets/" + glyph.props.curator + "-curator.js", false);
                }

                curators.push({
                    name: glyph.props.curator,
                    instance: curator,
                });
            }
        }
    } else if (typeof glyph === "string") {
        
    } else {
        prefetch(glyph.type(glyph.props));
    }

    if (typeof glyph === "object" && glyph.props.children) {
        let children = glyph.props.children;

        if (!Array.isArray(children)) {
            children = [children];
        }

        if (Array.isArray(children)) {
            for (let child of children) {
                prefetch(child);
            }
        }
    }
}

/**
 * Function used to prepare and compose the virtual representation of the glyph
 * in a form of object that is emitted by the curators.
 * 
 * @param {*} glyph 
 * @returns 
 */
export function resolve(glyph) {
    if (glyph.class === "kuark.glyph" && typeof glyph.type === "function") {
        return resolve(glyph.type(glyph.props));
    }

    if (typeof glyph === "object" && glyph.props.children) {
        let children = glyph.props.children;

        if (!Array.isArray(children) && typeof children === "object") {
            children = [children];
        }

        if (Array.isArray(children)) {
            const glyphs = [];

            for (let [index, child] of children.entries()) {
                if (Array.isArray(child)) {
                    for (let subglyph of child) {
                        glyphs.push(resolve(subglyph));
                    }
                } else {
                    glyphs.push(resolve(child));
                }
            }
            
            glyph.props.children = glyphs;
        }
    }

    return glyph;
}