import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  window: {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    maximizeToggle: () => ipcRenderer.invoke('win:maximize-toggle'),
    close: () => ipcRenderer.invoke('win:close'),
    fullscreenToggle: () => ipcRenderer.invoke('win:fullscreen-toggle'),
    onMaximizeChange: (cb: (isMaximized: boolean) => void) => {
      const listener = (_e: unknown, isMaximized: boolean) => cb(isMaximized)
      ipcRenderer.removeAllListeners('win:maximize-changed')
      ipcRenderer.on('win:maximize-changed', listener)
      ipcRenderer.invoke('win:get-maximized').then(cb)
      return () => ipcRenderer.removeListener('win:maximize-changed', listener)
    },
  },
})
