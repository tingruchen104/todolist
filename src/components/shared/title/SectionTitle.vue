<template>
  <section v-if="$slots.hint" class="flex items-end justify-start">
    <h2 :class="h2Class">
      <slot />
    </h2>
    <p class="text-quaternary ml-2 inline-block text-xs">
      <slot name="hint" />
    </p>
  </section>
  <h2 v-else :class="h2Class" class="mb-2">
    <slot />
  </h2>
</template>

<script setup>
const h2Class = 'm-0 inline-block text-primary border-primary border-b-2 text-2xl font-bold';
</script>
