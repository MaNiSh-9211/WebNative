
// const { app, BrowserWindow, ipcMain, Menu } = require('electron');
// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');
// const { exec } = require('child_process');

// let mainWindow;

// // Define paths you have permission to access
// const directoriesToAccess = [
//   app.getPath('desktop'),
//   app.getPath('documents'),
//   app.getPath('downloads'),
//   'C:\\', // Accessing the root directory (requires elevated privileges)
// ];

// app.on('ready', () => {
//   mainWindow = new BrowserWindow({
//     // width: 1200,
//     // height: 800,
//         //  frame: false, // Removes all window frame controls
//         //  fullscreen: true, // Enable full-screen mode

//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false,
//       preload: path.join(__dirname, 'preload.js'),
//       webviewTag: true, // Enable webview for embedding external content
//     },
//     // icon: path.join(__dirname, 'assets', 'icon.png'), // Path to your icon file
//   });

//   mainWindow.loadFile('index.html');

//   // Remove the default menu 
//   Menu.setApplicationMenu(null);

//   // Track all requests in the browser
//   mainWindow.webContents.session.webRequest.onCompleted((details) => {
//     const url = details.url;

//     if (url.endsWith('/webnative/send-folder-details')) {
//       // Iterate through all predefined directories and list files/folders
//       directoriesToAccess.forEach((dirPath) => {
//         fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
//           if (err) {
//             console.error(`Error reading folder: ${dirPath}`, err);
//             return;
//           }

//           const folderNames = files
//             .filter((file) => file.isDirectory())
//             .map((folder) => folder.name);

//           // Send the folder names to the server
//           axios
//             .post(url, { folders: folderNames })
//             .then((response) => {
//               console.log('Successfully sent folder details:', response.data);
//             })
//             .catch((error) => {
//               console.error('Failed to send folder details:', error.message);
//             });
//         });
//       });
//     }
//   });

//   // Handle URL navigation from the renderer
//   ipcMain.on('navigate-to-url', (event, url) => {
//     if (url) {
//       const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
//       event.sender.send('navigate-url-response', validUrl); // Respond with the validated URL
//     }
//   });

//   // Optionally, check for elevated permissions on Windows if you need access to root directories like "C:\\"
//   checkElevatedPermissions();
// });

// // Check if the app is running with elevated permissions (Windows)
// function checkElevatedPermissions() {
//   if (process.platform === 'win32') {
//     exec('net session', (err, stdout, stderr) => {
//       if (err) {
//         console.error('This app does not have elevated permissions. Some directories may be inaccessible.', stderr);
//       } else {
//         console.log('The app is running with elevated permissions. Access to all system directories is allowed.');
//       }
//     });
//   }
// }

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });



const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

let mainWindow;
let tunnelWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
    },
  });

  mainWindow.loadFile('index.html');
  Menu.setApplicationMenu(null);

  // Track all requests in the browser (for folder details handling)
  mainWindow.webContents.session.webRequest.onCompleted((details) => {
    const url = details.url;

    if (url.endsWith('/webnative/send-folder-details')) {
      directoriesToAccess.forEach((dirPath) => {
        fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.error(`Error reading folder: ${dirPath}`, err);
            return;
          }

          const folderNames = files
            .filter((file) => file.isDirectory())
            .map((folder) => folder.name);

          axios
            .post(url, { folders: folderNames })
            .then((response) => {
              console.log('Successfully sent folder details:', response.data);
            })
            .catch((error) => {
              console.error('Failed to send folder details:', error.message);
            });
        });
      });
    }
  });

  // Handle URL navigation from the renderer
  ipcMain.on('navigate-to-url', (event, url) => {
    if (url) {
      const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      event.sender.send('navigate-url-response', validUrl); // Respond with the validated URL
    }
  });

  // Handle tunneling window opening
  ipcMain.on('open-tunnel-window', () => {
    if (!tunnelWindow) {
      tunnelWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      tunnelWindow.loadFile('tunneling/tunnel.html');
    }
  });

  // Handle Cloudflare tunneling command when "Expose" button is clicked in the tunneling window
  ipcMain.on('start-cloudflare-tunnel', (event, port) => {
    if (!port) {
      console.error("❌ No port provided");
      return;
    }

    console.log(`⚙️ Starting Cloudflare tunnel on port: ${port}`);
    const cmd = `cloudflared tunnel --url http://localhost:${port}`;

    const tunnelProcess = exec(cmd);

    tunnelProcess.stdout.on('data', (data) => {
      const output = data.trim();
      console.log(`🌐 Cloudflare tunnel stdout: ${output}`);
      event.sender.send('cloudflare-tunnel-log', output); // Send output to renderer

      const match = output.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/);
      if (match) {
        console.log(`✅ Tunnel started successfully! Public URL: ${match[0]}`);
        event.sender.send('cloudflare-tunnel-url', match[0]);
      }
    });

    tunnelProcess.stderr.on('data', (data) => {
      const error = data.trim();
      console.error(`❌ Cloudflare tunnel stderr: ${error}`);
      event.sender.send('cloudflare-tunnel-log', `❌ ERROR: ${error}`);
    });

    tunnelProcess.on('close', (code) => {
      console.log(`💤 Tunnel process exited with code ${code}`);
      event.sender.send('cloudflare-tunnel-log', `💤 Tunnel process exited with code ${code}`);
      if (code !== 0) {
        event.sender.send('cloudflare-tunnel-log', "❌ Tunnel process failed to start.");
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
