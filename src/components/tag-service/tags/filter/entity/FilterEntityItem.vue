<template>
  <!-- 會員資料與標籤條件：欄位選擇與輸入由 FilterCascaderItem 負責，本層處理選項來源與標籤引用 -->
  <section class="w-full">
    <FilterCascaderItem
      v-model:condition="conditionModel"
      v-model:filter-options="filterOptionsModel"
      v-model:is-initialized="isInitializedModel"
      :metadata-options="entityOptions"
      :name-prefix="namePrefix"
      :disabled="disabled"
      :expired-label-prefix="expiredLabelPrefix"
      @select-field="handleSelectField"
      @ensure-value-in-options="handleEnsureValueInOptions"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import isEqual from 'lodash/isEqual';

// Components
import FilterCascaderItem from '@/components/tag-service/tags/filter/shared/FilterCascaderItem.vue';

// Store
import { useFilterOptionsStore } from '@/pages/tag-service/stores/tags/filter/shared/filterOptions';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/tags/filter/entity/referencedTags';
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/tags/shared/metadataOptions';

// Constants
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import {
  FILTER_FIELD,
  FILTER_OPTIONS_FIELD
} from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import { FIELD_COMPONENT_SOURCE } from '@/pages/tag-service/constants/tags/filter/shared/fieldComponentConfig';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 目前選擇的標籤對象；標籤類欄位選項會隨 site 變動 */
  site: String,
  disabled: Boolean
});

const conditionModel = defineModel('condition', { type: Object });
const filterOptionsModel = defineModel('filterOptions', { type: Object });
const isInitializedModel = defineModel('isInitialized', { type: Boolean, default: false });

/* --------------------------------------------
   選項與標籤引用
   - entityOptions 是 metadata 提供的會員欄位樹
   - filterOptions 是目前欄位的 operator、component 與 source 設定
   - 標籤類欄位的有效選值需登記至 referencedTags store，送出時一併帶出
--------------------------------------------- */
const filterOptionsStore = useFilterOptionsStore();
const metadataOptionsStore = useMetadataOptionsStore();
const referencedTagsStore = useReferencedTagsStore();
/** 本元件持有的標籤引用，清理時不影響其他條件。 */
const ownedReferenceValues = ref(new Set());
const entityOptions = ref([]);

const isTagCategory = computed(
  () => conditionModel.value[FILTER_FIELD.CATEGORY] === FORM_FIELD.TAGS
);

const expiredLabelPrefix = computed(() =>
  isTagCategory.value ? FORM_FIELD_LABELS[FORM_FIELD.TAGS] : ''
);

/** 依會員模組的 category／field／site 取得動態運算子與欄位值選項。 */
const handleSelectField = async () => {
  try {
    const data = await filterOptionsStore.fetchFilterOptions({
      module: MODULE.ENTITY,
      [FILTER_FIELD.CATEGORY]: conditionModel.value[FILTER_FIELD.CATEGORY],
      [FILTER_FIELD.FIELD]: conditionModel.value[FILTER_FIELD.FIELD],
      ...(isTagCategory.value ? { [FORM_FIELD.SITE]: props.site } : {})
    });
    if (!isEqual(data, filterOptionsModel.value)) {
      filterOptionsModel.value = data;
    }
  } catch (_error) {
    // API interceptor 負責錯誤回饋，失敗時保留目前選項。
  }
};

/** 動態欄位完成失效值正規化後，才以有效選值同步 referencedTags。 */
const handleEnsureValueInOptions = () => {
  if (!isInitializedModel.value) return;

  syncReferencedTags();
};

/* --------------------------------------------
   標籤引用同步
   - store 以使用次數管理引用，同一標籤可被多個條件同時使用
   - 本元件只移除自己登記過的值，避免影響其他 FilterEntityItem
--------------------------------------------- */
/** 移除本條件持有的標籤引用，不影響其他條件仍在使用的引用。 */
const clearOwnedReferences = () => {
  ownedReferenceValues.value.forEach(value => {
    referencedTagsStore.removeReference(value);
  });
  ownedReferenceValues.value = new Set();
};

/** 依目前有效選值更新引用差集，實際刪除由 store 的使用次數決定。 */
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

// 選值或選項變動時重算引用；初始化完成前的值尚未對齊選項，不處理。
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

// 標籤類欄位的可選標籤隨 site 變動，需重新取得欄位設定。
watch(
  () => props.site,
  (site, previousSite) => {
    if (!isInitializedModel.value || !isTagCategory.value) return;
    if (site === previousSite) return;

    handleSelectField();
  }
);

/* --------------------------------------------
   初始化時載入 metadata
--------------------------------------------- */
onMounted(async () => {
  try {
    await metadataOptionsStore.fetchMetadataOptions();
    entityOptions.value =
      metadataOptionsStore.metadataOptions?.[FILTER_FIELD.FILTER]?.[MODULE.ENTITY] || [];
  } catch (error) {
    console.error('載入會員篩選選項失敗：', error);
  }
});

/* --------------------------------------------
   清理 referencedTags
--------------------------------------------- */
onUnmounted(() => {
  clearOwnedReferences();
});
</script>
