import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import { render } from "kuark";
import { App } from "./App";

render(<App />, document.getElementById("app"), "prefetch-curators");

/*self.MonacoEnvironment = {
    getWorker(_, label) {
        switch (label) {
            case "json": return new JsonWorker();
            case "css": return new CssWorker();
            case "html": return new HtmlWorker();
            case "typescript":
            case "javascript": return new TsWorker();
            default: return new EditorWorker();
        }
    }
};

/*monaco.editor.create(document.getElementById("editor"), {
    value: `function greet() {\n  console.log("Hello, Fritz!");\n}`,
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true
});*/