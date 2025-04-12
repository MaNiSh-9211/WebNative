// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   navigateToUrl: (url) => ipcRenderer.send('navigate-to-url', url),
//   onNavigateUrlResponse: (callback) => ipcRenderer.on('navigate-url-response', (event, validatedUrl) => callback(validatedUrl)),
//   openTunnelWindow: () => ipcRenderer.send('open-tunnel-window'),

// });


const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  navigateToUrl: (url) => ipcRenderer.send('navigate-to-url', url),
  onNavigateUrlResponse: (callback) => ipcRenderer.on('navigate-url-response', (event, validatedUrl) => callback(validatedUrl)),
  openTunnelWindow: () => ipcRenderer.send('open-tunnel-window'), // Sends request to open the tunnel window
  startCloudflareTunnel: (port) => ipcRenderer.send('start-cloudflare-tunnel', port), // Sends start tunnel request with the port
  onCloudflareTunnelUrl: (callback) => ipcRenderer.on('cloudflare-tunnel-url', (event, url) => callback(url)), // Receives the tunnel URL
  onCloudflareTunnelLog: (callback) => ipcRenderer.on('cloudflare-tunnel-log', (event, log) => callback(log)) // Receives logs
});
