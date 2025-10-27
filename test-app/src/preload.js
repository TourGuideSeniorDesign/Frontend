// Use contextBridge to safely expose an API to the render process
const { contextBridge, ipcRenderer } = require('electron/renderer'); 

// Custom API named "electronAPI"
// This allows the preload script to be loaded into the main process (main.js),
// while using the custom API in the render processes (React app)
contextBridge.exposeInMainWorld('electronAPI', {
  // General purpose button
  sendButtonAction: (action) => ipcRenderer.send('button-action', action),

  onUpdateDisplay: (callback) => ipcRenderer.on('update-display', (_, msg) => callback(msg)),

  sendPassword: (password) => ipcRenderer.send('send-password', password)
});