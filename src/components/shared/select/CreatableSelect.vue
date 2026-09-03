<template>
  <!-- 可新增選項的 select：搜尋無結果時提供新增，新增前先跑 addRules 驗證 -->
  <a-select
    v-bind="attrs"
    v-model:value="modelValue"
    :mode="mode"
    :options="displayOptions"
    :filter-option="false"
    option-label-prop="label"
    show-search
    :dropdown-match-select-width="false"
    :placeholder="placeholder"
    @search="handleSearch"
    @popupScroll="handleScroll"
    @dropdownVisibleChange="resetToInitial"
  >
    <!-- 選項內容，複選時前置 checkbox -->
    <template #option="{ value, label }">
      <a-checkbox v-if="mode === 'multiple'" :checked="isChecked(value)" v-variant="'small'" />
      {{ label }}
    </template>

    <!-- 有搜尋結果時，於清單下方附上新增選項 -->
    <template #dropdownRender="{ menuNode }">
      <component :is="menuNode" />

      <!-- 搜尋值尚未存在且通過 addRules 時顯示新增按鈕 -->
      <a-button
        v-if="shouldShowAddButton && displayOptions.length > 0"
        type="text"
        block
        :disabled="Boolean(errorMessage)"
        class="group !h-auto !justify-start !rounded-none !px-3 !py-1.5 !text-left"
        @click="handleAdd"
      >
        <span class="text-label group-hover:text-primary block">
          <i class="jb_icon_add size-5 text-xs" />
          新增「<b>{{ searchValue }}</b
          >」
        </span>
        <span v-if="errorMessage" class="!text-error-40 block py-1.5">
          {{ errorMessage }}
        </span>
      </a-button>
    </template>

    <!-- 無搜尋結果時的新增選項 -->
    <template #notFoundContent>
      <!-- 無搜尋結果時仍可新增通過驗證的搜尋值 -->
      <a-button
        v-if="shouldShowAddButton"
        type="text"
        block
        :disabled="Boolean(errorMessage)"
        class="group !h-auto !justify-start !rounded-none !px-3 !py-1.5 !text-left"
        @click="handleAdd"
      >
        <span class="text-label group-hover:text-primary block">
          <i class="jb_icon_add size-5 text-xs" />
          新增「<b>{{ searchValue }}</b
          >」
        </span>
        <span v-if="errorMessage" class="!text-error-40 block py-1.5">
          {{ errorMessage }}
        </span>
      </a-button>
    </template>
  </a-select>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';

// Utils
import filterSelectOption from '@/utils/form/filterSelectOption';
import validateRules from '@/utils/form/validateRules';

// 選項可能上千筆，非搜尋狀態只分批渲染。
const FIRST_CHUNK = 100;

defineOptions({ inheritAttrs: false });

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 選項清單；新增選項時由 update:options 回傳新清單 */
  options: { type: Array, default: () => [] },
  /** 新增搜尋值前套用的驗證規則，格式同 Ant Design Vue Form rules */
  addRules: { type: Array },
  /** 傳入 multiple 時為複選 */
  mode: { type: String },
  placeholder: { type: String, default: '請選擇' }
});
const modelValue = defineModel('value');
const emit = defineEmits(['update:options']);
const attrs = useAttrs();

/* --------------------------------------------
   選項載入與搜尋
--------------------------------------------- */
const visibleOptions = ref([]);
const loadedCount = ref(0);
const searching = ref(false);
const filteredAll = ref([]);
const searchValue = ref('');
const errorMessage = ref('');
let resetFrame = null;

const displayOptions = computed(() => (searching.value ? filteredAll.value : visibleOptions.value));

/** 非搜尋狀態依批次附加選項。 */
const loadMore = (size = FIRST_CHUNK) => {
  if (searching.value) return;

  const next = props.options.slice(loadedCount.value, loadedCount.value + size);
  visibleOptions.value.push(...next);
  loadedCount.value += next.length;
};

/** 過濾全部選項，並同步驗證搜尋值是否可作為新增選項。 */
const handleSearch = async keyword => {
  searchValue.value = keyword?.trim();
  errorMessage.value = await validateRules(props.addRules, searchValue.value);

  if (!searchValue.value) {
    resetToInitial();
    return;
  }

  searching.value = true;
  filteredAll.value = props.options.filter(option => filterSelectOption(searchValue.value, option));
};

/** 回到分批清單，並補回首批之外的已選項目。 */
const resetToInitial = () => {
  searching.value = false;
  filteredAll.value = [];
  loadedCount.value = 0;
  visibleOptions.value = [];

  // 避開下拉開關的同一個 render tick，並補回首批之外的已選選項。
  cancelAnimationFrame(resetFrame);
  resetFrame = requestAnimationFrame(() => {
    loadMore(FIRST_CHUNK);

    const optionByValue = new Map(props.options.map(option => [option.value, option]));
    const selectedOptions = (
      Array.isArray(modelValue.value) ? modelValue.value : [modelValue.value]
    )
      .map(value => optionByValue.get(value))
      .filter(Boolean);

    const visibleValues = new Set(visibleOptions.value.map(option => option.value));
    selectedOptions.forEach(option => {
      if (!visibleValues.has(option.value)) {
        visibleOptions.value.push(option);
      }
    });
  });
};

/** 非搜尋狀態捲動接近底部時載入下一批選項。 */
const handleScroll = event => {
  if (searching.value) return;

  const listElement = event.target;
  if (listElement.scrollTop + listElement.clientHeight >= listElement.scrollHeight - 20) {
    loadMore(FIRST_CHUNK);
  }
};

/* --------------------------------------------
   判斷並新增搜尋值
   - label 或 value 已存在時不提供重複新增
--------------------------------------------- */
const shouldShowAddButton = computed(() => {
  const value = searchValue.value;
  if (!value) return false;

  return !props.options.some(option => option.label === value || option.value === value);
});

/** 將通過 addRules 的搜尋值加入 options 並立即選取。 */
const handleAdd = () => {
  if (errorMessage.value) return;

  const newOption = { label: searchValue.value, value: searchValue.value };
  emit('update:options', [...props.options, newOption]);
  modelValue.value = searchValue.value;
  searchValue.value = '';
  document.activeElement?.blur();
};

/** 複選模式的 checkbox 是否已選取。 */
const isChecked = value => Array.isArray(modelValue.value) && modelValue.value.includes(value);

/* --------------------------------------------
   選項來源與搜尋狀態同步
   - options 變動時重建首批清單
   - 複選搜尋中選值後回到完整清單，讓已選項目保持可見
--------------------------------------------- */
watch(() => props.options, resetToInitial, { immediate: true });

watch(modelValue, () => {
  if (props.mode === 'multiple' && searching.value) {
    resetToInitial();
  }
});

onBeforeUnmount(() => cancelAnimationFrame(resetFrame));
</script>
