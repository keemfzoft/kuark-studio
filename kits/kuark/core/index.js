import { render } from "./render";

/**
 * Function used to spawn curators (Web Workers that handle UI rendering)
 * 
 * @param string name
 * @param bool autoPaint
 */
export function spawn(name, autoPaint = true) {
    return new Curator(name, autoPaint);
}

class Curator {
    constructor(name, autoPaint = true) {
        const e = this;
        
        this.worker = new Worker(name, { type: "module" });

        this.worker.onmessage = (ev) => {
            e.render(ev);
        }

        if (autoPaint) {
            this.paint();
        }
    }

    render(ev) {
        const el = document.getElementById(ev.data.target);

        render(ev.data.glyph, el);
    }

    paint(glyph) {
        if (glyph) {
            this.worker.postMessage({
                action: "paint",
                glyph,
            });
        } else {
            this.worker.postMessage("paint");
        }
    }
}