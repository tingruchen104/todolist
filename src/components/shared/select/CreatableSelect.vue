<template>
  <a-select
    v-bind="cleanAttrs"
    v-model:value="modelValue"
    :mode="mode"
    :options="displayOptions"
    :filter-option="false"
    option-label-prop="label"
    show-search
    :placeholder="placeholder"
    @search="onSearch"
    @popupScroll="handleScroll"
    @dropdownVisibleChange="resetToInitial"
    :dropdown-match-select-width="false"
  >
    <template #option="{ value, label }">
      <a-checkbox v-if="mode === 'multiple'" :checked="isChecked(value)" v-variant="'small'" />
      {{ label }}
    </template>

    <!-- 套用 Lazy 但保留可新增區塊 -->
    <template #dropdownRender="{ menuNode }">
      <component :is="menuNode" />
      <!-- 顯示新增按鈕：搜尋有值、尚未存在、且仍有過濾結果 -->
      <button
        v-if="shouldShowAddButton && displayOptions.length > 0"
        class="ant-select-item ant-select-item-option hover:bg-text-hover active:bg-spotlight group w-full cursor-pointer text-left"
        :class="{ 'ant-select-item-option-disabled !bg-disabled': errorMessage }"
        @click="handleAdd"
      >
        <div class="ant-select-item-option-content text-label group-hover:text-primary">
          <i class="jb_icon_add size-5 text-xs" />
          新增「<b>{{ searchValue }}</b
          >」
        </div>
        <p class="!text-error-40 px-3 py-1.5">{{ errorMessage }}</p>
      </button>
    </template>

    <!-- 找不到時仍可新增 -->
    <template #notFoundContent>
      <button
        v-if="shouldShowAddButton"
        class="ant-select-item ant-select-item-option hover:bg-text-hover active:bg-spotlight group w-full cursor-pointer text-left"
        :class="{ 'ant-select-item-option-disabled !bg-disabled': errorMessage }"
        @click="handleAdd"
      >
        <div class="ant-select-item-option-content text-label group-hover:text-primary">
          <i class="jb_icon_add size-5 text-xs" />
          新增「<b>{{ searchValue }}</b
          >」
        </div>
        <p class="!text-error-40 px-3 py-1.5">{{ errorMessage }}</p>
      </button>
    </template>
  </a-select>
</template>

<script setup>
import { ref, computed, useAttrs, watch } from 'vue';
import filterSelectOption from '@/utils/form/filterSelectOption';
import validateRules from '@/utils/form/validateRules';

/* --------------------------------------------
   Props 與 Model
--------------------------------------------- */
const props = defineProps({
  options: { type: Array, default: () => [] },
  addRules: { type: Array },
  mode: { type: String },
  placeholder: { type: String, default: '請選擇' }
});
const modelValue = defineModel('value');
const emit = defineEmits(['update:options']);

/* --------------------------------------------
   處理 HTML attributes
--------------------------------------------- */
const attrs = useAttrs();
const cleanAttrs = computed(() => {
  const { _options, _mode, ...rest } = attrs;
  return rest;
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
   搜尋 — 全資料搜尋，不被 lazy 限制
--------------------------------------------- */
const searchValue = ref('');
const errorMessage = ref('');

const onSearch = async keyword => {
  searchValue.value = keyword?.trim();

  errorMessage.value = await validateRules(props.addRules, searchValue.value);

  if (!searchValue.value) return resetToInitial();

  searching.value = true;
  filteredAll.value = props.options.filter(opt => filterSelectOption(searchValue.value, opt));
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
   新增選項邏輯
--------------------------------------------- */
const shouldShowAddButton = computed(() => {
  const val = searchValue.value;
  if (!val) return false;

  // 判斷 label 或 value 是否已存在
  return !props.options.some(opt => opt.label === val || opt.value === val);
});

/* --------------------------------------------
   處理新增選項
--------------------------------------------- */
const handleAdd = async () => {
  if (errorMessage.value) return;
  const add = { label: searchValue.value, value: searchValue.value };
  emit('update:options', [...props.options, add]);
  modelValue.value = searchValue.value;
  searchValue.value = '';
  document.activeElement?.blur();
};

/* --------------------------------------------
   判斷已選取
--------------------------------------------- */
const isChecked = v => Array.isArray(modelValue.value) && modelValue.value.includes(v);

/* --------------------------------------------
   options 改變時，重置 lazy
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
