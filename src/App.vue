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
            <a-select
              v-if="tab === 'knowledge' && isLoggedIn"
              :value="currentModel"
              style="width: 200px; margin-right: 100px"
              @change="showModelSwitchModal"
            >
              <a-select-option v-for="m in availableModels" :key="m" :value="m">{{ m }}</a-select-option>
            </a-select>
            <button v-if="isLoggedIn" class="logout-btn" title="退出登录" @click="onLogout">
              <LogoutOutlined />
            </button>
          </div>
          <div class="content-wrap">
            <KnowledgeView v-if="tab === 'knowledge'" :active-tab="knowledgeTab" />
            <AdminChatView v-if="tab === 'admin'" />
          </div>
        </main>
      </div>
      <a-modal v-model:visible="modelSwitchModalVisible" title="切换模型" @ok="confirmSwitchModel" :confirmLoading="modelSwitchLoading">
        <p>确定切换到 {{ pendingModel }} ？</p>
        <a-input-password v-model:value="modelSwitchSecretKey" placeholder="请输入验证码" @keydown.enter="confirmSwitchModel" />
      </a-modal>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { isLoggedIn, logout } from './auth'
import { UploadOutlined, EditOutlined, LinkOutlined, BookOutlined, InfoCircleOutlined, FileOutlined, AppstoreOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import KnowledgeView from './views/KnowledgeView.vue'
import AdminChatView from './views/AdminChatView.vue'
import LoginView from './views/LoginView.vue'
import TitleBar from './components/TitleBar.vue'

const API_BASE = 'https://code-nav.top'

type MenuItem = { key: string; keyPath: string[] }
const subKeys = ['file', 'text', 'url', 'stats', 'failures', 'files']
const selectedKeys = ref<string[]>(['file'])
const openKeys = ref<string[]>(['knowledge'])
const collapsed = ref(false)
const tab = ref<'knowledge' | 'admin'>('knowledge')
const knowledgeTab = ref('file')

const currentModel = ref('')
const availableModels = ref<string[]>([])
const pendingModel = ref('')
const modelSwitchModalVisible = ref(false)
const modelSwitchSecretKey = ref('')
const modelSwitchLoading = ref(false)

async function loadModel() {
  try {
    const res = await fetch(API_BASE + '/api/model')
    const data = await res.json()
    currentModel.value = data.model
    availableModels.value = data.available
  } catch {
    // ignore
  }
}

function showModelSwitchModal(value: string) {
  pendingModel.value = value
  modelSwitchSecretKey.value = ''
  modelSwitchModalVisible.value = true
}

async function confirmSwitchModel() {
  if (!modelSwitchSecretKey.value) return
  modelSwitchLoading.value = true
  try {
    const formData = new FormData()
    formData.append('model', pendingModel.value)
    formData.append('secret_key', modelSwitchSecretKey.value)
    const res = await fetch(API_BASE + '/api/model', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      currentModel.value = data.model
      modelSwitchModalVisible.value = false
      modelSwitchSecretKey.value = ''
      message.success(`已切换到 ${data.model}`)
    } else {
      const data = await res.json()
      message.error(data.detail || '切换失败')
    }
  } catch {
    message.error('切换失败：网络错误')
  } finally {
    modelSwitchLoading.value = false
  }
}

onMounted(() => {
  loadModel()
})

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
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #606266;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.logout-btn:hover {
  background: #fef0f0;
  color: #e8494e;
}
.content-wrap { flex: 1; overflow: hidden; }
</style>