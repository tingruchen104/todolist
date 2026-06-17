<template>
  <div :class="['task-item', { 'task-item--done': task.completed }]">
    <!-- 主列 -->
    <div class="task-main">
      <input
        type="checkbox"
        :checked="task.completed"
        class="task-checkbox"
        :aria-label="`完成：${task.title}`"
        @change="$emit('toggle', task.id)"
      />
      <div class="task-content" @click="toggleExpand">
        <div class="task-header">
          <span class="task-title">{{ task.title }}</span>
          <div class="task-meta">
            <PriorityBadge :priority="task.priority" />
            <span v-if="task.dueDate" :class="['task-due', { 'task-due--overdue': isOverdue(task.dueDate) && !task.completed }]">
              {{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>
        <p v-if="task.description" class="task-desc">{{ task.description }}</p>
        <div v-if="task.subTasks.length" class="task-sub-progress">
          {{ completedSubCount }}/{{ task.subTasks.length }} 子任務
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn" aria-label="編輯" @click.stop="$emit('edit', task)">✎</button>
        <button class="action-btn action-btn--danger" aria-label="刪除" @click.stop="$emit('delete', task.id)">🗑</button>
      </div>
    </div>

    <!-- 展開區：子任務 -->
    <div v-if="expanded" class="task-expanded">
      <div class="sub-list">
        <TaskSubItem
          v-for="sub in task.subTasks"
          :key="sub.id"
          :sub-task="sub"
          @toggle="$emit('toggle-sub', task.id, $event)"
          @delete="$emit('delete-sub', task.id, $event)"
        />
      </div>
      <form class="sub-add-form" @submit.prevent="submitSubTask">
        <input
          v-model="newSubTitle"
          class="sub-add-input"
          placeholder="新增子任務…"
        />
        <button type="submit" class="sub-add-btn" :disabled="!newSubTitle.trim()">＋</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PriorityBadge from '@/components/common/PriorityBadge.vue'
import TaskSubItem from './TaskSubItem.vue'
import { formatDate, isOverdue } from '@/utils/dateUtils'

const props = defineProps({
  task: { type: Object, required: true }
})

const emit = defineEmits(['toggle', 'edit', 'delete', 'toggle-sub', 'delete-sub', 'add-sub'])

const expanded = ref(false)
const newSubTitle = ref('')

const completedSubCount = computed(() => props.task.subTasks.filter((s) => s.completed).length)

function toggleExpand() {
  expanded.value = !expanded.value
}

function submitSubTask() {
  if (!newSubTitle.value.trim()) return
  emit('add-sub', props.task.id, newSubTitle.value.trim())
  newSubTitle.value = ''
}
</script>

<style scoped>
.task-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  transition: box-shadow var(--transition-fast);
}

.task-item:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.task-item--done { opacity: 0.55; }

.task-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
}

.task-checkbox {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.task-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.task-item--done .task-title { text-decoration: line-through; }

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.task-due {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.task-due--overdue { color: var(--color-error); font-weight: 500; }

.task-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
  white-space: pre-wrap;
}

.task-sub-progress {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.task-actions {
  display: flex;
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}

.task-item:hover .task-actions { opacity: 1; }

.action-btn {
  font-size: 15px;
  color: var(--color-text-secondary);
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.action-btn:hover { color: var(--color-text); }
.action-btn--danger:hover { color: var(--color-error); }

/* 展開區 */
.task-expanded {
  padding: 0 var(--space-md) var(--space-md) calc(var(--space-md) + 26px);
  border-top: 1px solid var(--color-border);
}

.sub-list { padding-top: var(--space-sm); }

.sub-add-form {
  display: flex;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
}

.sub-add-input {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: transparent;
  color: var(--color-text);
}
.sub-add-input:focus { outline: none; border-color: var(--color-primary); border-style: solid; }

.sub-add-btn {
  font-size: 16px;
  color: var(--color-primary);
  padding: 0 var(--space-sm);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}
.sub-add-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
