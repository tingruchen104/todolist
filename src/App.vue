<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-link">跳至主要內容</a>
    <AppHeader
      :current-list-name="currentListName"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @add-task="showTaskForm = true"
      @update:search="searchQuery = $event"
    />

    <div class="app-body">
      <AppSidebar
        :open="sidebarOpen"
        :current-list-id="currentListId"
        @select-list="selectList"
        @add-list="showListForm = true"
      />

      <!-- 手機側欄開啟時的背景遮罩 -->
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

      <main id="main-content" class="main-content">
        <TaskList
          :list-id="currentListId"
          :search-query="searchQuery"
          @edit-task="openEditForm"
        />
      </main>
    </div>

    <AppNav
      :current-list-id="currentListId"
      @select-list="selectList"
      @open-all-lists="sidebarOpen = true"
    />

    <TaskForm
      :visible="showTaskForm"
      :task="editingTask"
      :default-list-id="currentListId"
      @submit="handleTaskSubmit"
      @cancel="closeTaskForm"
    />

    <ListPanel
      :visible="showListForm"
      :current-list-id="currentListId"
      @close="showListForm = false"
      @select-list="selectList"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useListStore } from '@/stores/listStore'
import { useTask } from '@/composables/useTask'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNav from '@/components/layout/AppNav.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskForm from '@/components/task/TaskForm.vue'
import ListPanel from '@/components/list/ListPanel.vue'

const taskStore = useTaskStore()
const listStore = useListStore()
const taskOps = useTask()

const currentListId = ref('inbox')
const sidebarOpen = ref(window.innerWidth >= 768)
const showTaskForm = ref(false)
const showListForm = ref(false)
const searchQuery = ref('')
const editingTask = ref(null)

const currentListName = computed(
  () => listStore.lists.find((l) => l.id === currentListId.value)?.name || '收件匣'
)

function selectList(id) {
  currentListId.value = id
  sidebarOpen.value = false
}

function openEditForm(task) {
  editingTask.value = task
  showTaskForm.value = true
}

function closeTaskForm() {
  showTaskForm.value = false
  editingTask.value = null
}

function handleTaskSubmit(payload) {
  if (editingTask.value) {
    taskOps.updateTask(editingTask.value.id, payload)
  } else {
    taskOps.addTask(payload)
  }
  closeTaskForm()
}

onMounted(() => {
  listStore.load()
  taskStore.load()
})
</script>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

/* 手機底部導覽列佔位 */
@media (max-width: 767px) {
  .app-body { padding-bottom: 56px; }
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 767px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 56px 0 56px 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 40;
  }
}

.placeholder {
  color: var(--color-text-secondary);
  font-size: 14px;
  padding: var(--space-md);
}
</style>
