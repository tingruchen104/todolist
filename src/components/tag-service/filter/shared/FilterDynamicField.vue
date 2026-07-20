<template>
  <a-form-item
    v-if="operator !== QUERY_OPERATORS.IS_NULL && operator !== QUERY_OPERATORS.IS_NOT_NULL"
    :name="formItemName"
    :rules="resolvedRules"
  >
    <!-- 動態元件 -->
    <component
      v-if="resolvedComponent && operator"
      :is="resolvedComponent"
      :key="componentKey"
      v-variant="variant"
      :value="displayValue"
      v-bind="resolvedProps"
      :disabled="disabled"
      @update:value="handleValueChange"
      @click="handleClick"
    />

    <!-- Fallback：元件不存在時顯示空選單 -->
    <a-select v-else v-variant="variant" v-model:value="modelValue" placeholder="－" disabled />
  </a-form-item>
  <div v-else />
</template>

<script setup>
import { ref, computed, shallowRef, markRaw, watch, nextTick } from 'vue';
import dayjs from 'dayjs';

// composables
import { useFormController } from '@/pages/tag-service/composables/filter/useFormController';

// enum
import {
  FIELD_COMPONENT,
  QUERY_OPERATORS,
  FIELD_COMPONENT_MAP,
  FIELD_COMPONENT_DATE_TYPES,
  FIELD_COMPONENT_SOURCE,
  FIELD_COMPONENT_RULES,
  FIELD_COMPONENT_DEFAULTS,
  FIELD_COMPONENT_PROPS
} from '@/pages/tag-service/constants/filter/shared/fieldComponentConfig';
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';

/* --------------------------------------------
   Props & emit
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 運算子（例如 equals / between） */
  operator: String,
  /** filterOptions */
  filterOptions: Object,
  /** 樣式 */
  variant: String,
  /** 是否禁用整體元件 */
  disabled: Boolean,
  /** 父層初始化完成旗標（由 FilterEntityItem 傳入） */
  isInitialized: { type: Boolean, default: false },
  /** 失效 label 前綴 */
  expiredLabelPrefix: { type: String, default: '' }
});

const emit = defineEmits(['ensure-value-in-options']);

/* --------------------------------------------
   雙向綁定值（Vee-Validate）
   - 單選用 value
   - 多選用 values
--------------------------------------------- */
const modelValue = defineModel('value', { type: [String, Number, Object, null] });
const modelValues = defineModel('values', { type: Array, default: null });

/* --------------------------------------------
   狀態定義 / Store
--------------------------------------------- */
const resolvedComponent = shallowRef(null); // 實際使用的元件（動態載入）
const resolvedComponentType = ref(null); // 元件種類（TextInput / Select / DatePicker...）
const resolvedProps = ref({}); // 動態元件的傳入 Props
const resolvedRules = ref([]); // 動態元件的驗證規則
const prevComponentType = ref(null); // 紀錄前一次的元件種類，用來決定是否需要 remount
const componentKey = ref(''); // 強制 remount 用的 key

/* --------------------------------------------
   是否為多選（含 Range 類型）
--------------------------------------------- */
const isMultiSelect = computed(() => {
  const type = resolvedComponentType.value;
  return type?.includes('_range_') || resolvedProps.value?.mode === 'multiple';
});

/* --------------------------------------------
   formItemName
   - 單選使用 value
   - 多選使用 values
--------------------------------------------- */
const formItemName = computed(() => {
  if (isMultiSelect.value) {
    return [...props.namePrefix, FILTER_FIELD.VALUES];
  }
  return [...props.namePrefix, FILTER_FIELD.VALUE];
});

/* --------------------------------------------
   可直接使用的驗證方法
--------------------------------------------- */
const { validateSelf, clearValidate } = useFormController(formItemName);

/* --------------------------------------------
   internalValue
   - 統一處理單選/多選/tags-category 的邏輯
   - get: 從 modelValue / modelValues 讀值
   - set: 寫回 modelValue / modelValues
--------------------------------------------- */
const internalValue = computed({
  get() {
    return modelValue.value || modelValues.value;
  },
  set(val) {
    // Range / Multiselect / 類目
    if (Array.isArray(val)) {
      modelValues.value = val;
      modelValue.value = null;
      return;
    }

    // 單選, 輸入
    modelValue.value = val;
    modelValues.value = null;
  }
});

/* --------------------------------------------
   類目判斷（一般 Category 與 Tags 類目）
--------------------------------------------- */
const isCategory = computed(
  () => props.filterOptions?.source?.type === FIELD_COMPONENT_SOURCE.CATEGORY
);

/* --------------------------------------------
   初始化元件邏輯（當 operator 或 filterOptions 改變時）
   1. 改 componentType（遇到 between 要轉 Range 類型）
   2. 從 Enum 或 API 載入 options
   3. 判斷是否需要重掛載元件
   4. 設定 props / rules
--------------------------------------------- */
const initialProps = async () => {
  // operator 或 component 不存在 → 重置所有
  if (!props.operator || !props.filterOptions?.component) {
    resolvedComponent.value = null;
    resolvedComponentType.value = '';
    prevComponentType.value = '';
    resolvedProps.value = {};
    resolvedRules.value = [];
    componentKey.value = '';
    return;
  }

  // 基礎 component type
  resolvedComponentType.value = props.filterOptions.component;

  // 運算子若為 between → 改用 Range 類型
  if (
    props.operator === QUERY_OPERATORS.BETWEEN ||
    props.operator === QUERY_OPERATORS.DATE_BETWEEN
  ) {
    switch (props.filterOptions.component) {
      case FIELD_COMPONENT.DATE_PICKER:
        resolvedComponentType.value = FIELD_COMPONENT.DATE_RANGE_PICKER;
        break;
      case FIELD_COMPONENT.MONTH_PICKER:
        resolvedComponentType.value = FIELD_COMPONENT.MONTH_RANGE_PICKER;
        break;
      case FIELD_COMPONENT.NUMBER_INPUT:
        resolvedComponentType.value = FIELD_COMPONENT.NUMBER_RANGE_INPUT;
        break;
      default:
        break;
    }
  }

  // 如果 operator 是 空值、不是空值 → 不需要元件
  if (
    props.operator === QUERY_OPERATORS.IS_NULL ||
    props.operator === QUERY_OPERATORS.IS_NOT_NULL
  ) {
    resolvedComponent.value = null;
    resolvedComponentType.value = '';
    resolvedProps.value = {};
    resolvedRules.value = [];

    // 清除綁定值
    modelValue.value = null;
    modelValues.value = null;
  }

  // 取得 baseProps（元件 props）
  let baseProps = FIELD_COMPONENT_PROPS[resolvedComponentType.value];

  if (props.filterOptions.source) {
    baseProps = { ...baseProps, options: props.filterOptions.source?.enum || [] };
    baseProps = await ensureValueInOptions(baseProps);
  }

  // 決定是否需要強制 remount（避免元件殘留狀態）
  const shouldRemount = resolvedComponentType.value !== prevComponentType.value;
  if (shouldRemount) {
    prevComponentType.value = resolvedComponentType.value;

    // 父層初始化完成後才能 reset 值
    const hasValue = modelValue.value !== null && modelValue.value !== undefined;
    const hasValues = Array.isArray(modelValues.value) && modelValues.value.length > 0;
    if (props.isInitialized && !hasValue && !hasValues) {
      internalValue.value = FIELD_COMPONENT_DEFAULTS[resolvedComponentType.value];
    }

    // 卸載 → 等待 → 再掛載
    resolvedComponent.value = null;
    resolvedProps.value = {};
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 10)); // 等 DOM 確定清掉

    componentKey.value = `${resolvedComponentType.value}-${Date.now()}`;
    resolvedComponent.value = markRaw(FIELD_COMPONENT_MAP[resolvedComponentType.value]);
  }

  // 更新 props / rules
  resolvedProps.value = baseProps;
  resolvedRules.value = FIELD_COMPONENT_RULES[resolvedComponentType.value];
  clearValidate();
};

/* --------------------------------------------
   displayValue
   - 元件顯示層用的值
   - 日期類型轉成 dayjs
--------------------------------------------- */
const displayValue = computed(() => {
  const val = modelValue.value || modelValues.value;
  const type = resolvedComponentType.value;
  if (!FIELD_COMPONENT_DATE_TYPES.includes(type) || !val) return val;

  if (isMultiSelect.value) {
    return val.map(v =>
      v
        ? type === FIELD_COMPONENT.MONTH_RANGE_PICKER
          ? dayjs(v, 'YYYYMM')
          : dayjs(v, 'YYYYMMDD')
        : null
    );
  }

  return type === FIELD_COMPONENT.MONTH_PICKER ? dayjs(val, 'YYYYMM') : dayjs(val, 'YYYYMMDD');
});

/* --------------------------------------------
   handleValueChange
   - 使用者輸入後，統一格式化為 internalValue
   - 日期 → YYYYMMDD
--------------------------------------------- */
const handleValueChange = val => {
  const type = resolvedComponentType.value;
  // 日期 → 字串 YYYYMMDD
  if (FIELD_COMPONENT_DATE_TYPES.includes(type)) {
    if (isMultiSelect.value) {
      internalValue.value = val.map(v =>
        type === FIELD_COMPONENT.MONTH_RANGE_PICKER
          ? dayjs(v).format('YYYYMM')
          : dayjs(v).format('YYYYMMDD')
      );
    } else {
      internalValue.value = val
        ? type === FIELD_COMPONENT.MONTH_PICKER
          ? dayjs(val).format('YYYYMM')
          : dayjs(val).format('YYYYMMDD')
        : null;
    }

    return;
  }

  internalValue.value = val;
};

/* --------------------------------------------
   ensureValueInOptions
   - 確保現在的值存在於 options 內
   - 若不存在 → 顯示成「(失效) xxx」
   - 先通知父層同步 referencedTags，再以更新後的值做正規化
--------------------------------------------- */
const ensureValueInOptions = async baseProps => {
  let value = internalValue.value;
  if (!value) return baseProps;

  const options = baseProps?.options || [];
  const optionsMap = new Map(options.map(opt => [opt.value, opt.label]));

  // 父層可能在 event 裡改寫 value/values；等一個 tick 再讀最新值
  emit('ensure-value-in-options', options);
  await nextTick();
  value = internalValue.value;

  // 產生失效顯示文字
  const getExpiredLabel = v => `(${props.expiredLabelPrefix}失效) ${v}`;

  // 單一 value 正規化
  const normalizeValue = v => {
    return optionsMap.has(v) ? v : getExpiredLabel(v);
  };

  /* ---------- 單選 ---------- */
  if (!Array.isArray(value)) {
    const nextValue = normalizeValue(value);

    // 只有在失效時才更新 placeholder
    if (nextValue !== value) {
      baseProps.placeholder = nextValue;
    }

    internalValue.value = nextValue;
    return baseProps;
  }

  /* ---------- 多選 ---------- */
  internalValue.value = value.map(normalizeValue);

  return baseProps;
};

/* --------------------------------------------
點擊事件
--------------------------------------------- */
const handleClick = e => {
  if (isCategory.value) return handleCategoryClick(e);
  return handleComponentClick(e);
};

/* --------------------------------------------
   handleComponentClick
   - 點擊元件時，若值是「(失效) xxx」→ 清除
   - Tags 類型額外同步 referencedTagsStore
--------------------------------------------- */
const handleComponentClick = () => {
  const val = internalValue.value;
  const expiredPrefix = `(${props.expiredLabelPrefix}失效) `;
  const isExpiredValue = v => typeof v === 'string' && v.startsWith(expiredPrefix);

  /* ---------- 單選 ---------- */
  // 失效值直接清掉
  if (!isMultiSelect.value) {
    if (isExpiredValue(val)) {
      internalValue.value = FIELD_COMPONENT_DEFAULTS[resolvedComponentType.value];
      resolvedProps.value = { ...resolvedProps.value, placeholder: '請選擇' };
    }
    return;
  }

  /* ---------- 多選 ---------- */
  // 移除所有失效值
  if (!Array.isArray(val)) return;
  const nextValues = val.filter(v => !isExpiredValue(v));

  if (nextValues.length !== val.length) {
    internalValue.value = nextValues;
  }
};

/* --------------------------------------------
   handleCategoryClick
   - 類目選單（Category 模式）
   - 開啟 window.categoryPicker，取得選項後建構成 options
--------------------------------------------- */
const handleCategoryClick = () => {
  document.activeElement?.blur();

  if (!window.categoryPicker) {
    alert('window.categoryPicker 未定義');
    return;
  }

  window.categoryPicker.open({
    dataSource: props.filterOptions.source?.category,
    theme: 'customer-theme',
    maxSelectedNumber: 10,
    expandSelectedData: true,
    recommendation: false,
    selectedItems: internalValue.value.map(item => ({ no: item })),
    backdropClose: true,
    onSubmit: async val => {
      const items = val.selectedItems || [];

      const newOptions = items.map(item => ({
        label: item.des,
        value: item.no
      }));

      resolvedProps.value = { ...resolvedProps.value, options: newOptions };
      internalValue.value = items.map(item => item.no);

      await nextTick();
      validateSelf();
    }
  });
};

/* --------------------------------------------
   Watch：operator / filterOptions 改變 → 重新初始化元件
--------------------------------------------- */
watch(
  [() => props.operator, () => props.filterOptions],
  async () => {
    await initialProps();
  },
  { immediate: true }
);
</script>

<style scoped>
/* 「移除 xxx」標籤樣式 */
.ant-select:not(.ant-select-disabled) {
  :deep(.ant-select-selection-item[title*='失效) ']),
  :deep(.ant-select-selection-item[data-original-title*='失效) ']) {
    color: var(--color-error) !important;
    :deep(.ant-select-selection-item-remove .anticon) {
      color: var(--color-error) !important;
      &:hover {
        color: var(--color-error-50) !important;
      }
      &:active {
        color: var(--color-error-70) !important;
      }
    }
  }

  /* 多選 overflow 樣式 */
  :deep(.ant-select-selection-overflow-item) {
    :deep(.ant-select-selection-item[title*='失效) ']),
    :deep(.ant-select-selection-item[data-original-title*='失效) ']) {
      color: var(--color-error) !important;
      border-color: var(--color-error) !important;
      background-color: var(--color-error-10) !important;
    }
  }
}
</style>
