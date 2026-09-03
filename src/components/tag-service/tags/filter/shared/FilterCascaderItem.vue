<template>
  <!-- 單一條件的三段輸入：欄位、運算子、欄位值 -->
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

    <!-- operator：選項由 field 設定決定，未選 field 前停用 -->
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

    <!-- value / values：輸入元件由 field 設定決定，未選 operator 前停用 -->
    <FilterDynamicField
      variant="outline"
      :name-prefix="namePrefix"
      v-model:value="conditionModel[FILTER_FIELD.VALUE]"
      v-model:values="conditionModel[FILTER_FIELD.VALUES]"
      :operator="conditionModel[FILTER_FIELD.OPERATOR]"
      :filter-options="filterOptionsModel"
      :is-initialized="isInitializedModel"
      :expired-label-prefix="expiredLabelPrefix"
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
import FilterDynamicField from '@/components/tag-service/tags/filter/shared/FilterDynamicField.vue';

// Utils
import RULES from '@/utils/form/validationRules';

// Constants
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/tags/filter/shared/filterField';

/* --------------------------------------------
   條件預設結構
   - 補齊 payload key，避免初始物件缺欄位導致 watcher 或 v-model 讀到 undefined
--------------------------------------------- */
const DEFAULT_CONDITION = {
  [FILTER_FIELD.CATEGORY]: null,
  [FILTER_FIELD.FIELD]: null,
  [FILTER_FIELD.OPERATOR]: null,
  [FILTER_FIELD.VALUE]: null,
  [FILTER_FIELD.VALUES]: null
};

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 父層提供的分類／欄位選項。 */
  metadataOptions: { type: Array, default: () => [] },
  /** 停用欄位、運算子與欄位值。 */
  disabled: Boolean,
  /** 已失效選項的顯示前綴。 */
  expiredLabelPrefix: { type: String, default: '' },
  /** 第一欄渲染模式：cascader 使用 category + field，select 僅使用 field。 */
  fieldMode: { type: String, default: 'cascader' }
});

const emit = defineEmits(['select-field', 'ensure-value-in-options']);

/* --------------------------------------------
   條件與選項 v-model
   - isInitializedModel 區分初始 fetch 與後續使用者互動，避免初始化時清除既有值
--------------------------------------------- */
const conditionModel = defineModel('condition', { type: Object });
const filterOptionsModel = defineModel('filter-options', { type: Object });
const isInitializedModel = defineModel('is-initialized', { type: Boolean, default: false });

/** 將外部條件補成完整 payload key，但保留已有值。 */
const applyDefaultCondition = condition => ({
  ...DEFAULT_CONDITION,
  ...(condition || {})
});

/* --------------------------------------------
   欄位選項
   - cascader 模式以 [category, field] 綁定，select 模式僅綁定 field
--------------------------------------------- */
const categoryFieldArray = ref([]);
const fieldValue = ref(null);

/* --------------------------------------------
   欄位是否已選取
   - cascader 模式需要 category + field，select 模式只需要 field
--------------------------------------------- */
const isFieldSelected = computed(() =>
  props.fieldMode === 'select'
    ? !!conditionModel.value?.[FILTER_FIELD.FIELD]
    : !!(
        conditionModel.value?.[FILTER_FIELD.CATEGORY] && conditionModel.value?.[FILTER_FIELD.FIELD]
      )
);

/* --------------------------------------------
   欄位與運算子驗證規則
--------------------------------------------- */
const rules = {
  [FILTER_FIELD.FIELD]:
    props.fieldMode === 'select'
      ? [RULES.requiredSelect()]
      : [RULES.requiredCascader(categoryFieldArray)],
  [FILTER_FIELD.OPERATOR]: [RULES.requiredSelect()]
};

/* --------------------------------------------
   選擇欄位後更新 condition 並通知父層取得 filter options
   - 初始化完成後 category／field 沒有改變時不重複呼叫 API
   - operator／value 的 reset 由 filterOptionsModel watcher 在選項確實改變後處理
--------------------------------------------- */
const handleSelectField = async () => {
  const selectedCategory = props.fieldMode === 'cascader' ? categoryFieldArray.value[0] : undefined;
  const selectedField =
    props.fieldMode === 'cascader' ? categoryFieldArray.value[1] : fieldValue.value;

  if (
    isInitializedModel.value &&
    selectedCategory === conditionModel.value[FILTER_FIELD.CATEGORY] &&
    selectedField === conditionModel.value[FILTER_FIELD.FIELD]
  ) {
    return;
  }

  if (props.fieldMode === 'cascader') {
    conditionModel.value[FILTER_FIELD.CATEGORY] = selectedCategory;
  }
  conditionModel.value[FILTER_FIELD.FIELD] = selectedField;

  emit('select-field');
};

/** 將動態欄位正規化後的選項回傳父層，以便同步標籤引用。 */
const handleEnsureValueInOptions = options => {
  emit('ensure-value-in-options', options);
};

/* --------------------------------------------
   外部 condition 改變時合併預設 key
   - 避免載入既有條件或切換資料時缺少欄位造成後續 watcher 錯誤
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
   filterOptionsModel 改變時 reset operator / value
   - isInitializedModel 為 false：初始 fetch 結果，只標記初始化完成，不觸發 reset
   - isInitializedModel 為 true：使用者互動，且選項確實改變時才 reset
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
   categoryFieldArray 改變時重新載入 filter options（cascader 模式）
   - 初始化完成且兩層選值確實改變時才觸發
--------------------------------------------- */
watch(
  categoryFieldArray,
  (newVal, oldVal) => {
    if (props.fieldMode !== 'cascader') return;
    if (!isInitializedModel.value) return;
    if (!newVal || !oldVal) return;

    if (isEqual(newVal, oldVal)) return;

    handleSelectField();
  },
  { deep: true }
);

/* --------------------------------------------
   初始化
   - 套用預設 key，並依 mode 還原 category／field 選值
   - 既有條件已選欄位時載入對應 filter options，否則直接完成初始化
--------------------------------------------- */
onMounted(async () => {
  conditionModel.value = applyDefaultCondition(conditionModel.value);

  // 既有條件的 category／field 用於還原選單，並載入 operator／value 設定。
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
    // fetch 回來後由 filterOptionsModel watcher 標記初始化完成。
  } else {
    isInitializedModel.value = true;
  }
});
</script>
