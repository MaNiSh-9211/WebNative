// const { contextBridge, ipcRenderer } = require('electron');

// // Bridge methods for the renderer process
// contextBridge.exposeInMainWorld('electron', {
//   sendMessage: (channel, data) => ipcRenderer.send(channel, data),
// });


const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  navigateToUrl: (url) => ipcRenderer.send('navigate-to-url', url),
  onNavigateUrlResponse: (callback) => ipcRenderer.on('navigate-url-response', (event, validatedUrl) => callback(validatedUrl)),
});
