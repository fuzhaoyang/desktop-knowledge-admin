# 应用启动登录设计

- 日期：2026-08-13
- 范围：Electron 桌面应用启动登录流程

## 目标

应用启动时先进入登录界面，输入账号密码校验通过后才进入主内容页；主内容页提供"退出登录"入口，点击后回到登录界面。登录界面背景动态且简洁。

## 非目标

- 不接入后端鉴权（纯前端硬编码校验）。
- 不改动既有视图（KnowledgeUpload / AdminChat）内部逻辑。
- 不引入 Pinia / vue-router / 多窗口 / 新依赖。
- 不改动 `AdminChatLogin.vue`（Web 版残留代码，保持原样）。

## 现状

- `src/App.vue` 用 `tab` ref + `v-if` 切换两个主视图，顶部为 `TitleBar` + 蓝色 `.app-nav`。
- `AdminChatLogin.vue` 为 Web 版残留登录页，依赖未注册的 `vue-router`，桌面端不挂载，不参与本次设计。
- 无持久化登录态机制；`localStorage` 仅 `i18n` 在用（`lang`）。
- 既有硬编码约定：密钥 `612731`（见 README 安全说明）。

## 已对齐决策

1. "记住我"勾选 → `localStorage` 持久化登录态。
2. 退出登录按钮放在极简标题栏右侧（窗口控制按钮左侧）。
3. 登录页在主窗口内用 `v-if` 切换，不开独立窗口。
4. 登录页保留 `<TitleBar />`（窗口最小化/关闭/拖拽始终可用），但不显示 `.app-nav`（tab）与退出按钮。
5. 纯前端硬编码校验：账号 `fuchaoyang` / 密码 `612731`。
6. 登录页背景：纯 CSS 渐变流动（方案 A），动态且简洁。

## 方案选择

登录态管理采用 **全局响应式 `isLoggedIn` ref + localStorage**（方案 A）。

否决方案：
- 方案 B（Pinia store）：项目无 Pinia 依赖，为一个布尔值引入属过度设计。
- 方案 C（App.vue 本地 ref + provide/inject）：跨组件同步（TitleBar 退出按钮）需层层传递，比独立模块更绕。

登录页背景采用 **纯 CSS 渐变流动**（方案 A）。

否决方案：
- 方案 B（Canvas 粒子流）：代码量大、需动画循环与清理逻辑，偏离"简洁"。
- 方案 C（纯静态渐变）：无动态，不满足"动态"要求。

## 架构

### 1. 登录态模块 `src/auth.ts`（新增，单一职责）

- 暴露 `isLoggedIn: Ref<boolean>`，初始值由 `localStorage.getItem('auth_logged_in') === '1'` 计算。
- `login(username, password, remember): { ok: boolean; error?: string }`：
  - 硬编码校验 `username === 'fuchaoyang' && password === '612731'`。
  - 成功：`isLoggedIn.value = true`；`remember` 为真则 `localStorage.setItem('auth_logged_in', '1')`，否则 `removeItem`。
  - 失败：返回 `{ ok: false, error: '账号或密码错误' }`，不区分账号错/密码错以防枚举。
- `logout()`：`isLoggedIn.value = false`；`localStorage.removeItem('auth_logged_in')`。
- 账号/密码常量集中在模块顶部（硬编码，与本应用既有约定一致）。

### 2. 登录视图 `src/views/LoginView.vue`（新增）

#### 结构
极简卡片，自上而下：
1. 标题："CodeNav 管理 登录"
2. 账号输入框（`<input type="text">`）
3. 密码输入框（`<input type="password">`）
4. "记住我"复选框（`<input type="checkbox">`）
5. 登录按钮
6. 错误提示区（仅失败时显示）

#### 交互
- 回车键（任一输入框聚焦时）触发登录。
- 点击登录按钮：调用 `auth.login(username, password, remember)`。
  - 成功：`isLoggedIn` 变 `true`，`App.vue` 响应式自动切换到主内容（无需手动跳转）。
  - 失败：显示 `error` 文案，密码框清空，聚焦密码框。
- 不引入 Ant Design 组件（登录表单极简，原生 input 足够；避免与既有 Antd 全局注册产生风格冲突）。

#### 视觉
- **动态背景**：浅底 `#f5f7fd` 之上，2–3 个带 `filter: blur(60px)` 的强调色圆形色块，用 `@keyframes` 做缓慢位移与缩放循环（周期 20–30s，缓动 `ease-in-out`，`alternate`），形成柔和流动光斑效果。色块颜色基于 `var(--tag-bg, #1677ff)` 的浅色变体。
- **卡片**：居中、白色背景、圆角 12px、轻阴影 `0 8px 32px rgba(0,0,0,0.08)`、内边距 `40px`。
- **强调色**：登录按钮与输入框聚焦边框用 `var(--tag-bg, #1677ff)`，与流动色斑呼应。
- **克制**：无图标堆砌、无多余文字；动态仅作背景氛围，不抢卡片焦点。
- `prefers-reduced-motion: reduce` 时禁用动画（无障碍）。

### 3. `src/App.vue` 接入

- `<template>` 顶层结构：
  - 始终渲染 `<TitleBar />`（窗口控制始终可用）。
  - `<template v-if="!isLoggedIn"><LoginView /></template>`（登录页：无 `.app-nav`、无退出按钮）。
  - `<template v-else>`：现有 `.app-nav` + `.app-main`（主内容）。
- `<script setup>` `import { isLoggedIn } from './auth'`，直接用响应式 ref 驱动视图切换，无需本地 state。
- 不改动现有 `.app-nav` / `.app-main` 内部结构与样式。

### 4. `src/components/TitleBar.vue` 增加退出登录按钮

- 在右侧三个窗口控制按钮**左侧**新增"退出登录"按钮。
- `v-if="isLoggedIn"`（仅登录后显示；登录页不显示）。
- 纯图标（简洁线条图标）+ `title="退出登录"` tooltip。
- 点击 `auth.logout()`，`isLoggedIn` 自动变 `false`，`App.vue` 自动切回登录页（无需跳转逻辑）。
- 样式沿用现有按钮：默认透明、hover 用 `var(--tag-bg, #1677ff)` 强调色；与窗口按钮间留 `margin-left: 8px` 分隔。
- `<script setup>` `import { isLoggedIn } from '../auth'`、`import { logout } from '../auth'`。

### 5. 数据流

```
[应用启动]
  └─ auth.ts 初始化 isLoggedIn = (localStorage.auth_logged_in === '1')
       └─ App.vue v-if 响应
            ├─ isLoggedIn=false → <LoginView />
            └─ isLoggedIn=true  → 主内容

[LoginView 输入并提交]
  └─ auth.login(u, p, remember)
       └─ 校验 fuchaoyang / 612731
            ├─ 成功: isLoggedIn=true; (remember? localStorage.set : remove)
            │        └─ App.vue v-if 响应 → 切到主内容
            └─ 失败: 返回 {ok:false, error}; LoginView 显示错误

[TitleBar 退出登录按钮]
  └─ auth.logout()
       └─ isLoggedIn=false; localStorage.remove('auth_logged_in')
            └─ App.vue v-if 响应 → 切回登录页
```

## 边界与错误处理

- **硬编码凭据安全**：账号/密码在客户端代码中明文存在（与本应用既有 `612731` 约定一致，README 已标注客户端硬编码性质）。本次不引入加密/服务端校验（非目标）。
- **localStorage 被篡改**：用户手动改 `localStorage.auth_logged_in='1'` 可跳过登录。这是纯前端校验的固有局限，本次接受（与既有约定一致）。
- **记住我未勾选**：登录成功但 `remember=false`，仅内存态登录，关闭应用即登出。
- **回车键**：任一输入框聚焦时回车触发登录，避免误触发 form 默认提交（`@keydown.enter.prevent`）。
- **退出后状态**：`logout` 仅重置登录态，不清除 `tab` 等业务状态（下次登录恢复上次 tab，符合预期）。
- **HMR**：`auth.ts` 为纯模块，HMR 重载时 `isLoggedIn` 重新从 localStorage 计算，行为一致。

## 测试与验证

- `npm run dev` 后：
  - 首次启动（无 localStorage）→ 显示登录页（动态背景 + 居中卡片）。
  - 输入错误账号/密码 → 显示"账号或密码错误"，密码框清空并聚焦。
  - 输入 `fuchaoyang` / `612731`，不勾"记住我" → 进入主内容页；关闭应用重启 → 回到登录页。
  - 勾选"记住我"后登录 → 进入主内容页；关闭应用重启 → 直接进入主内容页（免登录）。
  - 主内容页标题栏右侧出现"退出登录"按钮；登录页不显示该按钮。
  - 点击"退出登录" → 回到登录页；重启应用（之前勾过记住我）→ 回到登录页（因 logout 清除了 localStorage）。
  - 登录页标题栏最小化/关闭/拖拽窗口均正常工作。
  - 系统设置"减少动态效果"时背景动画停止（无障碍）。
- 不新增测试框架（项目无测试框架，遵循现状）。

## 涉及文件

- `src/auth.ts`（新增）
- `src/views/LoginView.vue`（新增）
- `src/components/TitleBar.vue`（修改：加退出登录按钮）
- `src/App.vue`（修改：登录/主内容 v-if 切换）
