<script>
// 這支頁面的預覽狀態（給 PrototypeIndex 列連結）
export const states = [
  { value: 'normal', label: '正常' },
  { value: 'empty', label: '無資料' }
];
</script>

<script setup>
import { inject, reactive, ref } from 'vue';
import { Modal } from 'ant-design-vue';

import SectionTitle from '@/components/shared/title/SectionTitle.vue';
import RULES from '@/utils/form/validationRules';

const viewState = inject('prototypeInitialState', 'normal');

/* --------------------------------------------
   假資料（依預覽狀態決定初始清單）
--------------------------------------------- */
const SAMPLE_TODOS = [
  { id: 1, title: '回覆客戶信件', date: '2026-07-21', done: false },
  { id: 2, title: '整理會議紀錄', date: '2026-07-17', done: true },
  { id: 3, title: '預約下週部門會議', date: '2026-07-24', done: false }
];

const todos = ref(viewState === 'empty' ? [] : [...SAMPLE_TODOS]);
let nextId = SAMPLE_TODOS.length + 1;

/* --------------------------------------------
   新增待辦
--------------------------------------------- */
const formRef = ref(null);
const form = reactive({ title: '', date: null });

const titleRules = [RULES.requiredText('請輸入待辦事項'), RULES.maxLength(50)];
const dateRules = [RULES.requiredSelect('請選擇日期')];

const handleAdd = () => {
  todos.value.push({ id: nextId++, title: form.title.trim(), date: form.date, done: false });
  form.title = '';
  form.date = null;
  formRef.value.resetFields();
};

/* --------------------------------------------
   編輯待辦（單列切換為編輯狀態，一次編輯一筆）
--------------------------------------------- */
const editingId = ref(null);
const editForm = reactive({ title: '', date: null });

const startEdit = todo => {
  editingId.value = todo.id;
  editForm.title = todo.title;
  editForm.date = todo.date;
};

const handleEditSave = () => {
  const todo = todos.value.find(item => item.id === editingId.value);
  todo.title = editForm.title.trim();
  todo.date = editForm.date;
  editingId.value = null;
};

const cancelEdit = () => {
  editingId.value = null;
};

/* --------------------------------------------
   刪除待辦（破壞性操作，二次確認）
--------------------------------------------- */
const confirmDelete = todo => {
  Modal.confirm({
    title: '確定要刪除這筆待辦事項嗎？',
    content: todo.title,
    okText: '刪除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk() {
      todos.value = todos.value.filter(item => item.id !== todo.id);
    }
  });
};
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <SectionTitle>簡易待辦清單</SectionTitle>

    <div class="bg-background flex flex-col gap-4 rounded p-4 shadow">
      <a-form ref="formRef" :model="form" @finish="handleAdd">
        <div class="flex items-start gap-2">
          <a-form-item name="title" :rules="titleRules" class="flex-1">
            <a-input v-model:value="form.title" placeholder="請輸入待辦事項" />
          </a-form-item>
          <a-form-item name="date" :rules="dateRules">
            <a-date-picker
              v-model:value="form.date"
              value-format="YYYY-MM-DD"
              placeholder="請選擇日期"
            />
          </a-form-item>
          <a-button v-variant="'primary'" type="primary" html-type="submit">新增</a-button>
        </div>
      </a-form>

      <a-empty v-if="todos.length === 0" description="暫無資料" />

      <ul v-else class="flex flex-col">
        <li
          v-for="todo in todos"
          :key="todo.id"
          class="border-base flex items-center gap-3 border-b py-2 last:border-b-0"
        >
          <a-form
            v-if="editingId === todo.id"
            :model="editForm"
            class="flex-1"
            @finish="handleEditSave"
          >
            <div class="flex items-start gap-2">
              <a-form-item name="title" :rules="titleRules" class="flex-1">
                <a-input v-model:value="editForm.title" placeholder="請輸入待辦事項" />
              </a-form-item>
              <a-form-item name="date" :rules="dateRules">
                <a-date-picker
                  v-model:value="editForm.date"
                  value-format="YYYY-MM-DD"
                  placeholder="請選擇日期"
                />
              </a-form-item>
              <a-button v-variant="'primary'" type="primary" html-type="submit">儲存</a-button>
              <a-button @click="cancelEdit">取消</a-button>
            </div>
          </a-form>
          <template v-else>
            <a-checkbox v-model:checked="todo.done" />
            <span
              class="min-w-0 flex-1 truncate"
              :class="todo.done ? 'text-tertiary line-through' : 'text-heading'"
              :title="todo.title"
            >
              {{ todo.title }}
            </span>
            <span class="shrink-0 text-sm" :class="todo.done ? 'text-tertiary' : 'text-secondary'">
              {{ todo.date }}
            </span>
            <a-button size="small" @click="startEdit(todo)">編輯</a-button>
            <a-button v-variant="'error'" size="small" @click="confirmDelete(todo)">刪除</a-button>
          </template>
        </li>
      </ul>
    </div>
  </main>
</template>
