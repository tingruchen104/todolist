<template>
  <BaseModal :visible="visible" title="管理清單" @close="$emit('close')">
    <div class="panel">
      <!-- 新增清單 -->
      <form class="add-form" @submit.prevent="submitAdd">
        <div class="add-row">
          <input
            v-model="newName"
            class="add-input"
            placeholder="新清單名稱…"
            maxlength="30"
          />
          <input v-model="newColor" type="color" class="color-picker" title="選擇顏色" />
          <BaseButton type="submit" variant="primary" :disabled="!newName.trim()">新增</BaseButton>
        </div>
      </form>

      <!-- 作用中清單 -->
      <div class="section">
        <p class="section-label">清單</p>
        <ListItem
          v-for="list in listStore.active"
          :key="list.id"
          :list="list"
          :active="currentListId === list.id"
          @select="$emit('select-list', $event)"
          @rename="listOps.renameList"
          @delete="confirmDelete($event)"
          @archive="listOps.archiveList"
          @unarchive="listOps.unarchiveList"
        />
      </div>

      <!-- 封存清單 -->
      <div v-if="listStore.archived.length" class="section">
        <p class="section-label">已封存</p>
        <ListItem
          v-for="list in listStore.archived"
          :key="list.id"
          :list="list"
          :active="currentListId === list.id"
          @select="$emit('select-list', $event)"
          @rename="listOps.renameList"
          @delete="confirmDelete($event)"
          @archive="listOps.archiveList"
          @unarchive="listOps.unarchiveList"
        />
      </div>
    </div>

    <ConfirmDialog
      :visible="!!deleteTargetId"
      message="刪除清單將同時刪除其中所有任務，確定繼續？"
      @confirm="doDelete"
      @cancel="deleteTargetId = null"
    />
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useList } from '@/composables/useList'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ListItem from './ListItem.vue'

defineProps({
  visible: { type: Boolean, required: true },
  currentListId: { type: String, default: 'inbox' }
})

defineEmits(['close', 'select-list'])

const listStore = useListStore()
const listOps = useList()

const newName = ref('')
const newColor = ref('#6b7280')
const deleteTargetId = ref(null)

function submitAdd() {
  if (!newName.value.trim()) return
  listOps.addList(newName.value.trim(), newColor.value)
  newName.value = ''
  newColor.value = '#6b7280'
}

function confirmDelete(id) {
  deleteTargetId.value = id
}

function doDelete() {
  listOps.deleteList(deleteTargetId.value)
  deleteTargetId.value = null
}
</script>

<style scoped>
.panel { display: flex; flex-direction: column; gap: var(--space-lg); }

.add-form {}

.add-row {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.add-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  min-width: 0;
}
.add-input:focus { outline: none; border-color: var(--color-primary); }

.color-picker {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-sm);
  padding: 2px;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
}

.section { display: flex; flex-direction: column; gap: 2px; }

.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
}
</style>
