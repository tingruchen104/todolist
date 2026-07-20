<template>
  <a-select
    ref="selectRef"
    v-bind="cleanAttrs"
    :value="selectedLabel || undefined"
    :open="isOpen"
    :show-search="false"
    :placeholder="placeholder"
    class="cascader-select"
    popup-class-name="cascader-dropdown !min-w-auto !p-0"
    @click="isOpen = true"
    @blur="handleBlur"
  >
    <template #dropdownRender="{ props }">
      <div ref="dropdownRef" class="flex items-stretch justify-center" v-bind="props">
        <template v-for="(menu, index) in menus" :key="index">
          <div class="border-secondary flex flex-col border-r last:border-r-0">
            <!-- 搜尋框（只出現在最後一層） -->

            <template v-if="index === optionDepth - 1">
              <div class="p-1 !pb-0">
                <a-input v-model:value="searchQuery" ref="searchInputRef" class="!border-base">
                  <template #prefix>
                    <i class="jb_icon_search text-quaternary text-sm" />
                  </template>
                </a-input>
              </div>
            </template>

            <!-- 單層選單 -->
            <a-menu
              mode="vertical"
              :selectedKeys="[selectedPath[index]]"
              class="max-h-46 overflow-y-auto !py-1"
              @scroll="e => handleScroll(e, index)"
              @click="e => handleMenuClick(e, index)"
            >
              <!-- 有選項 -->
              <template v-if="getFilteredMenu(menu, index).length > 0">
                <a-menu-item
                  v-for="item in getFilteredMenu(menu, index)"
                  :key="item.value"
                  class="group relative !my-0 !px-3 !py-1.5 !leading-[1.5rem]"
                  :class="{
                    '!pr-1.5': item.children !== undefined,
                    'is-hovered bg-text-hover': expandedPath[index] === item.value
                  }"
                  @mouseenter="
                    expandTrigger === 'hover' && item.children !== undefined
                      ? handleHoverKey(item.value, index)
                      : null
                  "
                >
                  <!-- 父層（有 children 或空陣列） -->
                  <template v-if="item.children !== undefined">
                    <span
                      class="group-hover:text-primary group-[.is-hovered]:text-primary transition-color inline-block duration-300 group-[.ant-menu-item-selected]:font-bold"
                    >
                      {{ item.label }}
                    </span>
                    <span
                      class="anticon anticon-right group-hover:after:text-primary group-[.is-hovered]:after:text-primary group-[.ant-menu-item-selected]:after:text-primary ml-1 inline-block"
                    />
                  </template>

                  <!-- 葉節點 -->
                  <template v-else>
                    <span
                      class="group-hover:text-primary transition-color block w-full duration-300 group-[.ant-menu-item-selected]:font-bold"
                      :title="item.description || item.label"
                    >
                      {{ item.label }}
                    </span>
                  </template>
                </a-menu-item>
              </template>

              <!-- 無任何項目 -->
              <template v-else>
                <a-empty description="暫無資料" />
              </template>
            </a-menu>
          </div>
        </template>
      </div>
    </template>
  </a-select>
</template>

<script setup>
import { computed, ref, useAttrs, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Form } from 'ant-design-vue';
import filterSelectOption from '@/utils/form/filterSelectOption';

/* =========================================================
   Props & Emits
========================================================= */
const props = defineProps({
  /** 選單結構資料 */
  options: { type: Array, default: () => [] },
  /** 展開觸發方式：hover 或 click */
  expandTrigger: { type: String, default: 'click' },
  /** 自動展開第一個父層 */
  autoExpandFirst: { type: Boolean, default: true },
  /** 傳出物件的 key 名稱（例如 ['Category', 'Field']） */
  emitKeys: { type: Array, default: () => [] },
  /** 是否顯示完整階層 label（false �則只顯示最後一層） */
  showFullLabel: { type: Boolean, default: false },
  /** 預設 placeholder */
  placeholder: { type: String, default: '請選擇' }
});

/* =========================================================
   States
========================================================= */
const modelValue = defineModel('value'); // 傳出陣列
const isOpen = ref(false);
const selectRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const searchQuery = ref('');
const selectedPath = ref([]); // 真正選中的路徑
const expandedPath = ref([]); // hover 或 click 展開層級
const FIRST_CHUNK = 100; // lazy load 每次增加的筆數
const loadedCountMap = ref({}); // lazy load 記錄每層已載入筆數

/* =========================================================
   Computed
========================================================= */

const formItemContext = Form.useInjectFormItemContext();

/* =========================================================
   清理 attrs
========================================================= */
const attrs = useAttrs();
const cleanAttrs = computed(() => {
  const { _options, ...rest } = attrs;
  return rest;
});

/* =========================================================
   層級展開邏輯（支援 children: [] 顯示空層）
========================================================= */
const optionDepth = computed(() => {
  const getDepth = list => {
    if (!Array.isArray(list) || list.length === 0) return 0;
    return 1 + Math.max(...list.map(i => getDepth(i.children || [])));
  };
  return getDepth(props.options);
});

/* =========================================================
   依據 activePath 決定顯示哪些層級的選單
========================================================= */
const menus = computed(() => {
  const levels = [];
  let current = props.options;
  for (const val of expandedPath.value) {
    levels.push(current);
    const found = current.find(i => i.value === val);
    if (!found || found.children === undefined) return levels;
    current = found.children;
  }
  levels.push(current);
  return levels;
});

/* =========================================================
   Hover 展開
========================================================= */
let hoverTimer = null;
const handleHoverKey = (key, levelIndex) => {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (expandedPath.value[levelIndex] !== key) {
      expandedPath.value = expandedPath.value.slice(0, levelIndex);
      expandedPath.value.push(key);
      searchQuery.value = '';
      loadedCountMap.value[levelIndex + 1] = FIRST_CHUNK;
      resetScroll();
    }
  }, 150);
};

/* =========================================================
   點擊事件：更新 value 並 emit 組合物件
========================================================= */
const handleMenuClick = (e, levelIndex) => {
  const key = e.key;
  const menu = menus.value[levelIndex];
  const item = menu.find(i => i.value === key);
  if (!item) return;

  // 父層 → 僅展開
  if (item.children !== undefined) {
    if (props.expandTrigger === 'click') {
      e.domEvent.stopPropagation();
      expandedPath.value = expandedPath.value.slice(0, levelIndex);
      expandedPath.value.push(key);
      searchQuery.value = '';
      loadedCountMap.value[levelIndex + 1] = FIRST_CHUNK;
      resetScroll();
    }
    return;
  }

  // 葉節點 → 更新 selectedPath 和 v-model
  selectedPath.value = [...expandedPath.value.slice(0, levelIndex), key];
  modelValue.value = [...selectedPath.value];

  // 觸發 Form.Item 驗證（trigger: 'change'）
  formItemContext?.onFieldChange?.();

  // 關閉下拉
  isOpen.value = false;

  setTimeout(() => {
    document.querySelector('.cascader-select')?.classList.remove('ant-select-focused');
    searchQuery.value = '';
  }, 300);
};

/* =========================================================
   Blur 驗證
========================================================= */
const handleBlur = () => {
  isOpen.value = false;
  formItemContext?.onFieldBlur?.();
};

/* ========================================================
   恢復滾動位置 & Lazy
======================================================== */
const resetScroll = () => {
  dropdownRef.value?.querySelectorAll('.ant-menu')?.forEach(el => (el.scrollTop = 0));
};
const resetLazy = () => {
  loadedCountMap.value = {};
  resetScroll();
};

/* =========================================================
   搜尋邏輯（僅最底層支援模糊搜尋）
========================================================= */
const getFilteredMenu = (menu, index) => {
  if (index === menus.value.length - 1 && searchQuery.value) {
    return menu.filter(i => filterSelectOption(searchQuery.value, i));
  }
  const loaded = loadedCountMap.value[index] ?? FIRST_CHUNK;
  return menu.slice(0, loaded);
};
/* =========================================================
   解析選取完整階層的路徑
========================================================= */
const selectedNodes = computed(() => {
  if (!Array.isArray(modelValue.value) || modelValue.value.length === 0) return [];

  const nodes = [];

  const walk = (list, index = 0) => {
    const val = modelValue.value[index];
    const found = list.find(i => i.value === val);
    if (!found) return;

    nodes.push(found);

    if (found.children && index + 1 < modelValue.value.length) {
      walk(found.children, index + 1);
    }
  };

  walk(props.options);

  return nodes;
});

/* =========================================================
  選取的 Label 顯示（顯示完整階層 label）
========================================================= */
const selectedLabel = computed(() => {
  const nodes = selectedNodes.value;
  if (nodes.length === 0) return '';

  const labels = nodes.map(n => n.label);
  return props.showFullLabel ? labels.join(' / ') : labels.at(-1) || '';
});

/* =========================================================
  選取的 Title 顯示（顯示完整階層 title）
========================================================= */
const selectedTitle = computed(() => {
  const nodes = selectedNodes.value;
  if (nodes.length === 0) return '';

  const titles = nodes.map(n => n.description || n.label);

  return props.showFullLabel ? titles.join(' / ') : titles.at(-1) || '';
});

/* =========================================================
   滾動載入更多
========================================================= */
const handleScroll = (e, level) => {
  const menu = menus.value[level] || [];
  const loaded = loadedCountMap.value[level] ?? FIRST_CHUNK;
  if (loaded >= menu.length) return;
  if (e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 20)
    loadedCountMap.value[level] = loaded + FIRST_CHUNK;
};

/* =========================================================
   外部 v-model 改變時自動同步 selectedPath
========================================================= */
watch(
  modelValue,
  v => {
    if (!v || !Array.isArray(v)) return;
    selectedPath.value = [...v];
    expandedPath.value = [...v];
    resetLazy();
  },
  { immediate: true }
);

/* =========================================================
   Dropdown 開關監控
========================================================= */
watch(isOpen, async val => {
  if (val) {
    const hasValidSelectedPath =
      Array.isArray(selectedPath.value) &&
      selectedPath.value.some(v => v !== null && v !== undefined);

    if (hasValidSelectedPath) {
      expandedPath.value = [...selectedPath.value];
    } else if (props.autoExpandFirst) {
      const first = props.options[0]?.value;
      if (first) expandedPath.value = [first];
    }
  } else {
    searchQuery.value = '';
    resetLazy();
  }
  await nextTick();
  if (val) searchInputRef.value?.focus?.();
});

/* =========================================================
  a-select 選中項目預設以 value 當 title，這裡改顯示完整階層的 title
========================================================= */
watch(
  selectedTitle,
  async () => {
    await nextTick();

    const root = selectRef.value?.$el;
    if (!root) return;

    const el = root.querySelector('.ant-select-selection-item');
    if (!el) return;

    const title = selectedTitle.value || '';
    if (!title) el.removeAttribute('title');
    else el.setAttribute('title', title);
  },
  { immediate: true }
);

/* =========================================================
   點擊外部關閉
========================================================= */
const handleClickOutside = e => {
  const dropdownEl = dropdownRef.value;
  const triggerEl = e.target.closest('.ant-select');
  const clickedInsideDropdown = dropdownEl?.contains(e.target);
  if (!clickedInsideDropdown && !triggerEl) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style>
.cascader-dropdown {
  .ant-menu {
    @apply !border-none;
  }
  .ant-menu-title-content {
    @apply flex items-center justify-between;
  }
}
</style>
