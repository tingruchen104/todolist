<template>
  <section
    v-if="conditionList.length > 0"
    class="flex w-full flex-col items-start justify-start gap-3.5"
  >
    <!-- AND / OR 運算選單 -->
    <template v-if="operatorField && conditionList.length > 1">
      <MixedMenu v-model:operator="operatorField" :disabled="disabled" />
    </template>

    <!-- 各條件組 -->
    <template v-for="(_condition, index) in conditionList" :key="conditionIds[index]">
      <section
        class="border-primary bg-mask relative w-full rounded border px-1.5 py-4"
        :class="{ '!border-base bg-white-30': disabled }"
      >
        <FilterLevel3
          v-model:condition="conditionList[index]"
          :module-value="moduleValue"
          :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
          :site="site"
          @remove-self="handleRemoveCondition(index)"
          :disabled="disabled"
        />
      </section>

      <!-- AND / OR 標籤 -->
      <a-tag
        v-if="index < conditionList.length - 1"
        :color="disabled ? 'var(--color-white-60)' : 'var(--color-primary)'"
        class="min-w-9 !rounded-full font-bold uppercase"
      >
        {{ operatorField }}
      </a-tag>

      <!-- 新增條件按鈕 -->
      <a-button
        v-else-if="!isAddConditionDisabled"
        size="small"
        shape="round"
        v-variant="'primary'"
        @click="handleAddCondition"
        :disabled="disabled"
      >
        <template #icon><i class="jb_icon_add" /></template>規則
      </a-button>
    </template>
  </section>

  <!-- 無條件時顯示新增按鈕 -->
  <a-button
    v-else-if="!isAddConditionDisabled"
    size="small"
    shape="round"
    v-variant="'primary'"
    @click="handleAddCondition"
    :disabled="disabled"
  >
    <template #icon><i class="jb_icon_add" /></template>規則
  </a-button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';

// Components
import MixedMenu from '@/components/tag-service/filter/shared/MixedMenu';
import FilterLevel3 from '@/components/tag-service/filter/shared/FilterLevel3';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/filter/shared/operator';

/* --------------------------------------------
   Props
--------------------------------------------- */
const props = defineProps({
  moduleValue: {
    type: String,
    required: true,
    validator: val => val === MODULE.EVENT || val === MODULE.ENTITY
  },
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  site: String,
  disabled: Boolean
});

/* --------------------------------------------
   v-model
--------------------------------------------- */
const moduleModel = defineModel('module', { type: Object });

/* --------------------------------------------
   Emits
--------------------------------------------- */
const emit = defineEmits(['removeSelf']);

/* --------------------------------------------
   運算符欄位
--------------------------------------------- */
const operatorField = computed({
  get: () => moduleModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: val => {
    if (!moduleModel.value) return;
    moduleModel.value[FILTER_FIELD.OPERATOR] = val;
  }
});

/* --------------------------------------------
   條件清單與 key 對應
--------------------------------------------- */
const conditionList = computed(() => moduleModel.value?.[FILTER_FIELD.CONDITIONS] ?? []);
const conditionIds = ref([]);
const isAddConditionDisabled = computed(() => conditionList.value.length >= 10);

/* --------------------------------------------
   新增條件
--------------------------------------------- */
const handleAddCondition = () => {
  moduleModel.value[FILTER_FIELD.CONDITIONS].push({});
  conditionIds.value.push(nanoid());
};

/* --------------------------------------------
   移除整個條件群組
--------------------------------------------- */
const handleRemoveCondition = index => {
  if (moduleModel.value[FILTER_FIELD.CONDITIONS].length === 1) {
    emit('removeSelf');
  } else {
    moduleModel.value[FILTER_FIELD.CONDITIONS].splice(index, 1);
    conditionIds.value.splice(index, 1);
  }
};

/* --------------------------------------------
   初始化
--------------------------------------------- */
onMounted(() => {
  // 沒值 → 初始化
  if (!moduleModel.value || Object.keys(moduleModel.value).length === 0) {
    moduleModel.value = {
      [FILTER_FIELD.MODULE]: props.moduleValue,
      [FILTER_FIELD.OPERATOR]: operatorField.value,
      [FILTER_FIELD.CONDITIONS]: []
    };
  }

  // 初始化對應 id
  conditionIds.value = conditionList.value.map(() => nanoid());
});
</script>
