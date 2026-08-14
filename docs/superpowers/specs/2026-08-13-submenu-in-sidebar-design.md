# 子菜单移至左侧设计

- 日期：2026-08-13
- 范围：把 KnowledgeUpload 内部子 tab 移到 App.vue 左侧菜单下方

## 目标

将 `KnowledgeUpload.vue` 内部顶部的 6 个子 tab（文件/文本/URL爬取/统计/同步失败/文件目录）移到 `App.vue` 左侧菜单"知识库管理"主项下方作为子菜单；"人工客服"主项下方无子菜单。子 tab 状态提升到 `App.vue`。

## 非目标

- 不改动 `AdminChat` / `AdminChatView`。
- 不改动 `KnowledgeUpload` 内部各 tab 面板的内容与功能，仅移除其顶部 `.tabs` 并接收 prop。
- 不改动 `TitleBar` / `LoginView` / `auth.ts`。
- 不新增依赖、不新增组件文件。

## 已对齐决策

1. 选中"知识库管理"时左侧下方展开子 tab；选中"人工客服"时无子项。
2. 子 tab 状态 `activeTab` 从 `KnowledgeUpload` 提升到 `App.vue`（命名 `knowledgeTab`）。
3. `KnowledgeUpload` 接收 `activeTab` prop；`KnowledgeView` 透传。

## 架构

### `src/App.vue`

#### 脚本
- 新增 `import { ref, watch } from 'vue'`（watch 已存在则不重复）。
- 新增 `const knowledgeTab = ref('file')`。
- `KnowledgeView` 传 prop：`<KnowledgeView :active-tab="knowledgeTab" />`。

#### 模板
`.app-sidebar` 内结构：

```html
<aside class="app-sidebar">
  <button :class="{ active: tab === 'knowledge' }" @click="tab = 'knowledge'">📚 {{ $t('knowledgeMgr') }}</button>
  <div v-if="tab === 'knowledge'" class="app-submenu">
    <button :class="{ active: knowledgeTab === 'file' }" @click="knowledgeTab = 'file'"><UploadOutlined /> 文件</button>
    <button :class="{ active: knowledgeTab === 'text' }" @click="knowledgeTab = 'text'"><EditOutlined /> 文本</button>
    <button :class="{ active: knowledgeTab === 'url' }" @click="knowledgeTab = 'url'"><LinkOutlined /> URL爬取</button>
    <button :class="{ active: knowledgeTab === 'stats' }" @click="knowledgeTab = 'stats'"><BookOutlined /> 统计</button>
    <button :class="{ active: knowledgeTab === 'failures' }" @click="knowledgeTab = 'failures'"><InfoCircleOutlined /> 同步失败</button>
    <button :class="{ active: knowledgeTab === 'files' }" @click="knowledgeTab = 'files'"><FileOutlined /> 文件目录</button>
  </div>
  <button :class="{ active: tab === 'admin' }" @click="tab = 'admin'">👤 {{ $t('chat.adminTitle') }}</button>
</aside>
```

- 需在 `App.vue` 导入图标：`UploadOutlined, EditOutlined, LinkOutlined, BookOutlined, InfoCircleOutlined, FileOutlined` from `@ant-design/icons-vue`。

#### 样式
新增 `.app-submenu`：

```css
.app-submenu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}
.app-submenu button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px 8px 36px;
  border: none;
  background: transparent;
  color: #909399;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.app-submenu button:hover { background: #f5f7fd; color: #1677ff; }
.app-submenu button.active { color: #1677ff; font-weight: 600; background: rgba(22,119,255,0.06); }
```

> 子菜单按钮左侧 `padding-left: 36px` 形成缩进层级；主菜单按钮 `padding-left: 20px`。

### `src/views/KnowledgeView.vue`

接收 `activeTab` prop 并透传给 `KnowledgeUpload`：

```vue
<template>
  <div class="knowledge-view">
    <KnowledgeUpload :active-tab="activeTab" />
  </div>
</template>

<script setup lang="ts">
import KnowledgeUpload from '@/views/KnowledgeUpload.vue'

defineProps<{ activeTab: string }>()
</script>
```

> `import` 保持现有 `@/views/...` 别名写法（KnowledgeView 原本如此）。

### `src/views/KnowledgeUpload.vue`

#### 脚本
- `defineProps<{ activeTab: string }>()` 接收 prop（`<script setup>` 风格）。
- 移除 `const activeTab = ref('file')`。
- `watch(activeTab, ...)` 改为 `watch(() => props.activeTab, ...)`。
- 模板内所有 `activeTab` 引用改为 `activeTab`（prop，无需改前缀，`<script setup>` 中 props 自动暴露名）。
- `return { ... activeTab ... }`（Options API setup return）需改为 `return { ... activeTab: props.activeTab ... }`。

> 注：该文件是 Options API `defineComponent({ setup() { ... return {...} }})`。需在 setup 内 `const props = defineProps<{ activeTab: string }>()`，并把 return 的 `activeTab` 改为 `props.activeTab`。模板中 `activeTab` 保持不变（Vue 会从 setup 返回值解析）。

#### 模板
- 删除顶部 `.tabs` 整个 `<div class="tabs">...</div>`（6 个 `<span class="tab">`）。
- 各面板 `v-if="activeTab === '...'"` 保持不变（引用 prop）。
- how-to 区 `v-if="activeTab !== 'stats' && ..."` 保持不变。

#### 样式
- 删除 `.tabs` / `.tab` / `.tab:hover` / `.tab.active` / `.tab :deep(.anticon)` 五条规则（子 tab 已移走，不再需要）。
- `.sub-tabs`（URL 内的 single/menu 切换）保留不动。

## 边界与错误处理

- **主 tab 切换离开知识库再回来**：`knowledgeTab` 在 `App.vue` 持久保留（不重置），回到知识库时子菜单与面板状态一致。
- **HMR**：prop 传递 HMR 即时生效。
- **Options API + `<script setup>` 混用**：`KnowledgeUpload.vue` 是 `defineComponent({ setup() {} })`，`defineProps` 在 setup 内调用（Vue 3.3+ 支持 Options API setup 内 `defineProps`？需用 `props` 选项更稳妥）。

  > **修正**：`KnowledgeUpload.vue` 用 `defineComponent({ props: { activeTab: String }, setup(props) {...} })` 更稳妥，不依赖 `<script setup>` 的 `defineProps`。

## 涉及文件

- `src/App.vue`（改：加 knowledgeTab、子菜单、图标导入、样式）
- `src/views/KnowledgeView.vue`（改：接收并透传 activeTab prop）
- `src/views/KnowledgeUpload.vue`（改：props 接收 activeTab、删 .tabs、改 watch、删 tab 样式）
