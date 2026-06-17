<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  disabled: { type: Boolean, default: false }
})
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: background-color var(--transition-fast), opacity var(--transition-fast);
  white-space: nowrap;
}

.btn--primary {
  background-color: var(--color-primary);
  color: #fff;
}
.btn--primary:hover { background-color: var(--color-primary-hover); }

.btn--secondary {
  background-color: var(--color-surface-overlay);
  color: var(--color-text);
}
.btn--secondary:hover { background-color: var(--color-border); }

.btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
.btn--ghost:hover {
  background-color: var(--color-surface-overlay);
  color: var(--color-text);
}

.btn--danger {
  background-color: var(--color-error);
  color: #fff;
}
.btn--danger:hover { opacity: 0.85; }

.btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
