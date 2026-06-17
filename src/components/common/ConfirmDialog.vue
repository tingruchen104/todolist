<template>
  <BaseModal :visible="visible" title="確認刪除" @close="$emit('cancel')">
    <p class="message">{{ message }}</p>
    <div class="actions">
      <BaseButton variant="secondary" @click="$emit('cancel')">取消</BaseButton>
      <BaseButton variant="danger" @click="$emit('confirm')">刪除</BaseButton>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  visible: { type: Boolean, required: true },
  message: { type: String, default: '確定要刪除嗎？此動作無法復原。' }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.message {
  color: var(--color-text-secondary);
  font-size: 14px;
  margin-bottom: var(--space-lg);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}
</style>
