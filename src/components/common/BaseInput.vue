<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
      v-bind="$attrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue'])

const inputId = computed(() => `input-${Math.random().toString(36).slice(2, 7)}`)
</script>

<style scoped>
.input-wrapper { display: flex; flex-direction: column; gap: var(--space-xs); }

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  transition: border-color var(--transition-fast);
  width: 100%;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
