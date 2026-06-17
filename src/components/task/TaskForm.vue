<template>
  <BaseModal :visible="visible" :title="task ? '編輯任務' : '新增任務'" @close="$emit('cancel')">
    <form class="form" @submit.prevent="submit">
      <BaseInput
        v-model="form.title"
        label="任務名稱"
        placeholder="輸入任務名稱"
        required
        autofocus
      />

      <div class="form-field">
        <label class="form-label">描述（選填）</label>
        <textarea
          v-model="form.description"
          class="textarea"
          placeholder="補充說明…"
          rows="3"
        />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label class="form-label">截止日</label>
          <input v-model="form.dueDate" type="datetime-local" class="input-native" />
        </div>

        <div class="form-field">
          <label class="form-label">優先級</label>
          <select v-model="form.priority" class="select-native">
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div class="form-field">
        <label class="form-label">清單</label>
        <select v-model="form.listId" class="select-native">
          <option v-for="list in listStore.active" :key="list.id" :value="list.id">
            {{ list.name }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <BaseButton type="button" variant="secondary" @click="$emit('cancel')">取消</BaseButton>
        <BaseButton type="submit" variant="primary" :disabled="!form.title.trim()">
          {{ task ? '儲存' : '新增' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useListStore } from '@/stores/listStore'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  visible: { type: Boolean, required: true },
  task: { type: Object, default: null },
  defaultListId: { type: String, default: 'inbox' }
})

const emit = defineEmits(['submit', 'cancel'])

const listStore = useListStore()

const form = reactive({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  listId: 'inbox'
})

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    if (props.task) {
      form.title = props.task.title
      form.description = props.task.description || ''
      form.dueDate = props.task.dueDate ? toLocalDatetime(props.task.dueDate) : ''
      form.priority = props.task.priority
      form.listId = props.task.listId
    } else {
      form.title = ''
      form.description = ''
      form.dueDate = ''
      form.priority = 'medium'
      form.listId = props.defaultListId
    }
  }
)

function toLocalDatetime(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function submit() {
  if (!form.title.trim()) return
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    priority: form.priority,
    listId: form.listId
  })
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: var(--space-md); }

.form-row { display: flex; gap: var(--space-md); }
.form-row .form-field { flex: 1; }

.form-field { display: flex; flex-direction: column; gap: var(--space-xs); }

.form-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }

.textarea {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
}
.textarea:focus { outline: none; border-color: var(--color-primary); }

.input-native, .select-native {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  width: 100%;
}
.input-native:focus, .select-native:focus { outline: none; border-color: var(--color-primary); }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}
</style>
