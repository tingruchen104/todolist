<template>
  <!-- 欄位錯誤訊息，有值才展開 -->
  <transition name="slide-down">
    <p v-if="errorMessage" class="text-error mt-1 mb-2 text-sm">
      {{ errorMessage }}
    </p>
  </transition>
</template>

<script setup>
defineProps({
  /** 錯誤訊息；空字串或未提供時不顯示 */
  errorMessage: { type: String }
});
</script>

<style scoped>
/* max-height 需一併過渡，否則下方內容會在展開時直接跳位。 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    max-height 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-0.375rem);
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 2.5rem;
}
</style>
