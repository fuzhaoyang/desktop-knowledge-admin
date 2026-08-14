<template>
  <div class="app">
    <TitleBar />
    <LoginView v-if="!isLoggedIn" />
    <template v-else>
      <div class="app-body">
        <aside class="app-sidebar" :class="{ collapsed }">
          <a-menu
            v-model:selectedKeys="selectedKeys"
            v-model:openKeys="openKeys"
            mode="inline"
            theme="light"
            :inline-collapsed="collapsed"
            class="sidebar-menu"
            @click="onMenuClick"
          >
            <a-sub-menu key="knowledge">
              <template #icon><AppstoreOutlined /></template>
              <template #title>{{ $t('knowledgeMgr') }}</template>
              <a-menu-item key="file">
                <template #icon><UploadOutlined /></template>
                文件
              </a-menu-item>
              <a-menu-item key="text">
                <template #icon><EditOutlined /></template>
                文本
              </a-menu-item>
              <a-menu-item key="url">
                <template #icon><LinkOutlined /></template>
                URL爬取
              </a-menu-item>
              <a-menu-item key="stats">
                <template #icon><BookOutlined /></template>
                统计
              </a-menu-item>
              <a-menu-item key="failures">
                <template #icon><InfoCircleOutlined /></template>
                同步失败
              </a-menu-item>
              <a-menu-item key="files">
                <template #icon><FileOutlined /></template>
                文件目录
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item key="admin">
              <template #icon><UserOutlined /></template>
              {{ $t('chat.adminTitle') }}
            </a-menu-item>
          </a-menu>
        </aside>
        <main class="app-main">
          <div class="content-toolbar">
            <button class="collapse-trigger" @click="collapsed = !collapsed" :title="collapsed ? '展开菜单' : '收起菜单'">
              <MenuFoldOutlined v-if="!collapsed" />
              <MenuUnfoldOutlined v-else />
            </button>
            <div class="toolbar-spacer" />
            <button v-if="isLoggedIn" class="logout-btn" @click="onLogout">
              <LogoutOutlined />
              <span>退出登录</span>
            </button>
          </div>
          <div class="content-wrap">
            <KnowledgeView v-if="tab === 'knowledge'" :active-tab="knowledgeTab" />
            <AdminChatView v-if="tab === 'admin'" />
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isLoggedIn, logout } from './auth'
import { UploadOutlined, EditOutlined, LinkOutlined, BookOutlined, InfoCircleOutlined, FileOutlined, AppstoreOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import KnowledgeView from './views/KnowledgeView.vue'
import AdminChatView from './views/AdminChatView.vue'
import LoginView from './views/LoginView.vue'
import TitleBar from './components/TitleBar.vue'

type MenuItem = { key: string; keyPath: string[] }
const subKeys = ['file', 'text', 'url', 'stats', 'failures', 'files']
const selectedKeys = ref<string[]>(['file'])
const openKeys = ref<string[]>(['knowledge'])
const collapsed = ref(false)
const tab = ref<'knowledge' | 'admin'>('knowledge')
const knowledgeTab = ref('file')

function onMenuClick(info: { key: string; keyPath: string[] }) {
  const { key } = info
  if (key === 'admin') {
    tab.value = 'admin'
    return
  }
  if (subKeys.includes(key)) {
    knowledgeTab.value = key
    tab.value = 'knowledge'
  }
}

function onLogout() { logout() }
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f7fd; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #c8d0dc; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--tag-bg, #1677ff); }
::-webkit-scrollbar-corner { background: transparent; }
.app { display: flex; flex-direction: column; height: 100vh; }
.app-body { flex: 1; display: flex; overflow: hidden; }
.app-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.2s ease;
}
.app-sidebar.collapsed { width: 64px; }
.sidebar-menu { border-inline-end: none !important; }
.app-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.content-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}
.collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #606266;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.collapse-trigger:hover { background: #f5f7fd; color: #1677ff; }
.toolbar-spacer { flex: 1; }
.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #fde2e2;
  border-radius: 6px;
  background: #fef0f0;
  color: #e8494e;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.logout-btn:hover {
  background: #e8494e;
  color: #fff;
  border-color: #e8494e;
}
.content-wrap { flex: 1; overflow: hidden; }
</style>