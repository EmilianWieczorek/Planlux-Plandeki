const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

let mainWindow = null;
let serverStarted = false;

function getStartUrl() {
  const port = process.env.PORT || 3000;

  if (isDev) {
    return process.env.ELECTRON_START_URL || `http://localhost:${port}`;
  }

  return `http://localhost:${port}`;
}

function startStandaloneServer() {
  if (isDev || serverStarted) return;

  try {
    const port = process.env.PORT || 3000;
    process.env.NODE_ENV = "production";
    process.env.PORT = String(port);

    // In the packaged app, .next/standalone is included by electron-builder.
    const standaloneDir = path.join(__dirname, "..", ".next", "standalone");
    const serverPath = path.join(standaloneDir, "server.js");

    // Ensure relative paths inside the standalone server resolve correctly.
    process.chdir(standaloneDir);

    // Require the Next.js standalone server; it will start listening on PORT.
    // This avoids spawning fragile CLI binaries inside the packaged app.
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(serverPath);

    serverStarted = true;
  } catch (error) {
    console.error("Failed to start Next.js standalone server", error);
    dialog.showErrorBox(
      "Application startup error",
      "PLANLUX PRODUKCJA PLANDEK could not start its internal server. " +
        "Please contact your system administrator."
    );
    app.quit();
  }
}

function createWindow() {
  const startUrl = getStartUrl();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadURL(startUrl);

  mainWindow.webContents.on("did-fail-load", () => {
    // In production, if the server is not yet ready, show a simple
    // diagnostic page instead of a blank window.
    if (!isDev) {
      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>PLANLUX PRODUKCJA PLANDEK</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
              .card { background: #fff; border-radius: 8px; padding: 24px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); max-width: 420px; }
              h1 { font-size: 18px; margin: 0 0 8px; }
              p { margin: 4px 0; font-size: 13px; color: #555; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Application starting...</h1>
              <p>Internal server is still initializing. If this message does not disappear after a short while, please restart the application or contact your administrator.</p>
            </div>
          </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.on("ready", () => {
  if (!isDev) {
    startStandaloneServer();
  }
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

