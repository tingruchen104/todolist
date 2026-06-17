<template>
  <div :class="['list-item', { 'list-item--active': active }]">
    <span class="list-dot" :style="{ backgroundColor: list.color }" />

    <template v-if="editing">
      <input
        ref="editInput"
        v-model="editName"
        class="list-edit-input"
        @keydown.enter="submitRename"
        @keydown.escape="cancelEdit"
        @blur="cancelEdit"
      />
    </template>
    <span v-else class="list-name" @click="$emit('select', list.id)">{{ list.name }}</span>

    <div class="list-actions">
      <button v-if="!list.archived" class="action-btn" aria-label="重新命名" @click.stop="startEdit">✎</button>
      <button
        v-if="list.archived"
        class="action-btn"
        aria-label="取消封存"
        @click.stop="$emit('unarchive', list.id)"
      >↩</button>
      <button
        v-if="!list.archived && list.id !== 'inbox'"
        class="action-btn"
        aria-label="封存"
        @click.stop="$emit('archive', list.id)"
      >📦</button>
      <button
        v-if="list.id !== 'inbox'"
        class="action-btn action-btn--danger"
        aria-label="刪除清單"
        @click.stop="$emit('delete', list.id)"
      >🗑</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  list: { type: Object, required: true },
  active: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'rename', 'delete', 'archive', 'unarchive'])

const editing = ref(false)
const editName = ref('')
const editInput = ref(null)

async function startEdit() {
  editName.value = props.list.name
  editing.value = true
  await nextTick()
  editInput.value?.focus()
  editInput.value?.select()
}

function submitRename() {
  if (editName.value.trim() && editName.value.trim() !== props.list.name) {
    emit('rename', props.list.id, editName.value.trim())
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
</script>

<style scoped>
.list-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.list-item:hover { background-color: var(--color-surface-overlay); }
.list-item--active { background-color: var(--color-surface-overlay); }

.list-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-edit-input {
  flex: 1;
  font-size: 14px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-xs);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  min-width: 0;
}

.list-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.list-item:hover .list-actions { opacity: 1; }

.action-btn {
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.action-btn:hover { color: var(--color-text); }
.action-btn--danger:hover { color: var(--color-error); }
</style>
