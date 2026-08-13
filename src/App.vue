<template>
  <div class="app">
    <TitleBar />
    <LoginView v-if="!isLoggedIn" />
    <template v-else>
      <nav class="app-nav">
        <button :class="{ active: tab === 'knowledge' }" @click="tab = 'knowledge'">📚 {{ $t('knowledgeMgr') }}</button>
        <button :class="{ active: tab === 'admin' }" @click="tab = 'admin'">👤 {{ $t('chat.adminTitle') }}</button>
      </nav>
      <main class="app-main">
        <KnowledgeView v-if="tab === 'knowledge'" />
        <AdminChatView v-if="tab === 'admin'" />
      </main>
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
.app-nav {
  display: flex; gap: 4px; padding: 8px 12px;
  background: linear-gradient(135deg, var(--tag-bg, #1677ff), #1677ff 90%, #095ed9);
  flex-shrink: 0;
  -webkit-app-region: no-drag;
}
.app-nav button {
  -webkit-app-region: no-drag;
  padding: 6px 16px; border: none; border-radius: 6px;
  background: rgba(255,255,255,0.15); color: #fff; cursor: pointer;
  font-size: 13px; transition: background 0.2s;
}
.app-nav button.active { background: rgba(255,255,255,0.35); font-weight: 600; }
.app-nav button:hover { background: rgba(255,255,255,0.25); }
.app-main { flex: 1; overflow: hidden; }
</style>