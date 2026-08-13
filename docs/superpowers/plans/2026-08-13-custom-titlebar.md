# 自定义标题栏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Electron 主窗口从原生标题栏改为极简自定义标题栏（中性浅底 + 强调色按钮），仅含最小化/最大化-还原/关闭按钮并跟随网页主题。

**Architecture:** IPC + preload 桥接方案：主进程 `frame: false` 去 OS 标题栏并注册窗口控制 IPC；preload 在 `electronAPI.window` 上暴露控制 API 与最大化状态回调；新增 `TitleBar.vue` 渲染极细标题条与三个按钮；`App.vue` 顶部挂载并把原导航的拖拽职责移交标题栏。

**Tech Stack:** Electron 30 / Vue 3 / TypeScript / vite-plugin-electron / 现有 `--tag-bg` CSS 变量。

## Global Constraints

- 安全模型固定：`contextIsolation: true`、`nodeIntegration: false`，不得改。所有渲染进程→主进程通信走 `ipcRenderer.invoke` / `ipcMain.handle`。
- 不新增第三方依赖（图标用内联 SVG）。
- 无测试框架，遵循现状：每个任务的测试周期用 `npm run dev` + DevTools / 视觉验证替代。
- “关闭”语义复用托盘隐藏：`win:close` 等同 `mainWin.hide()`，不退出 app。
- 平台统一：Win/Linux/mac 均为右侧自定义按钮，不模拟 mac 红绿灯，不依赖 `titleBarOverlay`。
- 编辑遵循“精确编辑”：不动未提及代码；`electron/main.ts` 中已有的未使用 `Notification` 导入保持原样。
- 导入风格匹配 `App.vue` 现有相对路径写法（`./components/...`），不使用 `@` 别名。
- IPC 通道名（双方必须一致）：`win:minimize`、`win:maximize-toggle`、`win:close`、`win:get-maximized`、`win:maximize-changed`。
- preload 暴露的 `window.electronAPI` 结构（契约）：
  - `platform: string`（已有）
  - `window.minimize(): Promise<void>`
  - `window.maximizeToggle(): Promise<void>`
  - `window.close(): Promise<void>`
  - `window.onMaximizeChange(cb: (isMaximized: boolean) => void): () => void`（返回取消订阅函数）

---

### Task 1: IPC 桥（主进程 + preload + 类型声明）

**Files:**
- Modify: `electron/main.ts`（`createWindow` 内 BrowserWindow 选项 + 新增 `registerIpc` + maximize 事件）
- Modify: `electron/preload.ts`（扩展 `electronAPI`）
- Create: `src/electron-env.d.ts`（全局 `Window.electronAPI` 类型，声明 preload 契约）

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: 渲染进程可通过 `window.electronAPI.window.{minimize,maximizeToggle,close,onMaximizeChange}` 控制窗口并接收最大化状态；类型由 `src/electron-env.d.ts` 提供。

- [ ] **Step 1: 改造 `electron/main.ts`**

将文件整体替换为下方内容（保留未使用的 `Notification` 导入以遵循“不动无关代码”；新增 `ipcMain` 导入、`frame:false`/`titleBarStyle:'hidden'`、`registerIpc()`、maximize/unmaximize 事件推送；IPC 在 `createWindow` 之前注册）：

```ts
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
```

- [ ] **Step 2: 扩展 `electron/preload.ts`**

将文件整体替换为下方内容（保留已有 `platform`；新增 `window` 命名空间；`onMaximizeChange` 先 `removeAllListeners` 再 `on` 防重复，调用 `win:get-maximized` 做冷启动同步，并返回取消订阅函数）：

```ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  window: {
    minimize: () => ipcRenderer.invoke('win:minimize'),
    maximizeToggle: () => ipcRenderer.invoke('win:maximize-toggle'),
    close: () => ipcRenderer.invoke('win:close'),
    onMaximizeChange: (cb: (isMaximized: boolean) => void) => {
      const listener = (_e: unknown, isMaximized: boolean) => cb(isMaximized)
      ipcRenderer.removeAllListeners('win:maximize-changed')
      ipcRenderer.on('win:maximize-changed', listener)
      ipcRenderer.invoke('win:get-maximized').then(cb)
      return () => ipcRenderer.removeListener('win:maximize-changed', listener)
    },
  },
})
```

- [ ] **Step 3: 新建类型声明 `src/electron-env.d.ts`**

```ts
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
```

- [ ] **Step 4: 验证（DevTools 控制台）**

Run: `npm run dev`
等窗口出现后打开 DevTools（菜单或快捷键），在 Console 依次执行并核对：
- `window.electronAPI.platform` → 期望输出 `'linux'`（或当前平台）
- `window.electronAPI.window.minimize()` → 期望窗口立即最小化到任务栏；从任务栏点回
- `window.electronAPI.window.maximizeToggle()` → 期望窗口最大化；再执行一次 → 还原
- `window.electronAPI.window.onMaximizeChange(v => console.log('max=', v))` → 期望立即打印当前状态；随后手动最大化/还原窗口（用系统快捷键或再调 `maximizeToggle()`）→ 期望打印 `max= true` / `max= false`
- `window.electronAPI.window.close()` → 期望窗口隐藏（不退出）；托盘“显示”可唤回

Expected: 全部通过，窗口已无原生标题栏（frame 已隐藏）。

- [ ] **Step 5: 提交**

```bash
git add electron/main.ts electron/preload.ts src/electron-env.d.ts
git commit -m "feat: add IPC bridge for custom window controls (frameless)"
```

---

### Task 2: TitleBar 组件 + 接入 App.vue

**Files:**
- Create: `src/components/TitleBar.vue`（极简标题条，拖拽区 + 右侧三按钮）
- Modify: `src/App.vue`（顶部挂载 `<TitleBar />`；`.app-nav` 的 `-webkit-app-region` 由 `drag` 改 `no-drag`）
- Test: `npm run dev` 视觉与功能验证

**Interfaces:**
- Consumes: Task 1 的 `window.electronAPI.window.*` API（类型见 `src/electron-env.d.ts`）。
- Produces: 应用顶层极简自定义标题栏；窗口可通过按钮最小化/最大化-还原/隐藏，拖拽空白处移动窗口。

- [ ] **Step 1: 新建 `src/components/TitleBar.vue`**

先确保目录存在：`mkdir -p src/components`。然后写入：

```vue
<template>
  <div class="titlebar">
    <div class="titlebar-drag" />
    <div class="titlebar-controls">
      <button class="tb-btn" title="最小化" @click="onMin">
        <svg viewBox="0 0 10 10" width="10" height="10"><path d="M0 5 H10" stroke="currentColor" stroke-width="1" /></svg>
      </button>
      <button class="tb-btn" :title="isMaximized ? '还原' : '最大化'" @click="onMaxToggle">
        <svg v-if="isMaximized" viewBox="0 0 10 10" width="10" height="10">
          <rect x="0.5" y="2.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
          <rect x="2.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
        <svg v-else viewBox="0 0 10 10" width="10" height="10">
          <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
      </button>
      <button class="tb-btn tb-close" title="关闭" @click="onClose">
        <svg viewBox="0 0 10 10" width="10" height="10"><path d="M0 0 L10 10 M10 0 L0 10" stroke="currentColor" stroke-width="1" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isMaximized = ref(false)
let off: (() => void) | null = null

onMounted(() => {
  off = window.electronAPI?.window?.onMaximizeChange((v: boolean) => {
    isMaximized.value = v
  }) ?? null
})

onBeforeUnmount(() => off?.())

function onMin() { window.electronAPI?.window?.minimize() }
function onMaxToggle() { window.electronAPI?.window?.maximizeToggle() }
function onClose() { window.electronAPI?.window?.close() }
</script>

<style scoped>
.titlebar {
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: #f5f7fd;
}
.titlebar-drag { flex: 1; height: 100%; -webkit-app-region: drag; }
.titlebar-controls { display: flex; height: 100%; -webkit-app-region: no-drag; }
.tb-btn {
  width: 46px; height: 100%;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: #555;
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.tb-btn:hover { background: var(--tag-bg, #1677ff); color: #fff; }
.tb-close:hover { background: #e8494e; color: #fff; }
</style>
```

- [ ] **Step 2: 修改 `src/App.vue` 模板**

在 `<div class="app">` 内、`<nav class="app-nav">` 之前插入 `<TitleBar />`，并在 `<script setup>` 内导入组件。`<template>` 改为：

```vue
<template>
  <div class="app">
    <TitleBar />
    <nav class="app-nav">
      <button :class="{ active: tab === 'knowledge' }" @click="tab = 'knowledge'">📚 {{ $t('knowledgeMgr') }}</button>
      <button :class="{ active: tab === 'admin' }" @click="tab = 'admin'">👤 {{ $t('chat.adminTitle') }}</button>
    </nav>
    <main class="app-main">
      <KnowledgeView v-if="tab === 'knowledge'" />
      <AdminChatView v-if="tab === 'admin'" />
    </main>
  </div>
</template>
```

`<script setup>` 改为（仅新增 TitleBar 导入）：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import KnowledgeView from './views/KnowledgeView.vue'
import AdminChatView from './views/AdminChatView.vue'
import TitleBar from './components/TitleBar.vue'

const tab = ref('knowledge')
</script>
```

- [ ] **Step 3: 修改 `src/App.vue` 样式（移交拖拽职责）**

将 `.app-nav` 的 `-webkit-app-region: drag;` 改为 `-webkit-app-region: no-drag;`（拖拽交给 TitleBar 的拖拽区，避免点 tab 时误拖窗口）。`.app-nav` 规则改为：

```css
.app-nav {
  display: flex; gap: 4px; padding: 8px 12px;
  background: linear-gradient(135deg, var(--tag-bg, #1677ff), #1677ff 90%, #095ed9);
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}
```

> 注：`.app-nav button` 原有的 `-webkit-app-region: no-drag;` 在父级改为 `no-drag` 后已冗余，但保留不动以最小化改动。

- [ ] **Step 4: 验证（视觉 + 功能）**

Run: `npm run dev`
期望：
- 窗口顶部无原生标题栏；最顶端是一条 32px 高的浅色（`#f5f7fd`）细条，其下才是蓝色渐变 `.app-nav`。
- 细条右侧三个按钮（最小化 / 最大化 / 关闭），默认浅灰图标，hover 时最小化/最大化按钮变蓝（`--tag-bg`），关闭按钮 hover 变淡红 `#e8494e`。
- 点最小化 → 窗口最小化到任务栏。
- 点最大化 → 窗口最大化，按钮图标变为“还原（双方块）”；再点 → 还原，图标变回单方块。
- 点关闭 → 窗口隐藏（不退出）；托盘“显示”可唤回。
- 鼠标按住细条空白拖拽区（按钮左侧）可移动窗口；点 `.app-nav` 的 tab 不再触发窗口拖拽，可正常切换 tab。

Expected: 全部符合。

- [ ] **Step 5: 提交**

```bash
git add src/components/TitleBar.vue src/App.vue
git commit -m "feat: add minimal custom titlebar with theme-aware window controls"
```
