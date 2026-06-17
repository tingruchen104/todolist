<template>
  <span :class="['badge', `badge--${priority}`]">{{ labels[priority] }}</span>
</template>

<script setup>
defineProps({
  priority: { type: String, default: 'medium' } // high | medium | low
})

const labels = { high: '高', medium: '中', low: '低' }
</script>

<style scoped>
.badge {
  display: inline-block;
  padding: 1px var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
}

.badge--high { background-color: #fef2f2; color: var(--color-priority-high); }
.badge--medium { background-color: #fffbeb; color: var(--color-priority-medium); }
.badge--low { background-color: #f9fafb; color: var(--color-priority-low); }

@media (prefers-color-scheme: dark) {
  .badge--high { background-color: rgba(239,68,68,0.15); }
  .badge--medium { background-color: rgba(245,158,11,0.15); }
  .badge--low { background-color: rgba(107,114,128,0.15); }
}
</style>
