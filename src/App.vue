<template>
  <div class="app">
    <TitleBar />
    <LoginView v-if="!isLoggedIn" />
    <template v-else>
      <div class="app-body">
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
import { UploadOutlined, EditOutlined, LinkOutlined, BookOutlined, InfoCircleOutlined, FileOutlined } from '@ant-design/icons-vue'
import KnowledgeView from './views/KnowledgeView.vue'
import AdminChatView from './views/AdminChatView.vue'
import LoginView from './views/LoginView.vue'
import TitleBar from './components/TitleBar.vue'

const tab = ref('knowledge')
const knowledgeTab = ref('file')
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
.app-main { flex: 1; overflow: hidden; }
</style>