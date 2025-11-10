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
            if (ev.data.action === "repaint") {
                e.paint(ev.data.glyph, "repaint");
            } else {
                e.render(ev);
            }
        }

        if (autoPaint) {
            this.paint();
        }
    }

    render(ev) {
        const el = document.getElementById(ev.data.target);

        if (ev.data.mode) {
            console.log(ev.data.mode);
            render(ev.data.glyph, el, ev.data.mode);
        } else {
            render(ev.data.glyph, el);
        }
    }

    paint(glyph, mode) {
        if (glyph) {
            this.worker.postMessage({
                action: "paint",
                mode,
                glyph,
            });
        } else {
            this.worker.postMessage("paint");
        }
    }

    request(task) {
        this.worker.postMessage(task);
    }
}