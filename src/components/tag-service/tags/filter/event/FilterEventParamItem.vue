<template>
  <!-- 事件參數條件：同一事件下最多五筆，條件間固定使用「或」組合 -->
  <section
    class="bg-primary-10/50 mb-2 flex w-full flex-col items-start justify-start rounded px-4 py-2.5 shadow-inner"
  >
    <p class="text-label mb-1 flex items-center justify-start gap-1.5 text-sm whitespace-nowrap">
      且須符合以下任一條件：
    </p>

    <!-- parameter.conditions：事件參數條件清單 -->
    <div class="flex w-full flex-col items-stretch justify-start gap-2">
      <div
        v-for="(_condition, index) in conditionList"
        :key="conditionIds[index]"
        class="border-l-primary bg-background flex items-start justify-between gap-8 rounded border-l-5 pt-2 pr-3.5 pl-2.5 shadow"
      >
        <FilterCascaderItem
          v-model:condition="conditionList[index]"
          v-model:filter-options="conditionFilterOptions[index]"
          :metadata-options="metadataOptions"
          :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
          :disabled="disabled"
          field-mode="select"
          @select-field="handleSelectField(index)"
        />

        <!-- 條件操作：複製、刪除 -->
        <div class="flex h-9 items-center justify-end gap-2.5">
          <a-button
            v-if="!isAddConditionDisabled"
            :disabled="disabled"
            is-icon
            title="複製"
            @click="handleCopyCondition(index)"
          >
            <template #icon><i class="jb_icon_copy" /></template>
          </a-button>
          <a-button :disabled="disabled" is-icon title="刪除" @click="handleRemoveCondition(index)">
            <template #icon><i class="jb_icon_delete" /></template>
          </a-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { nanoid } from 'nanoid';

// Components
import FilterCascaderItem from '@/components/tag-service/tags/filter/shared/FilterCascaderItem.vue';

// Store
import { useFilterOptionsStore } from '@/pages/tag-service/stores/tags/filter/shared/filterOptions';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';

// 單一事件分類最多可組合五筆參數條件。
const MAX_CONDITIONS = 5;

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1, 'parameter'] */
  namePrefix: { type: Array, required: true },
  /** 目前事件分類可使用的 parameter field 選項 */
  metadataOptions: { type: Array, default: () => [] },
  /** 目前事件 category，取得 field options API 時一併送出 */
  category: String,
  /** 停用欄位與複製／刪除操作 */
  disabled: Boolean
});

const emit = defineEmits(['removeSelf']);
const eventParamsModel = defineModel('eventParams', {
  type: Object,
  default: () => ({
    [FILTER_FIELD.CONDITIONS]: []
  })
});

/* --------------------------------------------
   載入、複製與移除事件參數條件
--------------------------------------------- */
const filterOptionsStore = useFilterOptionsStore();
const conditionList = computed(() => eventParamsModel.value?.[FILTER_FIELD.CONDITIONS] || []);
const conditionIds = ref([]);
const conditionFilterOptions = ref([]);
const isAddConditionDisabled = computed(() => conditionList.value.length >= MAX_CONDITIONS);

/** 依 category 與選定 field 取得該參數的 operator、component 及 source。 */
const handleSelectField = async index => {
  try {
    const data = await filterOptionsStore.fetchFilterOptions({
      module: MODULE.EVENT,
      [FILTER_FIELD.CATEGORY]: props.category,
      [FILTER_FIELD.FIELD]: conditionList.value[index][FILTER_FIELD.FIELD]
    });
    conditionFilterOptions.value[index] = data;
  } catch (_error) {
    // API interceptor 負責錯誤回饋，失敗時保留目前選項。
  }
};

/** 深拷貝條件及其 filter options 並插入其後，避免兩筆共用巢狀資料。 */
const handleCopyCondition = index => {
  const copiedCondition = JSON.parse(JSON.stringify(conditionList.value[index] || {}));
  eventParamsModel.value[FILTER_FIELD.CONDITIONS].splice(index + 1, 0, copiedCondition);
  conditionIds.value.splice(index + 1, 0, nanoid());

  const clonedOptions = JSON.parse(JSON.stringify(conditionFilterOptions.value[index] ?? null));
  conditionFilterOptions.value.splice(index + 1, 0, clonedOptions);
};

/** 移除指定條件；只剩一筆時通知父層移除整個 parameter 節點。 */
const handleRemoveCondition = index => {
  if (conditionList.value.length <= 1) {
    emit('removeSelf');
    return;
  }

  conditionList.value.splice(index, 1);
  conditionIds.value.splice(index, 1);
  conditionFilterOptions.value.splice(index, 1);
};

/* --------------------------------------------
   初始化條件 key 與欄位選項快取
--------------------------------------------- */
onMounted(() => {
  conditionIds.value = conditionList.value.map(() => nanoid());
  conditionFilterOptions.value = conditionList.value.map(() => null);
});
</script>
