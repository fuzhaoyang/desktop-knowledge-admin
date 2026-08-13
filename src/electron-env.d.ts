export {}

declare global {
  interface Window {
    electronAPI: {
      platform: string
      window: {
        minimize: () => Promise<void>
        maximizeToggle: () => Promise<void>
        close: () => Promise<void>
        onMaximizeChange: (cb: (isMaximized: boolean) => void) => () => void
      }
    }
  }
}
