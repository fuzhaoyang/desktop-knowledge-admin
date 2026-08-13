# 左侧菜单 + 右侧内容布局设计

- 日期：2026-08-13
- 范围：主内容区布局重构（主 tab 移至左侧菜单栏）

## 目标

将 `App.vue` 顶部蓝色横向 `.app-nav`（知识库管理 / 人工客服）改为左侧纵向菜单栏，右侧放主内容；形成"左侧菜单 + 右侧内容"的桌面管理后台布局。

## 非目标

- 不移动 `KnowledgeUpload.vue` 内部的子 tab（文件/文本/URL/统计/同步失败/文件目录），它们仍留在知识库视图内部顶部。
- 不改动 `AdminChatView` / `AdminChat` / `KnowledgeView` / `KnowledgeUpload` 的内部结构与样式。
- 不改动 `TitleBar` / `LoginView` / 登录流程。
- 不引入 `vue-router`、不新增组件文件、不新增依赖。

## 现状

- `App.vue` 主内容结构（`v-else` 分支）：顶部 `<nav class="app-nav">`（蓝色渐变，两个主 tab 按钮）+ `<main class="app-main">`（`flex:1; overflow:hidden`）。
- 主 tab：📚 知识库管理 / 👤 人工客服，`v-if` 切换 `KnowledgeView` / `AdminChatView`。
- `TitleBar` 32px 在最顶部（全宽）。
- `KnowledgeView` 内部 `overflow-y:auto` 滚动；`KnowledgeUpload` 内有自己的 `.tabs`（子 tab，横向）。

## 已对齐决策

1. 仅主 tab（知识库管理 / 人工客服）移至左侧；子 tab 保留在 `KnowledgeUpload` 内部。
2. 左侧菜单浅色风格：白色背景、选中强调色高亮、与右侧浅灰内容区形成层次。
3. 左侧菜单宽度 180px。
4. 改动集中在 `App.vue` 一个文件。

## 方案选择

采用 **`App.vue` 布局重构**（方案 A）：主内容区由纵向（`.app-nav` 在上 + `.app-main` 在下）改为横向（左侧 `.app-sidebar` 180px + 右侧 `.app-main` flex:1）。

否决方案：
- 方案 B（新增 `Sidebar.vue` 组件）：仅为两个菜单项抽独立组件，过度设计。
- 方案 C（引入 vue-router + 布局重构）：违背现有 `v-if` 风格，改动巨大。

## 架构

### `src/App.vue` 布局重构

#### 模板
`<template>` 主内容分支（`v-else`）改为：

```html
<template v-else>
  <div class="app-body">
    <aside class="app-sidebar">
      <button :class="{ active: tab === 'knowledge' }" @click="tab = 'knowledge'">📚 {{ $t('knowledgeMgr') }}</button>
      <button :class="{ active: tab === 'admin' }" @click="tab = 'admin'">👤 {{ $t('chat.adminTitle') }}</button>
    </aside>
    <main class="app-main">
      <KnowledgeView v-if="tab === 'knowledge'" />
      <AdminChatView v-if="tab === 'admin'" />
    </main>
  </div>
</template>
```

> 引入 `.app-body` 作为横向 flex 容器，承载 sidebar + main；`TitleBar` 仍在 `.app` 顶部、`.app-body` 之上（全宽不变）。

#### 样式
- 删除原 `.app-nav` / `.app-nav button` / `.app-nav button.active` / `.app-nav button:hover` 四条规则。
- 新增：

```css
.app-body { flex: 1; display: flex; overflow: hidden; }
.app-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.app-sidebar button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.app-sidebar button:hover { background: #f5f7fd; color: #1677ff; }
.app-sidebar button.active {
  background: rgba(22,119,255,0.08);
  color: #1677ff;
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--tag-bg, #1677ff);
}
```

- `.app-main` 保留 `flex: 1; overflow: hidden;`（已存在，不重复定义）。
- `.app` 保留 `display: flex; flex-direction: column; height: 100vh;`（不变，TitleBar 在上、app-body 在下纵向排列）。

### 不变项

- `KnowledgeUpload.vue` 的子 tab（文件/文本/URL/统计/同步失败/文件目录）与其 `.tabs` / `.tab` 样式不动。
- `AdminChatView` / `AdminChat` / `KnowledgeView` 内部结构与样式不动。
- `TitleBar`、`LoginView`、登录态模块 `auth.ts` 不动。

## 边界与错误处理

- **窄窗口**：窗口最小宽度 400px，减去 180px 侧边栏后内容区约 220px。`KnowledgeUpload` 内表格、`AdminChat` 内布局已有各自滚动/响应处理，不在本次范围内额外处理（保持现状）。
- **HMR**：仅 CSS 与模板结构变更，HMR 即时生效。
- **登录态/退出按钮**：不受影响（`TitleBar` 在 `.app-body` 之外）。

## 测试与验证

- `npm run dev` 后：
  - TitleBar 在最顶部（不变）。
  - 主内容区为左右布局：左侧 180px 白色菜单栏（两项菜单纵向排列），右侧浅灰内容区。
  - 默认选中"知识库管理"：按钮左侧 3px 蓝色条 + 浅蓝底 + 蓝色加粗文字；右侧显示 `KnowledgeView`。
  - 点"人工客服"：高亮转移，右侧显示 `AdminChatView`。
  - hover 未选中项：浅灰底 + 蓝字。
  - 知识库视图内部子 tab（文件/文本/URL等）仍在视图内顶部横向排列，功能正常。
  - 退出登录按钮仍在 TitleBar 右侧，点击回到登录页。
- 不新增测试框架（遵循现状）。

## 涉及文件

- `src/App.vue`（修改：模板主内容分支 + 删 `.app-nav` 样式 + 加 `.app-body`/`.app-sidebar` 样式）
