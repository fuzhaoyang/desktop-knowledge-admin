<template>
  <div class="app">
    <TitleBar />
    <LoginView v-if="!isLoggedIn" />
    <template v-else>
      <div class="app-body">
        <aside class="app-sidebar" :class="{ collapsed }">
          <div class="sidebar-trigger" @click="collapsed = !collapsed">
            <MenuFoldOutlined v-if="!collapsed" />
            <MenuUnfoldOutlined v-else />
            <span v-if="!collapsed" class="trigger-text">收起菜单</span>
          </div>
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
              <template #title>
                <span><AppstoreOutlined /> {{ $t('knowledgeMgr') }}</span>
              </template>
              <a-menu-item key="file"><UploadOutlined /> <span>文件</span></a-menu-item>
              <a-menu-item key="text"><EditOutlined /> <span>文本</span></a-menu-item>
              <a-menu-item key="url"><LinkOutlined /> <span>URL爬取</span></a-menu-item>
              <a-menu-item key="stats"><BookOutlined /> <span>统计</span></a-menu-item>
              <a-menu-item key="failures"><InfoCircleOutlined /> <span>同步失败</span></a-menu-item>
              <a-menu-item key="files"><FileOutlined /> <span>文件目录</span></a-menu-item>
            </a-sub-menu>
            <a-menu-item key="admin"><UserOutlined /> <span>{{ $t('chat.adminTitle') }}</span></a-menu-item>
          </a-menu>
        </aside>
        <main class="app-main">
          <KnowledgeView v-if="tab === 'knowledge'" :active-tab="knowledgeTab" />
          <AdminChatView v-if="tab === 'admin'" />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isLoggedIn } from './auth'
import { UploadOutlined, EditOutlined, LinkOutlined, BookOutlined, InfoCircleOutlined, FileOutlined, AppstoreOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
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

function onMenuClick({ key, keyPath }: MenuItem) {
  if (key === 'admin') {
    tab.value = 'admin'
    return
  }
  if (subKeys.includes(key)) {
    knowledgeTab.value = key
    tab.value = 'knowledge'
  }
}
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
  transition: width 0.2s ease;
}
.app-sidebar.collapsed { width: 64px; }
.sidebar-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.sidebar-trigger:hover { color: #1677ff; }
.app-sidebar.collapsed .sidebar-trigger { padding: 10px 22px; }
.trigger-text { white-space: nowrap; }
.sidebar-menu { border-inline-end: none !important; }
.app-main { flex: 1; overflow: hidden; }
</style>