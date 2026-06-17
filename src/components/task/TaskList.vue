<template>
  <div class="task-list">
    <div class="list-toolbar">
      <span class="task-count">{{ incomplete.length }} 筆待辦</span>
      <select v-model="sortBy" class="sort-select" aria-label="排序方式">
        <option value="createdAt">建立時間</option>
        <option value="dueDate">截止日</option>
        <option value="priority">優先級</option>
      </select>
    </div>

    <!-- 未完成 -->
    <div class="section">
      <EmptyState
        v-if="!incomplete.length"
        icon="✅"
        title="所有任務都完成了！"
        description="點擊右上角 ＋ 新增任務"
      />
      <TransitionGroup v-else name="task" tag="div" class="task-items">
        <TaskItem
          v-for="task in sortedIncomplete"
          :key="task.id"
          :task="task"
          @toggle="taskOps.toggleTask"
          @edit="$emit('edit-task', $event)"
          @delete="confirmDelete($event)"
          @toggle-sub="taskOps.toggleSubTask"
          @delete-sub="taskOps.deleteSubTask"
          @add-sub="taskOps.addSubTask"
        />
      </TransitionGroup>
    </div>

    <!-- 已完成 -->
    <div v-if="completed.length" class="section section--completed">
      <button class="section-toggle" @click="showCompleted = !showCompleted">
        <span>已完成（{{ completed.length }}）</span>
        <span>{{ showCompleted ? '▲' : '▼' }}</span>
      </button>
      <div v-if="showCompleted" class="task-items">
        <TaskItem
          v-for="task in completed"
          :key="task.id"
          :task="task"
          @toggle="taskOps.toggleTask"
          @edit="$emit('edit-task', $event)"
          @delete="confirmDelete($event)"
          @toggle-sub="taskOps.toggleSubTask"
          @delete-sub="taskOps.deleteSubTask"
          @add-sub="taskOps.addSubTask"
        />
      </div>
    </div>

    <ConfirmDialog
      :visible="!!deleteTargetId"
      message="確定要刪除這筆任務嗎？此動作無法復原。"
      @confirm="doDelete"
      @cancel="deleteTargetId = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useTask } from '@/composables/useTask'
import { useSearch } from '@/composables/useSearch'
import { useSort } from '@/composables/useSort'
import TaskItem from './TaskItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const props = defineProps({
  listId: { type: String, required: true },
  searchQuery: { type: String, default: '' }
})

defineEmits(['edit-task'])

const taskStore = useTaskStore()
const taskOps = useTask()
const showCompleted = ref(false)
const deleteTargetId = ref(null)

const listTasks = computed(() => taskStore.byList(props.listId))

const { filtered } = useSearch(listTasks)

// 同步外部 searchQuery 到 composable 內部 query
const externalQuery = computed(() => props.searchQuery)
const searchFiltered = computed(() => {
  if (!props.searchQuery.trim()) return listTasks.value
  const q = props.searchQuery.toLowerCase()
  return listTasks.value.filter(
    (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
  )
})

const incomplete = computed(() => searchFiltered.value.filter((t) => !t.completed))
const completed = computed(() => searchFiltered.value.filter((t) => t.completed))

const { sortBy, sorted: sortedIncomplete } = useSort(incomplete)

function confirmDelete(id) {
  deleteTargetId.value = id
}

function doDelete() {
  taskOps.deleteTask(deleteTargetId.value)
  deleteTargetId.value = null
}
</script>

<style scoped>
.task-list { display: flex; flex-direction: column; gap: var(--space-md); }

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-sm);
}

.task-count { font-size: 13px; color: var(--color-text-secondary); }

.sort-select {
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px var(--space-sm);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.section { display: flex; flex-direction: column; gap: var(--space-sm); }
.section--completed { margin-top: var(--space-sm); }

.section-toggle {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-sm);
}

.task-items { display: flex; flex-direction: column; gap: var(--space-sm); }

.task-enter-active, .task-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}
.task-enter-from { opacity: 0; transform: translateY(-8px); }
.task-leave-to { opacity: 0; transform: translateY(8px); }
</style>
