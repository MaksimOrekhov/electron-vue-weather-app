'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let filterWindow

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })
function createMainWindow () {
  const window = new BrowserWindow({ width: 1000, height: 1000, webPreferences: { webSecurity: false }})
  const filter = new BrowserWindow({ width: 800, height: 600, parent: window, show: false, webPreferences: { webSecurity: false } })

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    filter.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/#/filter')
    if (!process.env.IS_TEST) window.webContents.openDevTools()
    if (!process.env.IS_TEST) filter.webContents.openDevTools()
  } else {
    createProtocol('app')
    //   Load the index.html when not in development
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
      })
    )

    filter.loadURL(`file://${__dirname}/index.html#filter`)
  }

  window.on('closed', () => {
    mainWindow = null
  })

  filter.on('close', (e) => {
    e.preventDefault()
    filter.hide()
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  filterWindow = filter

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
  }
  mainWindow = createMainWindow()
})

ipcMain.on('open-filter', (event, arg) => {
  filterWindow.show();
  filterWindow.webContents.send('filter', arg);
})

ipcMain.on('close-filter', (event, arg) => {
  filterWindow.close();
  mainWindow.webContents.send('filter', arg);
  global.sharedObject = {
    city_name: arg,
  };
})
