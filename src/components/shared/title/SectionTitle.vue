<template>
  <section class="flex min-w-0 items-center">
    <a-typography-title :level="2" class="!mr-3">
      <slot />
    </a-typography-title>

    <span v-if="$slots.subTitle" class="text-quaternary shrink-0 text-sm">
      <slot name="subTitle" />
    </span>
  </section>
</template>
