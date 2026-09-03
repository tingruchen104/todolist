<template>
  <!-- 共用 select：分段載入選項、複選以 checkbox 呈現，可附帶筆數 -->
  <a-select
    v-bind="selectAttrs"
    v-model:value="modelValue"
    :mode="mode"
    :options="displayOptions"
    option-label-prop="label"
    :dropdown-match-select-width="false"
    :placeholder="placeholder"
    @popupScroll="handleScroll"
    @dropdownVisibleChange="resetToInitial"
  >
    <!-- 選項內容：左側為 label，右側為 extra（如符合筆數） -->
    <template #option="option">
      <span class="flex w-full items-center justify-between gap-6">
        <span class="flex items-center gap-2 truncate">
          <a-checkbox
            v-if="mode === 'multiple'"
            :checked="isChecked(option.value)"
            v-variant="'small'"
          />
          {{ option.extra === undefined ? option.label : option.rawLabel }}
        </span>

        <span
          v-if="option.extra !== undefined"
          class="text-xs font-light tabular-nums"
          :class="isChecked(option.value) ? 'text-primary' : 'text-quaternary'"
        >
          {{ option.extra }}
        </span>
      </span>
    </template>
  </a-select>
</template>

<script setup>
import { computed, h, onBeforeUnmount, ref, useAttrs, watch } from 'vue';

// Utils
import filterSelectOption from '@/utils/form/filterSelectOption';

// 選項可能上千筆，非搜尋狀態只分批渲染。
const FIRST_CHUNK = 100;

defineOptions({ inheritAttrs: false });

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 選項清單；項目可帶 extra 作為右側附註 */
  options: {
    type: Array,
    default: () => []
  },
  /** 傳入 multiple 時為複選，選項前顯示 checkbox */
  mode: {
    type: String
  },
  placeholder: {
    type: String,
    default: '請選擇'
  },
  /** 是否啟用搜尋；選項少或需保留完整選取文字時可關閉 */
  showSearch: {
    type: Boolean,
    default: true
  }
});

const modelValue = defineModel('value', { default: () => [] });

/* --------------------------------------------
   選項資料
--------------------------------------------- */
const attrs = useAttrs();

/** 有 extra 的選項在已選 label 附上筆數，下拉內容仍保留原始文字排版。 */
const sourceOptions = computed(() =>
  props.options.map(option =>
    option.extra === undefined
      ? option
      : {
          ...option,
          rawLabel: option.label,
          label: h('span', [option.label, h('span', { class: 'font-light' }, ` (${option.extra})`)])
        }
  )
);

/* --------------------------------------------
   分段載入與搜尋
--------------------------------------------- */
const visibleOptions = ref([]);
const loadedCount = ref(0);
const searching = ref(false);
const filteredAll = ref([]);
let resetFrame = null;

const displayOptions = computed(() => (searching.value ? filteredAll.value : visibleOptions.value));

/** 非搜尋狀態依批次附加選項。 */
const loadMore = (size = FIRST_CHUNK) => {
  if (searching.value) return;

  const next = sourceOptions.value.slice(loadedCount.value, loadedCount.value + size);
  visibleOptions.value.push(...next);
  loadedCount.value += next.length;
};

/** 搜尋時改為顯示全部命中選項；清空關鍵字時回到分批清單。 */
const handleSearch = keyword => {
  attrs.onSearch?.(keyword);

  const text = keyword.trim();
  if (!text) {
    resetToInitial();
    return;
  }

  searching.value = true;

  filteredAll.value = sourceOptions.value.filter(option =>
    filterSelectOption(text, { ...option, label: option.rawLabel ?? option.label })
  );
};

/** 接管搜尋 attrs，其他 a-select attributes 與 listeners 原樣轉傳。 */
const selectAttrs = computed(() => {
  const {
    filterOption: _filterOption,
    onSearch: _onSearch,
    showSearch: _showSearch,
    ...attributes
  } = attrs;

  return {
    ...attributes,
    filterOption: false,
    showSearch: props.showSearch,
    ...(props.showSearch && { onSearch: handleSearch })
  };
});

/** 重設分段載入，並補回不在首批中的已選選項。 */
const resetToInitial = () => {
  searching.value = false;
  filteredAll.value = [];
  loadedCount.value = 0;
  visibleOptions.value = [];

  // 避開下拉開關的同一個 render tick，並補回首批之外的已選選項。
  cancelAnimationFrame(resetFrame);
  resetFrame = requestAnimationFrame(() => {
    loadMore(FIRST_CHUNK);

    const optionByValue = new Map(sourceOptions.value.map(option => [option.value, option]));
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

/** 複選與單選模式共用的選取狀態判斷。 */
const isChecked = value =>
  Array.isArray(modelValue.value) ? modelValue.value.includes(value) : modelValue.value === value;

/* --------------------------------------------
   選項來源與搜尋狀態同步
   - options 變動時重建首批清單並補回已選項目
   - 複選搜尋中選值後回到完整清單，讓已選項目保持可見
--------------------------------------------- */
watch(sourceOptions, resetToInitial, { immediate: true });

watch(modelValue, () => {
  if (props.mode === 'multiple' && searching.value) {
    resetToInitial();
  }
});

onBeforeUnmount(() => cancelAnimationFrame(resetFrame));
</script>
