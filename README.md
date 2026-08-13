# CodeNav 管理

Electron 桌面端管理后台，对接 [code-nav.top](https://code-nav.top) 后端，提供**知识库管理**与**人工客服**两大功能。

## 技术栈

- **Electron 30** — 桌面外壳（frameless 自定义标题栏）
- **Vue 3** + **TypeScript** — 渲染进程
- **Vite 5** + `vite-plugin-electron` — 构建/开发
- **Ant Design Vue 3** — UI 组件
- **vue-i18n 9** — 中/英双语（默认 `zh_CN`，由 `localStorage.lang` 切换）
- **electron-builder** — 打包（Win nsis / Mac dmg / Linux deb）

## 功能模块

顶部导航在两个 Tab 间切换（基于 `App.vue` 的 `v-if`，**未使用 vue-router**）：

### 📚 知识库管理（`KnowledgeView` → `KnowledgeUpload`）

文件上传 / 文本输入 / URL 爬取（单页 & 站点菜单）→ 自动切片入向量库；统计、条目搜索/分页/删除/批量删除/一键清空；同步失败记录；服务端文件目录浏览与重试；AI 模型切换。所有敏感操作需输入验证码（`secret_key`）。

### 👤 人工客服（`AdminChatView` → `AdminChat`）

实时 WebSocket 客服控制台：会话列表（10s 轮询）、接入会话、收发消息（含表情）、结束会话。

## 开发

```bash
npm install
npm run dev        # 启动 Vite + Electron
npm run build      # 构建渲染产物 + electron-builder 打包
npm run preview    # 预览渲染产物
```

## 后端接口

所有请求指向 `https://code-nav.top`（WS：`wss://code-nav.top`）。

| 场景 | 方法 | 路径 |
|---|---|---|
| 上传文件 | POST | `/api/aiuploadfile` |
| 验证并切片 | POST | `/api/aiuploadfile/verify` |
| 提交文本 | POST | `/api/aiuploadtext` |
| 爬取单页 | POST | `/api/crawl` |
| 爬取站点菜单 | POST | `/api/crawl/menu` |
| 知识库统计 | GET | `/api/knowledge/stats` |
| 条目列表 | GET | `/api/knowledge/entries` |
| 删除条目 | DELETE | `/api/knowledge/entries/:id` |
| 批量删除 | POST | `/api/knowledge/entries/batch-delete` |
| 清空全部 | POST | `/api/knowledge/clear-all` |
| 同步失败记录 | GET | `/api/sync/failures` |
| 文件目录 | GET | `/api/file-update/files` |
| 删除文件 | DELETE | `/api/file-update/files` |
| 重试文件 | POST | `/api/file-update/retry` |
| 当前模型 | GET | `/api/model` |
| 切换模型 | POST | `/api/model` |
| 客服会话列表 | GET | `/api/admin/sessions` |
| 客服 WebSocket | WS | `/ws/admin` |

## 目录结构

```
electron/
  main.ts          主进程：窗口/托盘/IPC（窗口控制）
  preload.ts       预加载：暴露 electronAPI（platform + window 控制 + 最大化状态回调）
src/
  App.vue          根组件：TitleBar + 顶部 Tab 导航 + 视图切换
  main.ts          入口：仅注册 i18n（无 router）
  components/
    TitleBar.vue    极简自定义标题栏（中性浅底 + 强调色按钮，frameless）
  views/
    KnowledgeView.vue        知识库布局壳
    KnowledgeUpload.vue      知识库管理主体（1215 行）
    AdminChatView.vue        客服布局壳
    AdminChat.vue            客服控制台主体（WebSocket）
    AdminChatLogin.vue       客服登录页（Web 版残留，桌面端未挂载，依赖未注册的 vue-router）
  language/
    index.ts        i18n 配置
    lang/           zh_CN.ts / en.ts + site 数据
  electron-env.d.ts Window.electronAPI 类型声明
```

## 自定义标题栏

主窗口 `frame: false`，由 `TitleBar.vue` 渲染 32px 高极简标题条：

- 左侧空白为拖拽区（`-webkit-app-region: drag`），可移动窗口
- 右侧三按钮：最小化 / 最大化-还原（图标随状态切换）/ 关闭（隐藏到托盘，不退出）
- 中性浅底 `#f5f7fd`，按钮 hover 用强调色 `var(--tag-bg, #1677ff)`，关闭按钮 hover 淡红 `#e8494e`
- 原有蓝色渐变 `.app-nav` 拖拽职责已移交标题栏，改为 `no-drag`

IPC 通道：`win:minimize` / `win:maximize-toggle` / `win:close` / `win:get-maximized` / `win:maximize-changed`。

## 系统托盘

关闭窗口 → 隐藏到托盘（不退出）。托盘菜单：**显示** / **退出**。

## 说明

- `AdminChatLogin.vue` 为 Web 版残留代码，桌面端未引用且依赖未注册的 `vue-router`，不参与运行。
- `package.json` 的 `dexie` 依赖在本仓库视图内未实际使用；数据全部落在远端后端，客户端仅 `sessionStorage` 保存客服已验证标记。
- 语言文件含大量旧导航/博客项目的历史翻译条目，仅 `knowledgeMgr`、`knowledge*`、`chat.*` 等为本应用实际使用。
