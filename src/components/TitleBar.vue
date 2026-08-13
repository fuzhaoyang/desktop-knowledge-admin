<template>
  <div class="titlebar">
    <div class="titlebar-drag" />
    <div class="titlebar-controls">
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
function onClose() { window.electronAPI?.window?.close() }
</script>

<style scoped>
.titlebar {
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: #f5f7fd;
}
.titlebar-drag { flex: 1; height: 100%; -webkit-app-region: drag; }
.titlebar-controls { display: flex; height: 100%; -webkit-app-region: no-drag; }
.tb-btn {
  width: 46px; height: 100%;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; color: #555;
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.tb-btn:hover { background: var(--tag-bg, #1677ff); color: #fff; }
.tb-close:hover { background: #e8494e; color: #fff; }
</style>
