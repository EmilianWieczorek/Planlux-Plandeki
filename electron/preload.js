const { contextBridge } = require("electron");

// Expose a minimal, future-proof API for native integrations.
// Currently empty, but structured for printing, file system, etc.

contextBridge.exposeInMainWorld("planlux", {
  // Example placeholder for future native APIs:
  // printLabels: (payload) => ipcRenderer.invoke("print-labels", payload)
});

