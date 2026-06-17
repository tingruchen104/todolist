<template>
  <div class="sub-item">
    <input
      type="checkbox"
      :checked="subTask.completed"
      class="sub-checkbox"
      :aria-label="subTask.title"
      @change="$emit('toggle', subTask.id)"
    />
    <span :class="['sub-title', { 'sub-title--done': subTask.completed }]">{{ subTask.title }}</span>
    <button class="sub-delete" aria-label="刪除子任務" @click="$emit('delete', subTask.id)">✕</button>
  </div>
</template>

<script setup>
defineProps({
  subTask: { type: Object, required: true }
})

defineEmits(['toggle', 'delete'])
</script>

<style scoped>
.sub-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
}

.sub-checkbox {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.sub-title {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.sub-title--done {
  text-decoration: line-through;
  opacity: 0.5;
}

.sub-delete {
  opacity: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.sub-item:hover .sub-delete { opacity: 1; }
</style>
