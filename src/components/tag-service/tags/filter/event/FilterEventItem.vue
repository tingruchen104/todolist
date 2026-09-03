<template>
  <!-- 單一事件條件：依序設定時間區間、發生狀態與分類、事件參數及計數門檻 -->
  <section class="flex w-full flex-col items-start justify-start">
    <!-- timeRange：事件發生的時間範圍 -->
    <div class="flex items-start justify-start gap-2.5">
      <p
        class="text-label mb-2 flex h-9 items-center justify-start gap-1.5 text-sm whitespace-nowrap"
      >
        時間區間
      </p>
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

    <!-- occurred + type + category：發生狀態與事件分類 -->
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

      <!-- category + parameter：串接選單定位分類；僅「發生」且分類提供 field 時可新增參數 -->
      <div class="flex w-full flex-col items-start justify-start">
        <div class="flex items-center justify-start gap-2.5">
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

          <a-button
            v-if="isOccurred && fieldOptions.length && !isAddEventParamsDisabled"
            v-variant="'primary'"
            :disabled="!isCategorySelected || disabled"
            size="small"
            shape="round"
            class="mb-2"
            @click="handleAddEventParams"
          >
            <template #icon><i class="jb_icon_add" /></template>事件參數
          </a-button>
        </div>
        <FilterEventParamItem
          v-if="isOccurred && fieldOptions.length && eventParamsValue"
          v-model:eventParams="eventParamsValue"
          :name-prefix="[...namePrefix, EVENT_FILTER_FIELD.PARAMETER]"
          :metadata-options="fieldOptions"
          :category="conditionModel[EVENT_FILTER_FIELD.CATEGORY]"
          @remove-self="handleRemoveEventParams"
        />
      </div>
    </div>

    <!-- count：僅「發生」狀態使用的計數條件 -->
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
          string-mode
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
import FilterEventParamItem from '@/components/tag-service/tags/filter/event/FilterEventParamItem.vue';

// Utils
import RULES from '@/utils/form/validationRules';

// Store
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/tags/shared/metadataOptions';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { OPERATOR } from '@/pages/tag-service/constants/shared/operator';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import {
  EVENT_FILTER_COUNT_FIELD,
  EVENT_FILTER_FIELD,
  EVENT_FILTER_OPTIONS_FIELD,
  EVENT_OCCURRED
} from '@/pages/tag-service/constants/tags/filter/event/filterEventField';

/** occurred 為「發生」時 count 節點需具備的完整 payload key。 */
const DEFAULT_EVENT_COUNT = {
  [EVENT_FILTER_COUNT_FIELD.METRIC]: null,
  [EVENT_FILTER_COUNT_FIELD.OPERATOR]: null,
  [EVENT_FILTER_COUNT_FIELD.VALUE]: null
};

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  disabled: Boolean
});

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

/** 將 count 節點包成可寫 computed；count 尚未建立時提供完整空結構。 */
const countModel = computed({
  get: () => conditionModel.value?.[EVENT_FILTER_FIELD.COUNT] ?? { ...DEFAULT_EVENT_COUNT },
  set: value => {
    conditionModel.value[EVENT_FILTER_FIELD.COUNT] = value;
  }
});

const isInitialized = ref(false);

/* --------------------------------------------
   整理事件類型、分類與欄位選項
--------------------------------------------- */
const typeCategoryArray = ref([]);
const metadataOptionsStore = useMetadataOptionsStore();
const eventOptions = ref({});

/** 將 metadata 的 type → category → field 三層資料裁成串接選單需要的前兩層。 */
const eventTypeCategoryOptions = computed(() => {
  const events = eventOptions.value?.[EVENT_FILTER_OPTIONS_FIELD.EVENTS] || [];

  return events.map(type => {
    const categories = type.children || [];

    return {
      ...type,
      children: categories.map(category => ({
        ...category,
        children: undefined
      }))
    };
  });
});

/** 以 category value 反查所屬 type 與完整 category 節點。 */
const findCategory = categoryValue => {
  const events = eventOptions.value?.[EVENT_FILTER_OPTIONS_FIELD.EVENTS] || [];

  for (const typeNode of events) {
    const categories = typeNode.children || [];
    const categoryNode = categories.find(item => item.value === categoryValue);

    if (categoryNode) {
      return { typeValue: typeNode.value, categoryNode };
    }
  }

  return null;
};

/* --------------------------------------------
   新增與移除事件參數
--------------------------------------------- */
/** 將 parameter 節點包成可寫 computed，供事件參數子元件直接更新。 */
const eventParamsValue = computed({
  get: () => conditionModel.value?.[EVENT_FILTER_FIELD.PARAMETER],
  set: value => {
    conditionModel.value[EVENT_FILTER_FIELD.PARAMETER] = value;
  }
});

const isAddEventParamsDisabled = computed(
  () => eventParamsValue.value?.[FILTER_FIELD.CONDITIONS]?.length >= 5
);

const isCategorySelected = computed(
  () => !!(typeCategoryArray.value?.[0] && typeCategoryArray.value?.[1])
);

const isOccurred = computed(
  () => conditionModel.value?.[EVENT_FILTER_FIELD.OCCURRED] === EVENT_OCCURRED.YES
);

/** 取得目前 category 下可作為事件參數的 field 選項。 */
const fieldOptions = computed(() => {
  const category = conditionModel.value?.[EVENT_FILTER_FIELD.CATEGORY];
  if (!category) return [];

  return findCategory(category)?.categoryNode.children || [];
});

const rules = {
  [EVENT_FILTER_FIELD.TIME_RANGE]: [RULES.requiredSelect()],
  [EVENT_FILTER_FIELD.OCCURRED]: [RULES.requiredSelect()],
  [EVENT_FILTER_FIELD.CATEGORY]: [RULES.requiredCascader(typeCategoryArray)],
  [EVENT_FILTER_COUNT_FIELD.METRIC]: [RULES.requiredSelect()],
  [EVENT_FILTER_COUNT_FIELD.OPERATOR]: [RULES.requiredSelect()],
  [EVENT_FILTER_COUNT_FIELD.VALUE]: [RULES.requiredText(), RULES.positiveInteger()]
};

/** 建立 parameter 群組後新增空條件；群組內條件固定以 OR 組合。 */
const handleAddEventParams = () => {
  if (!eventParamsValue.value) {
    eventParamsValue.value = {
      [FILTER_FIELD.OPERATOR]: OPERATOR.OR,
      [FILTER_FIELD.CONDITIONS]: []
    };
  }
  eventParamsValue.value[FILTER_FIELD.CONDITIONS].push({});
};

/** 移除整個 parameter 節點，避免送出空條件群組。 */
const handleRemoveEventParams = () => {
  delete conditionModel.value[EVENT_FILTER_FIELD.PARAMETER];
};

/**
 * 依 occurred 同步 count 與 parameter。
 * - 未發生：count 設為 null，並移除事件參數
 * - 發生：補回 count 完整結構及 metadata 的預設 metric，保留既有有效值
 */
const syncCountByOccurred = occurred => {
  if (occurred === EVENT_OCCURRED.NO) {
    conditionModel.value[EVENT_FILTER_FIELD.COUNT] = null;
    handleRemoveEventParams();
    return;
  }

  if (occurred === EVENT_OCCURRED.YES) {
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
   同步事件分類、發生狀態與參數
   - 事件分類真正變更後才清除參數；初始化載入選項時須保留既有值
--------------------------------------------- */
// typeCategoryArray 改變時寫回前端定位用 type 與 API payload category；首次建立路徑不重複寫回。
watch(
  typeCategoryArray,
  ([type, category], previousPath) => {
    if (!previousPath) return;

    conditionModel.value[EVENT_FILTER_FIELD.TYPE] = type;
    conditionModel.value[EVENT_FILTER_FIELD.CATEGORY] = category;
  },
  { deep: true }
);

// occurred 改變時切換 count 結構，未發生時同步清除 parameter。
watch(() => conditionModel.value?.[EVENT_FILTER_FIELD.OCCURRED], syncCountByOccurred);

/*
 * fieldOptions 改變時清除舊事件參數
 * - isInitialized 為 false：metadata 初始載入，保留 API 既有參數
 * - isInitialized 為 true：使用者切換分類，且欄位選項確實改變時才清除
 */
watch(
  fieldOptions,
  (options, previousOptions) => {
    if (!isInitialized.value) return;
    if (isEqual(options, previousOptions)) return;

    handleRemoveEventParams();
  },
  { deep: true }
);

/* --------------------------------------------
   載入事件選項與初始化條件
   - 從 metadata 取得事件選項並補上 occurred 預設值
   - 既有 category 需反查 type，組成串接選單的初始路徑
--------------------------------------------- */
onMounted(async () => {
  try {
    await metadataOptionsStore.fetchMetadataOptions();
    eventOptions.value =
      metadataOptionsStore.metadataOptions?.[FILTER_FIELD.FILTER]?.[MODULE.EVENT] || {};
    if (conditionModel.value[EVENT_FILTER_FIELD.OCCURRED] == null) {
      conditionModel.value[EVENT_FILTER_FIELD.OCCURRED] =
        eventOptions.value[EVENT_FILTER_OPTIONS_FIELD.OCCURRED]?.[0]?.value ?? null;
    }
    syncCountByOccurred(conditionModel.value[EVENT_FILTER_FIELD.OCCURRED]);

    const category = conditionModel.value[EVENT_FILTER_FIELD.CATEGORY];
    const type =
      conditionModel.value[EVENT_FILTER_FIELD.TYPE] || findCategory(category)?.typeValue || null;

    conditionModel.value[EVENT_FILTER_FIELD.TYPE] = type;
    typeCategoryArray.value = [type, category];

    // 等待 fieldOptions watcher 完成初始同步後，再開放後續變更清理。
    await nextTick();
  } catch (error) {
    console.error('載入事件選項失敗：', error);
  }

  isInitialized.value = true;
});
</script>
