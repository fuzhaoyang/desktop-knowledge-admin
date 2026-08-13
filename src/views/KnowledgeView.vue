<template>
  <div class="knowledge-view">
    <KnowledgeUpload />
  </div>
</template>

<script setup lang="ts">
import KnowledgeUpload from '@/views/KnowledgeUpload.vue'
</script>

<style scoped>
.knowledge-view {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fd;
}
</style>