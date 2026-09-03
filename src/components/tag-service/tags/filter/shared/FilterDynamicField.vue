<template>
  <a-form-item
    v-if="hasValueField"
    :name="formItemName"
    :rules="resolvedRules"
    :data-component-type="resolvedComponentType"
    class="filter-dynamic-field"
  >
    <!-- 動態欄位：元件類型、props 與驗證規則皆由後端的欄位設定決定 -->
    <component
      v-if="resolvedComponent && operator"
      :is="resolvedComponent"
      :key="componentKey"
      v-variant="variant"
      class="filter-dynamic-field__control"
      :value="displayValue"
      v-bind="resolvedProps"
      :disabled="disabled"
      :status="hasExpiredValue ? 'error' : undefined"
      @update:value="handleValueChange"
      @click="handleClick"
    />

    <!-- 未提供元件設定時的停用狀態 -->
    <Select
      v-else
      v-model:value="modelValue"
      v-variant="variant"
      :show-search="false"
      placeholder="－"
      disabled
    />
  </a-form-item>
  <div v-else />
</template>

<script setup>
import { computed, markRaw, nextTick, ref, shallowRef, watch } from 'vue';
import dayjs from 'dayjs';

// Components
import Select from '@/components/shared/select/Select.vue';

// Store
import { useReferencedTagsStore } from '@/pages/tag-service/stores/tags/filter/entity/referencedTags';

// Composables
import { useFormController } from '@/pages/tag-service/composables/tags/filter/useFormController';

// Constants
import {
  FIELD_COMPONENT,
  QUERY_OPERATORS,
  FIELD_COMPONENT_MAP,
  FIELD_COMPONENT_DATE_TYPES,
  FIELD_COMPONENT_SOURCE,
  FIELD_COMPONENT_RULES,
  FIELD_COMPONENT_DEFAULTS,
  FIELD_COMPONENT_PROPS
} from '@/pages/tag-service/constants/tags/filter/shared/fieldComponentConfig';
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 目前比較運算子，決定單值、區間或不需輸入 */
  operator: String,
  /** 選定欄位的設定，包含 component、operators 與 source */
  filterOptions: Object,
  variant: String,
  disabled: Boolean,
  /** 外層是否完成初始化；完成前不可清除 API 帶入值 */
  isInitialized: { type: Boolean, default: false },
  /** 失效值顯示時附加的文字前綴 */
  expiredLabelPrefix: { type: String, default: '' }
});

const emit = defineEmits(['ensure-value-in-options']);
const modelValue = defineModel('value', { type: [String, Number, Object, null] });
const modelValues = defineModel('values', { type: Array, default: null });

/* --------------------------------------------
   動態元件狀態
   - 單值使用 value，多值與區間使用 values，兩者互斥
   - 元件類型切換時以 componentKey 強制 remount，避免沿用前一元件的內部狀態
--------------------------------------------- */
const referencedTagsStore = useReferencedTagsStore();
const resolvedComponent = shallowRef(null);
const resolvedComponentType = ref('');
const resolvedProps = ref({});
const resolvedRules = ref([]);
const previousComponentType = ref('');
const componentKey = ref('');

const hasValueField = computed(
  () => props.operator !== QUERY_OPERATORS.IS_NULL && props.operator !== QUERY_OPERATORS.IS_NOT_NULL
);

/** 區間型元件與複選元件都使用 values 欄位。 */
const isMultiSelect = computed(() => {
  const type = resolvedComponentType.value;
  return type?.includes('_range_') || resolvedProps.value?.mode === 'multiple';
});

/** 依單值／多值模式組出正確的 FormItem name path。 */
const formItemName = computed(() => [
  ...props.namePrefix,
  isMultiSelect.value ? FILTER_FIELD.VALUES : FILTER_FIELD.VALUE
]);

const { validateSelf, clearValidate } = useFormController(formItemName);

/** 對外維持單一值介面，內部依元件型別分派至 value 或 values。 */
const internalValue = computed({
  get() {
    return modelValue.value ?? modelValues.value;
  },
  set(value) {
    if (Array.isArray(value)) {
      modelValues.value = value;
      modelValue.value = null;
      return;
    }

    modelValue.value = value;
    modelValues.value = null;
  }
});

const isCategory = computed(
  () => props.filterOptions?.source?.type === FIELD_COMPONENT_SOURCE.CATEGORY
);

/** 區間運算子將單值元件映射成對應的 range 元件。 */
const resolveComponentType = () => {
  const componentType = props.filterOptions?.component;
  const isRangeOperator =
    props.operator === QUERY_OPERATORS.BETWEEN || props.operator === QUERY_OPERATORS.DATE_BETWEEN;

  if (isRangeOperator) {
    switch (componentType) {
      case FIELD_COMPONENT.DATE_PICKER:
        return FIELD_COMPONENT.DATE_RANGE_PICKER;
      case FIELD_COMPONENT.MONTH_PICKER:
        return FIELD_COMPONENT.MONTH_RANGE_PICKER;
      case FIELD_COMPONENT.NUMBER_INPUT:
        return FIELD_COMPONENT.NUMBER_RANGE_INPUT;
      default:
        break;
    }
  }

  return componentType;
};

/** 清除目前動態元件契約；無值運算子可同時清空 value／values。 */
const resetComponent = ({ clearValue = false } = {}) => {
  resolvedComponent.value = null;
  resolvedComponentType.value = '';
  previousComponentType.value = '';
  resolvedProps.value = {};
  resolvedRules.value = [];
  componentKey.value = '';

  if (clearValue) {
    modelValue.value = null;
    modelValues.value = null;
  }
};

/** 依欄位設定與 operator 建立元件、props、rules 與預設值。 */
const initializeComponent = async () => {
  if (!props.operator || !props.filterOptions?.component) {
    resetComponent();
    return;
  }

  if (!hasValueField.value) {
    resetComponent({ clearValue: true });
    clearValidate();
    return;
  }

  resolvedComponentType.value = resolveComponentType();

  let componentProps = {
    ...(FIELD_COMPONENT_PROPS[resolvedComponentType.value] ?? {})
  };

  if (props.filterOptions?.source) {
    componentProps.options = props.filterOptions.source.enum || [];
    componentProps = await ensureValueInOptions(componentProps);
  }

  const shouldRemount = resolvedComponentType.value !== previousComponentType.value;
  if (shouldRemount) {
    previousComponentType.value = resolvedComponentType.value;

    const hasValue = modelValue.value !== null && modelValue.value !== undefined;
    const hasValues = Array.isArray(modelValues.value) && modelValues.value.length > 0;
    if (props.isInitialized && !hasValue && !hasValues) {
      internalValue.value = FIELD_COMPONENT_DEFAULTS[resolvedComponentType.value];
    }

    resolvedComponent.value = null;
    resolvedProps.value = {};
    await nextTick();

    // AntDV 輸入元件需完成卸載後再建立，避免沿用前一種類型的內部狀態。
    await new Promise(resolve => setTimeout(resolve, 10));

    componentKey.value = `${resolvedComponentType.value}-${Date.now()}`;
    const component = FIELD_COMPONENT_MAP[resolvedComponentType.value];
    resolvedComponent.value = component ? markRaw(component) : null;
  }

  resolvedProps.value = componentProps;
  resolvedRules.value = FIELD_COMPONENT_RULES[resolvedComponentType.value] ?? [];
  clearValidate();
};

/* --------------------------------------------
   日期顯示值與 API wire value 互轉
--------------------------------------------- */
/** 將 API 的 YYYYMM／YYYYMMDD 字串轉成日期元件需要的 dayjs。 */
const displayValue = computed(() => {
  const value = modelValue.value ?? modelValues.value;
  const type = resolvedComponentType.value;
  if (!FIELD_COMPONENT_DATE_TYPES.includes(type) || !value) return value;

  if (isMultiSelect.value) {
    return value.map(item =>
      item
        ? type === FIELD_COMPONENT.MONTH_RANGE_PICKER
          ? dayjs(item, 'YYYYMM')
          : dayjs(item, 'YYYYMMDD')
        : null
    );
  }

  return type === FIELD_COMPONENT.MONTH_PICKER ? dayjs(value, 'YYYYMM') : dayjs(value, 'YYYYMMDD');
});

/** 將日期元件值轉回 API wire format，其他元件直接同步原值。 */
const handleValueChange = value => {
  const type = resolvedComponentType.value;

  if (FIELD_COMPONENT_DATE_TYPES.includes(type)) {
    if (isMultiSelect.value) {
      internalValue.value = value.map(item =>
        type === FIELD_COMPONENT.MONTH_RANGE_PICKER
          ? dayjs(item).format('YYYYMM')
          : dayjs(item).format('YYYYMMDD')
      );
    } else {
      internalValue.value = value
        ? type === FIELD_COMPONENT.MONTH_PICKER
          ? dayjs(value).format('YYYYMM')
          : dayjs(value).format('YYYYMMDD')
        : null;
    }

    return;
  }

  internalValue.value = value;
};

/* --------------------------------------------
   失效值
   - 值不在 options 內時會被改寫成「(失效) xxx」
   - 有失效值時元件比照驗證錯誤呈現
--------------------------------------------- */
const expiredPrefix = computed(() => `(${props.expiredLabelPrefix}失效) `);

const isExpiredValue = value => typeof value === 'string' && value.startsWith(expiredPrefix.value);

const hasExpiredValue = computed(() => {
  const value = internalValue.value;
  return Array.isArray(value) ? value.some(isExpiredValue) : isExpiredValue(value);
});

/** 將不存在於選項中的值轉成失效顯示，並保留可辨識的原始名稱。 */
const ensureValueInOptions = async componentProps => {
  let value = internalValue.value;
  if (value === null || value === undefined || value === '') return componentProps;

  const options = componentProps.options || [];
  const optionValues = new Set(options.map(option => option.value));

  // 父層會依 options 正規化關聯標籤，下一個 tick 才能取得更新後的值。
  emit('ensure-value-in-options', options);
  await nextTick();
  value = internalValue.value;

  const getExpiredLabel = item =>
    `${expiredPrefix.value}${
      (props.expiredLabelPrefix && referencedTagsStore.referencedTags[item]) || item
    }`;

  const normalizeValue = item => (optionValues.has(item) ? item : getExpiredLabel(item));

  if (!Array.isArray(value)) {
    const nextValue = normalizeValue(value);

    if (nextValue !== value) {
      componentProps.placeholder = nextValue;
    }

    internalValue.value = nextValue;
    return componentProps;
  }

  internalValue.value = value.map(normalizeValue);
  return componentProps;
};

/* --------------------------------------------
   清除失效值與開啟分類選擇器
--------------------------------------------- */
/** category source 開啟分類選擇器，其他元件則先清除失效選值。 */
const handleClick = event => {
  if (isCategory.value) return handleCategoryClick(event);
  return handleComponentClick(event);
};

/** 點擊一般元件時移除標記為失效的單值或多值。 */
const handleComponentClick = () => {
  const value = internalValue.value;

  if (Array.isArray(value)) {
    const nextValues = value.filter(item => !isExpiredValue(item));

    if (nextValues.length !== value.length) {
      internalValue.value = nextValues;
    }
    return;
  }

  if (isExpiredValue(value)) {
    internalValue.value = FIELD_COMPONENT_DEFAULTS[resolvedComponentType.value];
    resolvedProps.value = { ...resolvedProps.value, placeholder: '請選擇' };
  }
};

/** 以全域 categoryPicker 編輯分類，完成後同步 options、選值與驗證。 */
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
    onSubmit: async result => {
      const items = result.selectedItems || [];

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

// 欄位設定或運算子變更時重新解析動態元件契約。
watch([() => props.operator, () => props.filterOptions], initializeComponent, { immediate: true });
</script>

<style scoped>
/* 動態欄位尺寸 */
.filter-dynamic-field {
  &[data-component-type='cascading_dropdown'],
  &[data-component-type='multi_select_dropdown'] {
    .filter-dynamic-field__control {
      min-width: 5.5rem;
    }
  }

  &[data-component-type='text_input'],
  &[data-component-type='number_input'],
  &[data-component-type='date_picker'],
  &[data-component-type='yyyymm_input'] {
    .filter-dynamic-field__control {
      min-width: 11.25rem;
    }
  }

  &[data-component-type='number_range_input'] .filter-dynamic-field__control {
    min-width: 15.9rem;
  }

  &[data-component-type='date_range_picker'],
  &[data-component-type='yyyymm_range_picker'] {
    .filter-dynamic-field__control {
      min-width: 17.6rem;
    }
  }
}

/* 失效選項 */
.ant-select:not(.ant-select-disabled) {
  :deep(.ant-select-selection-item[title*='失效) ']),
  :deep(.ant-select-selection-item[data-original-title*='失效) ']) {
    color: var(--color-error) !important;

    :deep(.ant-select-selection-item-remove .anticon) {
      color: var(--color-error-50) !important;

      &:hover {
        color: var(--color-error-40) !important;
      }

      &:active {
        color: var(--color-error-60) !important;
      }
    }
  }

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
