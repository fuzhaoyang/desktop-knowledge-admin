# 自定义标题栏设计

- 日期：2026-08-13
- 范围：Electron 主窗口标题栏改造

## 目标

将 Electron 主窗口从原生 OS 标题栏改为完全自定义的极简标题栏，仅保留窗口控制按钮（最小化 / 最大化-还原 / 关闭），并跟随网页主题（中性浅底 + 强调色按钮）。

## 非目标

- 不实现明/暗主题切换系统（项目当前无此系统）。
- 不改动现有蓝色渐变导航栏 `.app-nav` 的视觉。
- 不改动托盘逻辑（关闭=隐藏到托盘的语义保持不变）。

## 现状

- `electron/main.ts`：`BrowserWindow` 使用默认 `frame`（原生标题栏），已有托盘与“关闭即隐藏”逻辑。
- `electron/preload.ts`：仅暴露 `platform`。
- `src/App.vue`：`.app-nav` 已设 `-webkit-app-region: drag`，含两个 tab 按钮。
- 无主题系统；`--tag-bg`（fallback `#1677ff`）为仅有的强调色 CSS 变量。

## 方案选择

采用 IPC + preload 方案（方案 A），与现有 `contextIsolation: true`、`nodeIntegration: false` 安全模型一致，改动最小。

否决方案：
- 方案 B（`@electron/remote` / `nodeIntegration`）：违背安全隔离，官方不推荐。
- 方案 C（`titleBarOverlay`）：保留原生按钮样式，不满足“完全自定义”。

## 架构

### 主进程 `electron/main.ts`

- `BrowserWindow` 新增选项：`frame: false`、`titleBarStyle: 'hidden'`（mac 兼容）。
- 保留现有尺寸、最小尺寸、preload、Tray、关闭即隐藏逻辑不变。
- 新增 IPC 处理器（`ipcMain.handle`）：
  - `win:minimize` → `mainWin.minimize()`
  - `win:maximize-toggle` → `mainWin.isMaximized() ? mainWin.unmaximize() : mainWin.maximize()`
  - `win:close` → `mainWin.hide()`（复用托盘隐藏语义，不退出 app）
- 监听 `mainWin` 的 `maximize` / `unmaximize` 事件，经 `webContents.send('win:maximize-changed', isMaximized)` 向渲染进程推送状态。
- IPC 注册时机：在 `app.whenReady().then(() => { createWindow(); createTray(); })` 内、`createWindow()` 之前注册，确保渲染进程首次调用前主进程已就绪。

### preload `electron/preload.ts`

在现有 `electronAPI` 上扩展 `window` 命名空间：

```js
electronAPI = {
  platform,                              // 已有
  window: {
    minimize(),
    maximizeToggle(),
    close(),
    onMaximizeChange(cb: (isMaximized: boolean) => void)
  }
}
```

- `minimize/maximizeToggle/close` 内部用 `ipcRenderer.invoke` 转发。
- `onMaximizeChange` 内部：先 `removeListener` 再 `addListener`，避免 HMR / 重挂载重复堆积；注册后由主进程立即推送当前 `isMaximized()` 状态（冷启动同步）。

### 新增组件 `src/components/TitleBar.vue`

- 单行细条，高度约 32px。
- 左侧空白拖拽区：`-webkit-app-region: drag`。
- 右侧三个按钮：`-webkit-app-region: no-drag`，顺序 最小化 / 最大化-还原 / 关闭。
- 不含标题文字（“仅保留窗口控制按钮”）。
- 状态：`ref<boolean> isMaximized`，由 `onMaximizeChange` 回调更新；最大化按钮图标在 最大化↔还原 间切换。
- 平台：Win/Linux/mac 统一右侧自定义按钮，不模拟 mac 红绿灯。

样式（中性浅底 + 强调色按钮）：
- 背景：`#f5f7fd`（与 body 一致）或更浅。
- 按钮默认透明，hover 用 `var(--tag-bg, #1677ff)` 强调色点缀。
- 关闭按钮 hover 用淡红（如 `#e8494e`）。
- 图标用简单 CSS / SVG 内联，不引入新依赖。

### 接入 `src/App.vue`

- 顶部插入 `<TitleBar />`，位于 `.app-nav` 之上。
- `.app-nav` 的 `-webkit-app-region` 由 `drag` 改为 `no-drag`（拖拽职责交给 TitleBar，避免导航内 tab 误触发拖拽）。
- 布局保持 `display: flex; flex-direction: column; height: 100vh`。

## 数据流

```
[TitleBar 按钮 click]
  └─ window.electronAPI.window.minimize / maximizeToggle / close()
       └─ ipcRenderer.invoke('win:minimize' | 'win:maximize-toggle' | 'win:close')
            └─ ipcMain.handle → mainWin.minimize() / .isMaximized()?unmaximize():maximize() / .hide()

[窗口最大化状态变化]
  └─ mainWin.on('maximize' | 'unmaximize')
       └─ mainWin.webContents.send('win:maximize-changed', isMaximized)
            └─ preload: onMaximizeChange(cb) 监听触发 cb(isMaximized)
                 └─ TitleBar ref<boolean> isMaximized 更新 → 按钮图标切换
```

初始化时主进程在 `onMaximizeChange` 注册后立即推送一次当前 `mainWin.isMaximized()`，避免冷启动状态不匹配。

## 边界与错误处理

- **托盘语义**：`win:close` 等同 `mainWin.hide()`，不退出 app，与托盘“显示/退出”菜单联动一致。
- **重复监听**：preload `onMaximizeChange` 先 `removeListener` 再 `addListener`，防 HMR / 重挂载堆积。
- **平台差异**：Win/Linux/mac 统一右侧自定义按钮，不模拟红绿灯，保证极简一致；无 `titleBarOverlay` 依赖。
- **IPC 就绪**：`ipcMain.handle` 在 `app.whenReady()` 内注册，先于渲染进程调用。
- **HMR 降级**：preload 用 `try/catch` 包裹 `window.electronAPI` 访问，缺失时按钮优雅降级为不响应（不崩渲染进程）。

## 测试与验证

- `npm run dev` 后：
  - 窗口无原生标题栏。
  - 三个按钮可正常最小化 / 最大化切换 / 隐藏到托盘。
  - 最大化按钮图标随状态变化。
  - 拖拽标题栏空白处可移动窗口。
- 托盘联动：关闭后托盘“显示”可重新显示窗口。
- 不新增测试框架（项目无测试框架，遵循现状）。

## 涉及文件

- `electron/main.ts`（修改）
- `electron/preload.ts`（修改）
- `src/components/TitleBar.vue`（新增）
- `src/App.vue`（修改）
