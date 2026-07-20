<template>
  <div class="p-6">
    <h1 class="mb-4 text-xl font-bold">Prototype 列表</h1>

    <div v-if="items.length === 0" class="text-label py-8">目前沒有任何 prototype</div>

    <ul v-else class="flex flex-col gap-3">
      <li v-for="item in items" :key="item.name" class="border-base rounded border p-4">
        <div class="flex flex-wrap items-center gap-3">
          <RouterLink
            :to="`/${item.name}`"
            class="font-bold underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ item.name }}
          </RouterLink>
          <RouterLink
            v-if="item.hasFlow"
            :to="`/flow/${item.name}`"
            class="text-label text-sm underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            操作流程
          </RouterLink>
        </div>

        <div v-if="item.states.length" class="mt-2 flex flex-wrap gap-3">
          <RouterLink
            v-for="s in item.states"
            :key="s.value"
            :to="`/${item.name}?state=${s.value}`"
            class="text-label text-sm underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ s.label }}
          </RouterLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';

// 頁面未宣告 states 時沿用的預設狀態
const DEFAULT_STATES = [
  { value: 'normal', label: '正常' },
  { value: 'loading', label: '載入中' },
  { value: 'empty', label: '無資料' },
  { value: 'error', label: 'API 錯誤' }
];

// 自動列出所有 prototype 畫面（每個畫面一個資料夾），讀取各頁以 `export const states`
// 宣告的資料狀態，並標記是否附操作流程文件（flow.md）。
const modules = import.meta.glob('/prototypes/views/*/index.vue', { eager: true });
const flowDocs = import.meta.glob('/prototypes/views/*/flow.md');

const flowNames = new Set(
  Object.keys(flowDocs)
    .map(key => key.match(/\/prototypes\/views\/(.+)\/flow\.md$/)?.[1])
    .filter(Boolean)
);

const items = Object.entries(modules)
  .map(([key, mod]) => {
    const name = key.match(/\/prototypes\/views\/(.+)\/index\.vue$/)?.[1];
    if (!name) return null;
    return { name, states: mod.states ?? DEFAULT_STATES, hasFlow: flowNames.has(name) };
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));
</script>
