<template>
  <main class="prototype-index">
    <h1>Prototype 列表</h1>
    <p v-if="items.length === 0" class="prototype-empty">目前沒有任何 prototype</p>

    <ul v-else class="prototype-list">
      <li v-for="item in items" :key="item.name">
        <div class="prototype-item-head">
          <RouterLink class="prototype-item-title" :to="`/${item.name}`">
            {{ item.title }}
          </RouterLink>
          <span class="prototype-item-name">{{ item.name }}</span>
        </div>

        <div v-if="item.states.length" class="prototype-item-states">
          <RouterLink
            v-for="state in item.states"
            :key="state.value"
            :to="{ path: `/${item.name}`, query: { state: state.value } }"
          >
            {{ state.label }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { RouterLink } from "vue-router";

const modules = import.meta.glob("/prototypes/views/*/index.vue", { eager: true });
const items = Object.entries(modules)
  .map(([key, module]) => {
    const name = key.match(/\/prototypes\/views\/(.+)\/index\.vue$/)?.[1];
    return {
      name,
      title: module.title ?? name,
      states: module.states ?? [],
    };
  })
  .filter((item) => item.name)
  .sort((a, b) => a.name.localeCompare(b.name));
</script>

<style scoped>
.prototype-index {
  max-width: 960px;
  min-height: 100vh;
  padding: 2rem 3rem;
  font-size: 1rem;
  line-height: 1.5;

  h1 {
    margin-bottom: 0.625rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: #5f6d7e;
  }

  .prototype-list li {
    margin-bottom: 0.625rem;
    padding: 0.75rem 1rem;
    border: 1px solid #d9dde2;
    background-color: #ffffff;
    border-radius: 0.3125rem;
  }

  .prototype-item-head {
    .prototype-item-title {
      font-weight: bold;
      color: #1677ff;
      &:hover {
        color: #4096ff;
      }
    }
    .prototype-item-name {
      font-size: 0.875rem;
      color: #949da7;
      margin-left: 0.5rem;
    }
  }

  .prototype-item-states {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.25rem;

    a {
      font-size: 0.875rem;
      color: #858f99;
      &:hover {
        color: #949da7;
      }
    }
  }

  .prototype-empty {
    color: #a3acb5;
  }
}
</style>
