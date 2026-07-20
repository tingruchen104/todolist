<template>
  <section
    class="bg-primary-10/50 mb-2 flex w-full flex-col items-start justify-start rounded px-4 py-2.5 shadow-inner"
  >
    <label
      class="text-label mb-1 flex items-center justify-start gap-1.5 text-sm whitespace-nowrap"
    >
      且須符合以下任一條件：
    </label>
    <!-- 事件參數條件 -->
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

        <!-- 操作按鈕 -->
        <div class="flex h-9 items-center justify-end gap-2.5">
          <a-button
            v-if="!isAddConditionDisabled"
            is-icon
            title="複製"
            @click="handleCopyCondition(index)"
            :disabled="disabled"
          >
            <template #icon><i class="jb_icon_copy" /></template>
          </a-button>
          <a-button is-icon title="刪除" @click="handleRemoveCondition(index)" :disabled="disabled">
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
import FilterCascaderItem from '@/components/tag-service/filter/shared/FilterCascaderItem.vue';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';

// Store
import { useFilterOptionsStore } from '@/pages/tag-service/stores/filter/shared/filterOptions';

/* --------------------------------------------
   Props / Emits
--------------------------------------------- */
const props = defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1, 'eventParams'] */
  namePrefix: { type: Array, required: true },
  /** 事件參數選項 */
  metadataOptions: { type: Array, default: () => [] },
  category: String,
  disabled: Boolean
});

const emit = defineEmits(['removeSelf']);

/* --------------------------------------------
Computed 雙向綁定
   - 讓子層改動直接同步到父層的 formState
--------------------------------------------- */
const eventParamsModel = defineModel('eventParams', {
  type: Object,
  default: () => ({
    [FILTER_FIELD.CONDITIONS]: []
  })
});

/* --------------------------------------------
   Store / 選項清單
--------------------------------------------- */
const filterOptionsStore = useFilterOptionsStore();
const conditionList = computed(() => eventParamsModel.value?.[FILTER_FIELD.CONDITIONS] || []);
const conditionIds = ref([]);
const conditionFilterOptions = ref([]);
const isAddConditionDisabled = computed(() => conditionList.value.length >= 5);

/* --------------------------------------------
   處理欄位選擇
--------------------------------------------- */
const handleSelectField = async index => {
  try {
    const data = await filterOptionsStore.fetchFilterOptions({
      module: MODULE.EVENT,
      [FILTER_FIELD.CATEGORY]: props.category,
      [FILTER_FIELD.FIELD]: conditionList.value[index][FILTER_FIELD.FIELD]
    });
    conditionFilterOptions.value[index] = data;
  } catch (_error) {
    // console.error(_error);
  }
};

/* --------------------------------------------
   複製條件
--------------------------------------------- */
const handleCopyCondition = index => {
  const clone = JSON.parse(JSON.stringify(conditionList.value[index] || {}));
  eventParamsModel.value[FILTER_FIELD.CONDITIONS].splice(index + 1, 0, clone);
  conditionIds.value.splice(index + 1, 0, nanoid());
  const clonedOptions = JSON.parse(JSON.stringify(conditionFilterOptions.value[index] ?? null));
  conditionFilterOptions.value.splice(index + 1, 0, clonedOptions);
};

/* --------------------------------------------
   移除條件
--------------------------------------------- */
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
   初始化
--------------------------------------------- */
onMounted(() => {
  conditionIds.value = conditionList.value.map(() => nanoid());
  conditionFilterOptions.value = conditionList.value.map(() => null);
});
</script>
