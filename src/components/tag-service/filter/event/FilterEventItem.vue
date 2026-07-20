<template>
  <section class="flex w-full flex-col items-start justify-start">
    <!-- 時間選擇 -->
    <div class="flex items-start justify-start gap-2.5">
      <label
        class="text-label mb-2 flex h-9 items-center justify-start gap-1.5 text-sm whitespace-nowrap"
      >
        時間區間
      </label>
      <a-form-item
        :name="[...namePrefix, EVENT_FILTER_FIELD.TIME_RANGE]"
        :rules="rules[EVENT_FILTER_FIELD.TIME_RANGE]"
      >
        <Select
          v-variant="'outline'"
          v-model:value="conditionModel[EVENT_FILTER_FIELD.TIME_RANGE]"
          :options="eventOptions[EVENT_FILTER_OPTIONS_FIELD.TIME_RANGES]"
          :disabled="disabled"
        />
      </a-form-item>
    </div>

    <!-- 事件選擇 -->
    <div class="flex w-full items-start justify-start gap-2.5">
      <a-form-item
        :name="[...namePrefix, EVENT_FILTER_FIELD.OCCURRED]"
        :rules="rules[EVENT_FILTER_FIELD.OCCURRED]"
      >
        <Select
          v-variant="'outline'"
          v-model:value="conditionModel[EVENT_FILTER_FIELD.OCCURRED]"
          :options="eventOptions[EVENT_FILTER_OPTIONS_FIELD.OCCURRED]"
          :disabled="disabled"
        />
      </a-form-item>

      <div class="flex w-full flex-col items-start justify-start">
        <div class="flex items-center justify-start gap-2.5">
          <!-- type + category -->
          <a-form-item
            :name="[...namePrefix, EVENT_FILTER_FIELD.CATEGORY]"
            :rules="rules[EVENT_FILTER_FIELD.CATEGORY]"
          >
            <SearchableCascader
              variant="outline"
              v-model:value="typeCategoryArray"
              expand-trigger="click"
              :auto-expand-first="true"
              :options="eventTypeCategoryOptions"
              :disabled="disabled"
            />
          </a-form-item>

          <!-- 事件參數選擇 -->
          <a-button
            v-if="fieldOptions.length && !isAddEventParamsDisabled"
            size="small"
            shape="round"
            v-variant="'primary'"
            class="mb-2"
            @click="handleAddEventParams"
            :disabled="!isCategorySelected || disabled"
          >
            <template #icon><i class="jb_icon_add" /></template>事件參數
          </a-button>
        </div>
        <FilterEventParamItem
          v-if="fieldOptions.length && eventParamsValue"
          v-model:eventParams="eventParamsValue"
          :name-prefix="[...namePrefix, EVENT_FILTER_FIELD.PARAMETER]"
          :metadata-options="fieldOptions"
          :category="conditionModel[EVENT_FILTER_FIELD.CATEGORY]"
          @remove-self="handleRemoveEventParams"
        />
      </div>
    </div>

    <!-- 計數選擇 -->
    <div
      v-if="conditionModel[EVENT_FILTER_FIELD.COUNT]"
      class="flex items-start justify-start gap-2.5"
    >
      <a-form-item
        :name="[...namePrefix, EVENT_FILTER_FIELD.COUNT, EVENT_FILTER_COUNT_FIELD.METRIC]"
        :rules="rules[EVENT_FILTER_COUNT_FIELD.METRIC]"
      >
        <Select
          v-variant="'outline'"
          v-model:value="countModel[EVENT_FILTER_COUNT_FIELD.METRIC]"
          :options="eventOptions[EVENT_FILTER_OPTIONS_FIELD.COUNT_METRICS]"
          :disabled="disabled"
        />
      </a-form-item>

      <a-form-item
        :name="[...namePrefix, EVENT_FILTER_FIELD.COUNT, EVENT_FILTER_COUNT_FIELD.OPERATOR]"
        :rules="rules[EVENT_FILTER_COUNT_FIELD.OPERATOR]"
      >
        <Select
          v-variant="'outline'"
          v-model:value="countModel[EVENT_FILTER_COUNT_FIELD.OPERATOR]"
          :options="eventOptions[EVENT_FILTER_OPTIONS_FIELD.COUNT_OPERATORS]"
          :disabled="disabled"
        />
      </a-form-item>

      <a-form-item
        :name="[...namePrefix, EVENT_FILTER_FIELD.COUNT, EVENT_FILTER_COUNT_FIELD.VALUE]"
        :rules="rules[EVENT_FILTER_COUNT_FIELD.VALUE]"
      >
        <a-input-number
          v-variant="'outline'"
          v-model:value="countModel[EVENT_FILTER_COUNT_FIELD.VALUE]"
          :precision="0"
          :disabled="disabled"
        />
      </a-form-item>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import isEqual from 'lodash/isEqual';

// Components
import Select from '@/components/shared/select/Select.vue';
import SearchableCascader from '@/components/shared/cascader/SearchableCascader.vue';
import FilterEventParamItem from '@/components/tag-service/filter/event/FilterEventParamItem.vue';

// Utils
import RULES from '@/utils/form/validationRules';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { OPERATOR } from '@/pages/tag-service/constants/filter/shared/operator';
import { MODULE } from '@/pages/tag-service/constants/filter/module';
import {
  EVENT_FILTER_COUNT_FIELD,
  EVENT_FILTER_FIELD,
  EVENT_FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/filter/event/filterEventField';

// Store
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/shared/metadataOptions';

const DEFAULT_EVENT_COUNT = {
  [EVENT_FILTER_COUNT_FIELD.METRIC]: null,
  [EVENT_FILTER_COUNT_FIELD.OPERATOR]: null,
  [EVENT_FILTER_COUNT_FIELD.VALUE]: null
};

/* --------------------------------------------
   Props
--------------------------------------------- */
defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 是否禁用 */
  disabled: Boolean
});

/* --------------------------------------------
   Computed 雙向綁定
   - 讓子層改動直接同步到父層的 formState
   - isInitialized：避免初始化階段重置 eventParams
--------------------------------------------- */
const conditionModel = defineModel('condition', {
  type: Object,
  default: () => ({
    [EVENT_FILTER_FIELD.TIME_RANGE]: null,
    [EVENT_FILTER_FIELD.OCCURRED]: null,
    [EVENT_FILTER_FIELD.TYPE]: null,
    [EVENT_FILTER_FIELD.CATEGORY]: null,
    [EVENT_FILTER_FIELD.PARAMETER]: null,
    [EVENT_FILTER_FIELD.COUNT]: {
      [EVENT_FILTER_COUNT_FIELD.METRIC]: null,
      [EVENT_FILTER_COUNT_FIELD.OPERATOR]: null,
      [EVENT_FILTER_COUNT_FIELD.VALUE]: null
    }
  })
});

const countModel = computed({
  get: () => conditionModel.value?.[EVENT_FILTER_FIELD.COUNT] ?? { ...DEFAULT_EVENT_COUNT },
  set: value => {
    conditionModel.value[EVENT_FILTER_FIELD.COUNT] = value;
  }
});

const isInitialized = ref(false);

/* --------------------------------------------
   選項清單
--------------------------------------------- */
const typeCategoryArray = ref([]);

const metadataOptionsStore = useMetadataOptionsStore();
const eventOptions = ref({});

/* --------------------------------------------
   事件類型 + 類別選項（不含最內層 field 選項）
--------------------------------------------- */
const eventTypeCategoryOptions = computed(() => {
  const events = eventOptions.value?.[EVENT_FILTER_OPTIONS_FIELD.EVENTS] || [];

  return events.map(type => {
    const categories = type.children || [];

    return {
      ...type,
      children: categories.map(category => ({
        ...category,
        children: undefined // 明確表達：不要最內層
      }))
    };
  });
});

/* --------------------------------------------
   依 category 反查對應的 type
--------------------------------------------- */
const getTypeByCategory = category => {
  const events = eventOptions.value?.[EVENT_FILTER_OPTIONS_FIELD.EVENTS] || [];

  for (const typeNode of events) {
    const categories = typeNode.children || [];
    const matchedCategory = categories.find(item => item.value === category);

    if (matchedCategory) {
      return typeNode.value;
    }
  }

  return null;
};

/* --------------------------------------------
   依 category 取得最內層欄位選項（fields）
--------------------------------------------- */
const getFieldOptionsByCategory = category => {
  const events = eventOptions.value?.[EVENT_FILTER_OPTIONS_FIELD.EVENTS] || [];

  for (const typeNode of events) {
    const categories = typeNode.children || [];
    const matchedCategory = categories.find(item => item.value === category);

    if (matchedCategory) {
      return matchedCategory.children || [];
    }
  }

  return [];
};

/* --------------------------------------------
   事件參數（eventParams）雙向綁定
--------------------------------------------- */
const eventParamsValue = computed({
  get: () => conditionModel.value?.[EVENT_FILTER_FIELD.PARAMETER],
  set: value => {
    conditionModel.value[EVENT_FILTER_FIELD.PARAMETER] = value;
  }
});

const isAddEventParamsDisabled = computed(
  () => eventParamsValue.value?.[FILTER_FIELD.CONDITIONS]?.length >= 5
);

/* 事件（type + category）是否已選取 */
const isCategorySelected = computed(
  () => !!(typeCategoryArray.value?.[0] && typeCategoryArray.value?.[1])
);

/* --------------------------------------------
   目前 category 對應的事件參數選項
   - 由 category 即時推導，不需要手動同步
--------------------------------------------- */
const fieldOptions = computed(() => {
  const category = conditionModel.value?.[EVENT_FILTER_FIELD.CATEGORY];
  if (!category) return [];

  return getFieldOptionsByCategory(category);
});

/* --------------------------------------------
   驗證規則
--------------------------------------------- */
const rules = {
  [EVENT_FILTER_FIELD.TIME_RANGE]: [RULES.requiredSelect()],
  [EVENT_FILTER_FIELD.OCCURRED]: [RULES.requiredSelect()],
  [EVENT_FILTER_FIELD.CATEGORY]: [RULES.requiredCascader(typeCategoryArray)],
  [EVENT_FILTER_COUNT_FIELD.METRIC]: [RULES.requiredSelect()],
  [EVENT_FILTER_COUNT_FIELD.OPERATOR]: [RULES.requiredSelect()],
  [EVENT_FILTER_COUNT_FIELD.VALUE]: [RULES.requiredText(), RULES.positiveInteger()]
};

/* --------------------------------------------
   新增事件參數：
   - 初始化 eventParams 結構並新增一筆條件
--------------------------------------------- */
const handleAddEventParams = () => {
  if (!eventParamsValue.value) {
    eventParamsValue.value = {
      [FILTER_FIELD.OPERATOR]: OPERATOR.OR,
      [FILTER_FIELD.CONDITIONS]: []
    };
  }
  eventParamsValue.value[FILTER_FIELD.CONDITIONS].push({});
};

/* --------------------------------------------
   移除事件參數
--------------------------------------------- */
const handleRemoveEventParams = () => {
  delete conditionModel.value[EVENT_FILTER_FIELD.PARAMETER];
};

const syncCountByOccurred = occurred => {
  if (occurred === 'false') {
    conditionModel.value[EVENT_FILTER_FIELD.COUNT] = null;
    return;
  }

  if (occurred === 'true') {
    conditionModel.value[EVENT_FILTER_FIELD.COUNT] = {
      ...DEFAULT_EVENT_COUNT,
      ...(conditionModel.value[EVENT_FILTER_FIELD.COUNT] || {}),
      [EVENT_FILTER_COUNT_FIELD.METRIC]:
        conditionModel.value[EVENT_FILTER_FIELD.COUNT]?.[EVENT_FILTER_COUNT_FIELD.METRIC] ??
        eventOptions.value[EVENT_FILTER_OPTIONS_FIELD.COUNT_METRICS]?.[0]?.value ??
        null
    };
  }
};

/* --------------------------------------------
   當 typeCategoryArray 改變 → 同步目前選取的 type / category
--------------------------------------------- */
watch(
  typeCategoryArray,
  ([type, category], oldVal) => {
    if (!oldVal) return;

    conditionModel.value[EVENT_FILTER_FIELD.TYPE] = type;
    conditionModel.value[EVENT_FILTER_FIELD.CATEGORY] = category;
  },
  { deep: true }
);

/* --------------------------------------------
   當 OCCURRED 切換 → 同步計數欄位
   - 未發生：移除 count（設為 null）
   - 發生：補回預設 count 結構
--------------------------------------------- */
watch(
  () => conditionModel.value?.[EVENT_FILTER_FIELD.OCCURRED],
  occurred => {
    syncCountByOccurred(occurred);
  }
);

/* --------------------------------------------
   當 fieldOptions 改變 → 若選項真的有變，才清空事件參數資料
   - 初始化完成後才判斷，避免初始載入時誤清空
--------------------------------------------- */
watch(
  fieldOptions,
  (newVal, oldVal) => {
    if (!isInitialized.value) return;
    // 兩層完全相同 → 不需要重新處理
    if (isEqual(newVal, oldVal)) return;
    // 選項有變 → 才清空事件參數資料
    handleRemoveEventParams();
  },
  { deep: true }
);

/* --------------------------------------------
   初始化
   - 載入 metadata options（事件選項結構）
   - 套用預設值
   - 若初始有 category，反查對應的 type
--------------------------------------------- */
onMounted(async () => {
  try {
    await metadataOptionsStore.fetchMetadataOptions();
    eventOptions.value =
      metadataOptionsStore.metadataOptions?.[FILTER_FIELD.FILTER]?.[MODULE.EVENT] || {};
    // OCCURRED / COUNT.METRIC 預設為第一個選項
    if (conditionModel.value[EVENT_FILTER_FIELD.OCCURRED] == null) {
      conditionModel.value[EVENT_FILTER_FIELD.OCCURRED] =
        eventOptions.value[EVENT_FILTER_OPTIONS_FIELD.OCCURRED]?.[0]?.value ?? null;
    }
    syncCountByOccurred(conditionModel.value[EVENT_FILTER_FIELD.OCCURRED]);

    // 若初始有 category，反查對應的 type
    const category = conditionModel.value[EVENT_FILTER_FIELD.CATEGORY];
    const type = conditionModel.value[EVENT_FILTER_FIELD.TYPE] || getTypeByCategory(category);

    conditionModel.value[EVENT_FILTER_FIELD.TYPE] = type;
    typeCategoryArray.value = [type, category];

    await nextTick();
  } catch (err) {
    console.error('Failed to load metadata options:', err);
  }

  // 初始化完成
  isInitialized.value = true;
});
</script>
