<template>
  <section class="flex items-start justify-start gap-2.5">
    <!-- category + field（cascader 模式） -->
    <a-form-item
      v-if="fieldMode === 'cascader'"
      :name="[...namePrefix, FILTER_FIELD.FIELD]"
      :rules="rules[FILTER_FIELD.FIELD]"
    >
      <SearchableCascader
        variant="outline"
        v-model:value="categoryFieldArray"
        expand-trigger="click"
        :auto-expand-first="true"
        :options="metadataOptions"
        :disabled="disabled"
      />
    </a-form-item>

    <!-- field（select 模式） -->
    <a-form-item
      v-else
      :name="[...namePrefix, FILTER_FIELD.FIELD]"
      :rules="rules[FILTER_FIELD.FIELD]"
    >
      <Select
        v-variant="'outline'"
        v-model:value="fieldValue"
        :options="metadataOptions"
        :disabled="disabled"
        @change="handleSelectField"
      />
    </a-form-item>

    <!-- operator -->
    <a-form-item
      :name="[...namePrefix, FILTER_FIELD.OPERATOR]"
      :rules="rules[FILTER_FIELD.OPERATOR]"
    >
      <Select
        v-variant="'outline'"
        v-model:value="conditionModel[FILTER_FIELD.OPERATOR]"
        :options="filterOptionsModel?.[FILTER_OPTIONS_FIELD.OPERATORS]"
        :placeholder="!isFieldSelected ? '－' : '請選擇'"
        :disabled="!isFieldSelected || disabled"
      />
    </a-form-item>
    <!-- value -->
    <FilterDynamicField
      variant="outline"
      :name-prefix="namePrefix"
      v-model:value="conditionModel[FILTER_FIELD.VALUE]"
      v-model:values="conditionModel[FILTER_FIELD.VALUES]"
      :operator="conditionModel[FILTER_FIELD.OPERATOR]"
      :filterOptions="filterOptionsModel"
      :isInitialized="isInitializedModel"
      :expiredLabelPrefix="expiredLabelPrefix"
      :disabled="
        !(
          filterOptionsModel?.[FILTER_OPTIONS_FIELD.COMPONENT] &&
          conditionModel[FILTER_FIELD.OPERATOR]
        ) || disabled
      "
      @ensure-value-in-options="handleEnsureValueInOptions"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { dequal } from 'dequal';
import isEqual from 'lodash/isEqual';

// Components
import Select from '@/components/shared/select/Select.vue';
import SearchableCascader from '@/components/shared/cascader/SearchableCascader.vue';
import FilterDynamicField from '@/components/tag-service/filter/shared/FilterDynamicField.vue';

// Utils
import RULES from '@/utils/form/validationRules';

// Constants
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/filter/shared/filterField';

/* --------------------------------------------
   Props / Emits
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 父層注入的分類欄位選項 */
  metadataOptions: { type: Array, default: () => [] },
  /** 是否禁用 */
  disabled: Boolean,
  /** 過期標籤前綴 */
  expiredLabelPrefix: { type: String, default: '' },
  /** 第一欄渲染模式：'cascader'（預設）| 'select' */
  fieldMode: { type: String, default: 'cascader' }
});

const emit = defineEmits(['select-field', 'ensure-value-in-options']);

/* --------------------------------------------
   預設值邏輯
   - 確保每個欄位都有初始值，避免 undefined
--------------------------------------------- */

const DEFAULT_FILTER_OPTIONS = {
  [FILTER_OPTIONS_FIELD.CATEGORY]: null,
  [FILTER_OPTIONS_FIELD.FIELD]: null,
  [FILTER_OPTIONS_FIELD.OPERATORS]: [],
  [FILTER_OPTIONS_FIELD.COMPONENT]: null,
  [FILTER_OPTIONS_FIELD.SOURCE]: null
};

const DEFAULT_CONDITION = {
  [FILTER_FIELD.CATEGORY]: null,
  [FILTER_FIELD.FIELD]: null,
  [FILTER_FIELD.OPERATOR]: null,
  [FILTER_FIELD.VALUE]: null,
  [FILTER_FIELD.VALUES]: null
};
const applyDefaultCondition = raw => ({
  ...DEFAULT_CONDITION,
  ...(raw || {})
});

/* --------------------------------------------
   Computed 雙向綁定
   - 讓子層改動直接同步到父層的 formState
   - isInitialized：避免初始化階段重置 operator/value
--------------------------------------------- */
const conditionModel = defineModel('condition', { type: Object });
const filterOptionsModel = defineModel('filter-options', { type: Object });
const isInitializedModel = defineModel('is-initialized', { type: Boolean, default: false });

/* --------------------------------------------
   選項清單
--------------------------------------------- */
const categoryFieldArray = ref([]); // cascader 模式
const fieldValue = ref(null); // select 模式

/* --------------------------------------------
   欄位是否已選取（決定 operator 是否可用）
   - cascader 模式：category + field 都需要有值
   - select 模式：只需要 field 有值
--------------------------------------------- */
const isFieldSelected = computed(() =>
  props.fieldMode === 'select'
    ? !!conditionModel.value?.[FILTER_FIELD.FIELD]
    : !!(
        conditionModel.value?.[FILTER_FIELD.CATEGORY] && conditionModel.value?.[FILTER_FIELD.FIELD]
      )
);

/* --------------------------------------------
   驗證規則
--------------------------------------------- */
const rules = {
  [FILTER_FIELD.FIELD]:
    props.fieldMode === 'select'
      ? [RULES.requiredSelect()]
      : [RULES.requiredCascader(categoryFieldArray)],
  [FILTER_FIELD.OPERATOR]: [RULES.requiredSelect()]
};

/* --------------------------------------------
   選擇欄位後觸發：
   - 更新當前條件（category, field）
   - 通知父層取得篩選器選項
   - reset 由 filterOptionsModel watch 負責（選項真的有變才清）
--------------------------------------------- */
const handleSelectField = async () => {
  const newCategory = props.fieldMode === 'cascader' ? categoryFieldArray.value[0] : undefined;
  const newField = props.fieldMode === 'cascader' ? categoryFieldArray.value[1] : fieldValue.value;

  // category/field 沒有改變 → 不呼叫 API（初始化完成後才判斷）
  if (
    isInitializedModel.value &&
    newCategory === conditionModel.value[FILTER_FIELD.CATEGORY] &&
    newField === conditionModel.value[FILTER_FIELD.FIELD]
  )
    return;

  if (props.fieldMode === 'cascader') {
    conditionModel.value[FILTER_FIELD.CATEGORY] = newCategory;
  }
  conditionModel.value[FILTER_FIELD.FIELD] = newField;

  // 通知父組件取得篩選器選項
  emit('select-field');
};

const handleEnsureValueInOptions = options => {
  emit('ensure-value-in-options', options);
};

/* --------------------------------------------
   外部 v-model 改變 → 合併預設值
   - 避免初始條件物件缺 key 導致後續 watch 錯誤
--------------------------------------------- */
watch(
  () => conditionModel.value,
  next => {
    const normalized = applyDefaultCondition(next);
    if (!dequal(conditionModel.value, normalized)) {
      Object.assign(conditionModel.value, normalized);
    }
  },
  { deep: true }
);

/* --------------------------------------------
   filterOptionsModel 有變 → reset operator / value
   - isInitializedModel 為 false：初始 fetch 結果 → 標記初始化完成，不觸發 reset
   - isInitializedModel 為 true：使用者互動 → 選項有變才 reset
--------------------------------------------- */
watch(
  filterOptionsModel,
  (newVal, oldVal) => {
    if (!isInitializedModel.value) {
      isInitializedModel.value = true;
      return;
    }
    if (isEqual(newVal, oldVal)) return;

    conditionModel.value[FILTER_FIELD.OPERATOR] = null;
    conditionModel.value[FILTER_FIELD.VALUE] = null;
    conditionModel.value[FILTER_FIELD.VALUES] = null;
  },
  { deep: true }
);

/* --------------------------------------------
   當 categoryFieldArray 改變 → 重新載入該欄位的 filter options（cascader 模式）
--------------------------------------------- */
watch(
  categoryFieldArray,
  (newVal, oldVal) => {
    if (props.fieldMode !== 'cascader') return;
    if (!isInitializedModel.value) return;
    if (!newVal || !oldVal) return;

    // 兩層完全相同 → 不需要重新載入
    if (isEqual(newVal, oldVal)) return;

    // 真的有變 → 才呼叫 handleSelectField
    handleSelectField();
  },
  { deep: true }
);

/* --------------------------------------------
   初始化
   - 載入 metadata options（分類欄位結構）
   - 套用預設值
   - 若初始已有 category/field → 自動載入對應設定
--------------------------------------------- */
onMounted(async () => {
  conditionModel.value = applyDefaultCondition(conditionModel.value);

  // 若初始有 category / field，載入對應 operator/value 設定
  const category = conditionModel.value?.[FILTER_FIELD.CATEGORY];
  const field = conditionModel.value?.[FILTER_FIELD.FIELD];

  if (props.fieldMode === 'cascader') {
    categoryFieldArray.value = [category, field];
  } else {
    fieldValue.value = field ?? null;
  }

  await nextTick();
  if (props.fieldMode === 'cascader' ? category && field : field) {
    await handleSelectField();
    // isInitializedModel 由 filterOptionsModel watch 設定（fetch 結果回來時）
  } else {
    isInitializedModel.value = true;
  }
});
</script>
