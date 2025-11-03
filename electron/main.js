const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    console.log(isDev);

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