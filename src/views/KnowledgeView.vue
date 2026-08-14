<template>
  <div class="knowledge-view">
    <KnowledgeUpload :active-tab="activeTab" />
  </div>
</template>

<script setup lang="ts">
import KnowledgeUpload from '@/views/KnowledgeUpload.vue'

defineProps<{ activeTab: string }>()
</script>

<style scoped>
.knowledge-view {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fd;
}
</style>
