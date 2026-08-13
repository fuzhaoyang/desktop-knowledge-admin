<template>
  <div class="app">
    <TitleBar />
    <LoginView v-if="!isLoggedIn" />
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isLoggedIn } from './auth'
import KnowledgeView from './views/KnowledgeView.vue'
import AdminChatView from './views/AdminChatView.vue'
import LoginView from './views/LoginView.vue'
import TitleBar from './components/TitleBar.vue'

const tab = ref('knowledge')
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
.app-main { flex: 1; overflow: hidden; }
</style>