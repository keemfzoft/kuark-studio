const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

    if (isDev) {
        console.log("Running in development mode");
        win.loadURL("http://localhost:5173/src/index.html");
    } else {
        console.log("Running in production mode");
        win.loadFile("src/index.html");
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("get-files", async (event, dirPath) => {
    try {
        const files = await fs.promises.readdir(dirPath);
        
        return files.map(file => ({
            name: file,
            fullPath: path.join(dirPath, file)
        }));
    } catch (err) {
        console.error("Error reading directory:", err);
        
        return [];
    }
});
