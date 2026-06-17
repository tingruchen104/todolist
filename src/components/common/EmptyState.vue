<template>
  <div class="empty">
    <div class="empty-icon">{{ icon }}</div>
    <p class="empty-title">{{ title }}</p>
    <p v-if="description" class="empty-desc">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📋' },
  title: { type: String, default: '沒有任務' },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-md);
  gap: var(--space-sm);
  text-align: center;
}

.empty-icon { font-size: 48px; }
.empty-title { font-size: 15px; font-weight: 500; color: var(--color-text); }
.empty-desc { font-size: 13px; color: var(--color-text-secondary); }
</style>
