<template>
  <!-- 篩選器第二層：單一模組下的條件群組清單 -->
  <OperatorList
    v-model:operator="operatorField"
    :items="conditionList"
    :item-keys="conditionIds"
    :max="MAX_CONDITIONS"
    prefix="標籤對象須符合"
    suffix="規則："
    add-text="規則"
    add-variant="primary"
    :disabled="disabled"
    @add="handleAddCondition"
  >
    <!-- 各條件群組 -->
    <template #default="{ index }">
      <section
        class="border-primary bg-mask relative w-full rounded border px-1.5 py-4"
        :class="{ '!border-base bg-white-30': disabled }"
      >
        <FilterLevel3
          v-model:condition="conditionList[index]"
          :module-value="moduleValue"
          :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
          :site="site"
          :disabled="disabled"
          @remove-self="handleRemoveCondition(index)"
        />
      </section>
    </template>
  </OperatorList>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';

// Components
import OperatorList from '@/components/tag-service/shared/operator/OperatorList';
import FilterLevel3 from '@/components/tag-service/tags/filter/shared/FilterLevel3';

// Constants
import {
  FILTER_FIELD,
  MAX_CONDITIONS
} from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { createModule } from '@/pages/tag-service/constants/tags/filter/shared/filterSchema';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/shared/operator';

/* --------------------------------------------
   Props / v-model / Emits
--------------------------------------------- */
const props = defineProps({
  /** 所屬模組，決定第三層渲染事件或會員條件 */
  moduleValue: {
    type: String,
    required: true,
    validator: value => value === MODULE.EVENT || value === MODULE.ENTITY
  },
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 目前選擇的標籤對象，往下傳給欄位選項使用 */
  site: String,
  disabled: Boolean
});

const moduleModel = defineModel('module', { type: Object });
const emit = defineEmits(['removeSelf']);

/* --------------------------------------------
   運算子與條件群組
   - conditionIds 提供可增刪清單的穩定 key，不與 index 綁定
--------------------------------------------- */
const operatorField = computed({
  get: () => moduleModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: value => {
    if (!moduleModel.value) return;
    moduleModel.value[FILTER_FIELD.OPERATOR] = value;
  }
});

const conditionList = computed(() => moduleModel.value?.[FILTER_FIELD.CONDITIONS] ?? []);
const conditionIds = ref([]);

/* --------------------------------------------
   新增與移除條件群組
--------------------------------------------- */
/** 新增一個空條件群組並建立對應的穩定 key。 */
const handleAddCondition = () => {
  conditionList.value.push({});
  conditionIds.value.push(nanoid());
};

/** 移除條件群組；僅剩一組時通知外層清空整個模組。 */
const handleRemoveCondition = index => {
  if (conditionList.value.length === 1) {
    emit('removeSelf');
    return;
  }

  conditionList.value.splice(index, 1);
  conditionIds.value.splice(index, 1);
};

/* --------------------------------------------
   補齊模組結構並建立條件群組 key
--------------------------------------------- */
onMounted(() => {
  if (!moduleModel.value || Object.keys(moduleModel.value).length === 0) {
    moduleModel.value = createModule(props.moduleValue, [], operatorField.value);
  }

  conditionIds.value = conditionList.value.map(() => nanoid());
});
</script>
