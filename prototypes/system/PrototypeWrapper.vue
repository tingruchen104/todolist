<template>
  <div class="prototype-wrapper">
    <component :is="page" v-if="page" />
    <p class="prototype-not-found" v-else>找不到 prototype：{{ name }}</p>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, provide } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const name = computed(() => route.params.name);
const prototypeInitialState = computed(() => {
  const state = Array.isArray(route.query.state) ? route.query.state[0] : route.query.state;
  return state || "normal";
});
provide("prototypeInitialState", prototypeInitialState);

const pages = import.meta.glob("/prototypes/views/*/index.vue");
const page = computed(() => {
  const loader = pages[`/prototypes/views/${name.value}/index.vue`];
  return loader ? defineAsyncComponent(loader) : null;
});
</script>

<style scoped>
.prototype-wrapper {
  min-height: 100vh;
}

.prototype-not-found {
  font-size: 1rem;
  line-height: 1.5;
  color: #a3acb5;
  padding: 2rem 3rem;
}
</style>
