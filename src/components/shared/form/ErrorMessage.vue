<template>
  <transition name="slide-down">
    <p v-if="errorMessage" class="text-error mt-1 mb-2 text-sm">
      {{ errorMessage }}
    </p>
  </transition>
</template>

<script setup>
defineProps({
  errorMessage: { type: String }
});
</script>

<style scoped>
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
  transform: translateY(-6px);
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 40px; /* 足夠包住你的文字高度 */
}
</style>
