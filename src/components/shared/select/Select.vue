<template>
  <a-select
    v-bind="cleanAttrs"
    v-model:value="modelValue"
    :mode="mode"
    :options="displayOptions"
    :filter-option="false"
    option-label-prop="label"
    :dropdown-match-select-width="false"
    show-search
    :placeholder="placeholder"
    @search="onSearch"
    @popupScroll="handleScroll"
    @dropdownVisibleChange="resetToInitial"
  >
    <template #option="{ value, label }">
      <a-checkbox v-if="mode === 'multiple'" :checked="isChecked(value)" v-variant="'small'" />
      {{ label }}
    </template>
  </a-select>
</template>

<script setup>
import { ref, computed, watch, useAttrs } from 'vue';
import filterSelectOption from '@/utils/form/filterSelectOption';

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String
  },
  placeholder: {
    type: String,
    default: '請選擇'
  }
});

const modelValue = defineModel('value', { default: () => [] });

/* --------------------------------------------
   處理 HTML attributes
--------------------------------------------- */

const attrs = useAttrs();
const cleanAttrs = computed(() => {
  const { _options, _mode, ...res } = attrs;
  return res;
});

/* --------------------------------------------
   顯示的選項（Lazy Load + 搜尋）
--------------------------------------------- */
const displayOptions = computed(() => (searching.value ? filteredAll.value : visibleOptions.value));

/* --------------------------------------------
   Lazy Load 設定
 --------------------------------------------- */
const FIRST_CHUNK = 100;
const visibleOptions = ref([]);
const loadedCount = ref(0);
const searching = ref(false);
const filteredAll = ref([]);

/* --------------------------------------------
   載入更多選項
--------------------------------------------- */
const loadMore = (size = FIRST_CHUNK) => {
  if (searching.value) return;
  const next = props.options.slice(loadedCount.value, loadedCount.value + size);
  visibleOptions.value.push(...next);
  loadedCount.value += next.length;
};

/* --------------------------------------------
   搜尋與過濾
--------------------------------------------- */
const onSearch = keyword => {
  const text = keyword.trim();
  if (!text) {
    resetToInitial();
    return;
  }
  searching.value = true;
  filteredAll.value = props.options.filter(opt => filterSelectOption(text, opt));
};

/* --------------------------------------------
   下拉收起 → 恢復100筆、清除搜尋狀態
--------------------------------------------- */
const resetToInitial = () => {
  searching.value = false;
  filteredAll.value = [];
  loadedCount.value = 0;
  visibleOptions.value = [];

  requestAnimationFrame(() => {
    loadMore(FIRST_CHUNK);

    // 把已選取的項目補回 visibleOptions（避免 label 消失）
    const selectedMap = new Map(props.options.map(o => [o.value, o]));
    const selected = (Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value])
      .map(v => selectedMap.get(v))
      .filter(Boolean);

    // 避免重複再加（用 Map 處理也可以）
    const exists = new Set(visibleOptions.value.map(o => o.value));
    selected.forEach(opt => {
      if (!exists.has(opt.value)) {
        visibleOptions.value.push(opt);
      }
    });
  });
};

/* --------------------------------------------
   滾動載入更多
--------------------------------------------- */
const handleScroll = e => {
  if (searching.value) return;
  const el = e.target;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) loadMore(FIRST_CHUNK);
};

/* --------------------------------------------
   方法：選取控制
--------------------------------------------- */
const isChecked = v => Array.isArray(modelValue.value) && modelValue.value.includes(v);

/* --------------------------------------------
   初始化
--------------------------------------------- */
watch(() => props.options, resetToInitial, { immediate: true });

/* --------------------------------------------
   當選值後恢復初始狀態（僅限多選 + 正在搜尋）
--------------------------------------------- */
watch(modelValue, () => {
  if (props.mode === 'multiple' && searching.value) {
    resetToInitial();
  }
});
</script>
