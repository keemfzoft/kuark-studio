const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("kuark", {
    getFiles: (dirPath) => ipcRenderer.invoke("get-files", dirPath)
});