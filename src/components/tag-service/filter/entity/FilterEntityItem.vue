<template>
  <section class="w-full">
    <FilterCascaderItem
      v-model:condition="conditionModel"
      v-model:filter-options="filterOptionsModel"
      v-model:is-initialized="isInitializedModel"
      :metadata-options="entityOption"
      :name-prefix="namePrefix"
      :disabled="disabled"
      :expired-label-prefix="expiredLabelPrefix"
      @select-field="handleSelectField"
      @ensure-value-in-options="handleEnsureValueInOptions"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import isEqual from 'lodash/isEqual';

// Component
import FilterCascaderItem from '@/components/tag-service/filter/shared/FilterCascaderItem.vue';

// Constants
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/form/tagForm/formField';
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';
import { FIELD_COMPONENT_SOURCE } from '@/pages/tag-service/constants/filter/shared/fieldComponentConfig';

// Store
import { useFilterOptionsStore } from '@/pages/tag-service/stores/filter/shared/filterOptions';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/filter/entity/referencedTags';
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/shared/metadataOptions';

/* --------------------------------------------
   Props
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  site: String,
  disabled: Boolean
});

/* --------------------------------------------
   Computed 雙向綁定
   - 讓子層改動直接同步到父層的 formState
   - isInitialized：避免初始化階段重置 operator/value
--------------------------------------------- */
const conditionModel = defineModel('condition', { type: Object });
const filterOptionsModel = defineModel('filterOptions', { type: Object });
const isInitializedModel = defineModel('isInitialized', { type: Boolean, default: false });

/* --------------------------------------------
   Store / 選項清單
--------------------------------------------- */
const filterOptionsStore = useFilterOptionsStore();
const metadataOptionsStore = useMetadataOptionsStore();
const referencedTagsStore = useReferencedTagsStore();
// 只記錄「本元件」目前持有的 referenced tag values，避免誤動到其他 FilterEntityItem
const ownedReferenceValues = ref(new Set());
const entityOption = ref([]);

/* --------------------------------------------
   控制旗標
--------------------------------------------- */
const isTagCategory = computed(
  () => conditionModel.value[FILTER_FIELD.CATEGORY] === FORM_FIELD.TAGS
);

const expiredLabelPrefix = computed(() =>
  isTagCategory.value ? FORM_FIELD_LABELS[FORM_FIELD.TAGS] : ''
);

/* --------------------------------------------
   處理欄位選擇
--------------------------------------------- */
const handleSelectField = async () => {
  try {
    const data = await filterOptionsStore.fetchFilterOptions({
      module: MODULE.ENTITY,
      [FILTER_FIELD.CATEGORY]: conditionModel.value[FILTER_FIELD.CATEGORY],
      [FILTER_FIELD.FIELD]: conditionModel.value[FILTER_FIELD.FIELD],
      ...(isTagCategory.value ? { [FORM_FIELD.SITE]: props.site } : {})
    });
    // 選項有變才更新，FilterCascaderItem 的 watch 才會觸發 reset
    if (!isEqual(data, filterOptionsModel.value)) {
      filterOptionsModel.value = data;
    }
  } catch (_error) {
    // console.error(_error);
  }
};

/* --------------------------------------------
   確保 value / values 在選項中
--------------------------------------------- */
const handleEnsureValueInOptions = _options => {
  if (!isInitializedModel.value) return;
  // options/value 任何一端被 normalize 後，都用同一套差異同步邏輯重算一次
  syncReferencedTags();
};

/* --------------------------------------------
   清除本元件持有的 referenced tags
   - 僅 remove 自己曾 add 的 value
   - 交由 store usageMap 控制是否真正刪除
--------------------------------------------- */
const clearOwnedReferences = () => {
  ownedReferenceValues.value.forEach(value => {
    referencedTagsStore.removeReference(value);
  });
  ownedReferenceValues.value = new Set();
};

/* --------------------------------------------
   同步 referenced tags（差異法）
   - next: 目前條件在 options 中且被選到的 value
   - previous -> next 差集做 remove
   - next -> previous 差集做 add
--------------------------------------------- */
const syncReferencedTags = () => {
  const previous = ownedReferenceValues.value;
  const next = new Set();

  if (isTagCategory.value) {
    const options =
      filterOptionsModel.value?.[FILTER_OPTIONS_FIELD.SOURCE]?.[FIELD_COMPONENT_SOURCE.ENUM] || [];
    const optionsMap = new Map(options.map(option => [option.value, option.label]));

    const singleValue = conditionModel.value[FILTER_FIELD.VALUE];
    const multiValues = conditionModel.value[FILTER_FIELD.VALUES];
    const selectedValues = Array.isArray(multiValues) ? multiValues : [singleValue];

    selectedValues
      .filter(value => value !== null && value !== undefined && value !== '')
      .forEach(value => {
        if (!optionsMap.has(value)) return;
        next.add(value);
        if (!previous.has(value)) {
          referencedTagsStore.addReference(value, optionsMap.get(value) || value);
        }
      });
  }

  previous.forEach(value => {
    if (!next.has(value)) {
      referencedTagsStore.removeReference(value);
    }
  });

  ownedReferenceValues.value = next;
};

/* --------------------------------------------
   category === tags + value/values + options 變化時，重算 referencedTags
--------------------------------------------- */
watch(
  [
    () => isInitializedModel.value,
    () => conditionModel.value,
    () => filterOptionsModel.value?.[FILTER_OPTIONS_FIELD.SOURCE]?.[FIELD_COMPONENT_SOURCE.ENUM]
  ],
  () => {
    if (!isInitializedModel.value) return;
    syncReferencedTags();
  },
  { deep: true, immediate: true }
);

/* --------------------------------------------
   當 props.site 改變 → 且目前類型為 Tag → 重新載入該欄位的 filter options
--------------------------------------------- */
watch(
  () => props.site,
  (newSite, oldSite) => {
    if (!isInitializedModel.value) return; // 初始化期間不要跑
    if (!isTagCategory.value) return; // 非 Tag 類型不需要依 site 更新
    if (newSite === oldSite) return;
    // 重新載入對應欄位設定（operator、component、source）
    handleSelectField();
  }
);

/* --------------------------------------------
   初始化時載入 metadata
--------------------------------------------- */
onMounted(async () => {
  try {
    // 從 store 載入共用 metadata（只打一次 API）
    await metadataOptionsStore.fetchMetadataOptions();
    entityOption.value =
      metadataOptionsStore.metadataOptions?.[FILTER_FIELD.FILTER]?.[MODULE.ENTITY] || [];
  } catch (err) {
    console.error('Failed to load metadata options:', err);
  }
});

/* --------------------------------------------
   清理 referencedTags
--------------------------------------------- */
onUnmounted(() => {
  clearOwnedReferences();
});
</script>
