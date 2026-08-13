import { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } from 'electron'
import { join } from 'path'

let mainWin: BrowserWindow | null = null
let tray: Tray | null = null

function registerIpc() {
  ipcMain.handle('win:minimize', () => mainWin?.minimize())
  ipcMain.handle('win:maximize-toggle', () => {
    if (!mainWin) return
    mainWin.isMaximized() ? mainWin.unmaximize() : mainWin.maximize()
  })
  ipcMain.handle('win:close', () => mainWin?.hide())
  ipcMain.handle('win:get-maximized', () => !!mainWin?.isMaximized())
}

function createWindow() {
  mainWin = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 400,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    title: 'CodeNav 管理',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWin.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWin.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWin.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWin?.hide()
    }
  })

  mainWin.on('maximize', () => mainWin?.webContents.send('win:maximize-changed', true))
  mainWin.on('unmaximize', () => mainWin?.webContents.send('win:maximize-changed', false))

  mainWin.once('ready-to-show', () => mainWin?.show())
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  const ctx = Menu.buildFromTemplate([
    { label: '显示', click: () => mainWin?.show() },
    { label: '退出', click: () => { app.isQuitting = true; app.quit() } },
  ])
  tray.setContextMenu(ctx)
  tray.setToolTip('CodeNav Chat')
  tray.on('click', () => mainWin?.show())
}

app.whenReady().then(() => {
  registerIpc()
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {})
