<template>
  <div class="titlebar">
    <div class="titlebar-drag" />
    <div class="titlebar-controls">
      <button class="tb-btn tb-theme" :title="theme === 'dark' ? '切换浅色' : '切换深色'" @click="toggleTheme">
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      </button>
      <button class="tb-btn" title="全屏" @click="onFullscreen">
        <svg viewBox="0 0 10 10" width="10" height="10">
          <path d="M0 0 H4 M0 0 V4 M0 0 L3 3" stroke="currentColor" stroke-width="1" fill="none" />
          <path d="M10 0 H6 M10 0 V4 M10 0 L7 3" stroke="currentColor" stroke-width="1" fill="none" />
          <path d="M0 10 H4 M0 10 V6 M0 10 L3 7" stroke="currentColor" stroke-width="1" fill="none" />
          <path d="M10 10 H6 M10 10 V6 M10 10 L7 7" stroke="currentColor" stroke-width="1" fill="none" />
        </svg>
      </button>
      <button class="tb-btn" title="最小化" @click="onMin">
        <svg viewBox="0 0 10 10" width="10" height="10"><path d="M0 5 H10" stroke="currentColor" stroke-width="1" /></svg>
      </button>
      <button class="tb-btn" :title="isMaximized ? '还原' : '最大化'" @click="onMaxToggle">
        <svg v-if="isMaximized" viewBox="0 0 10 10" width="10" height="10">
          <rect x="0.5" y="2.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
          <rect x="2.5" y="0.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
        <svg v-else viewBox="0 0 10 10" width="10" height="10">
          <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
      </button>
      <button class="tb-btn tb-close" title="关闭" @click="onClose">
        <svg viewBox="0 0 10 10" width="10" height="10"><path d="M0 0 L10 10 M10 0 L0 10" stroke="currentColor" stroke-width="1" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { theme, toggleTheme } from '../theme'

const isMaximized = ref(false)
let off: (() => void) | null = null

onMounted(() => {
  off = window.electronAPI?.window?.onMaximizeChange((v: boolean) => {
    isMaximized.value = v
  }) ?? null
})

onBeforeUnmount(() => off?.())

function onMin() { window.electronAPI?.window?.minimize() }
function onMaxToggle() { window.electronAPI?.window?.maximizeToggle() }
function onFullscreen() { window.electronAPI?.window?.fullscreenToggle() }
function onClose() { window.electronAPI?.window?.close() }
</script>

<style scoped>
.titlebar {
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: var(--bg);
}
.titlebar-drag { flex: 1; height: 100%; -webkit-app-region: drag; }
.titlebar-controls { display: flex; height: 100%; -webkit-app-region: no-drag; }
.tb-btn {
  width: 46px; height: 100%;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: var(--muted);
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.tb-btn:hover { background: var(--accent); color: #fff; }
.tb-close:hover { background: var(--bad); color: #fff; }
</style>
