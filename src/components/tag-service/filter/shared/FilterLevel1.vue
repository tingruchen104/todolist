<template>
  <section>
    <div class="flex flex-col items-start justify-start gap-3.5">
      <!-- AND / OR 運算選單 -->
      <MixedMenu v-model:operator="operatorField" :disabled="disabled" />
      <!-- 各模組 -->
      <template v-for="(item, index) in moduleList" :key="item.id">
        <section
          class="border-primary flex w-full items-center justify-start gap-3 rounded border px-3 py-5"
          :class="{
            '!border-error': errorModel,
            '!border-base !cursor-not-allowed': item.disabled || disabled
          }"
        >
          <h6
            class="writing-mode-vertical-lr text-primary text-sm font-bold tracking-[0.375rem]"
            :class="{
              '!text-error': errorModel,
              '!text-black-10': item.disabled || disabled
            }"
          >
            {{ item.label }}
          </h6>

          <FilterLevel2
            :module="getModule(item.value)"
            :module-value="item.value"
            :name-prefix="[...namePrefix, FILTER_FIELD.MODULES, index]"
            :site="site"
            @update:module="val => handleUpdateModule(item.value, val)"
            @remove-self="handleClearModule(item.value)"
            :disabled="item.disabled || disabled"
          />
        </section>

        <!-- AND / OR 標籤 -->
        <a-tag
          v-if="index < moduleList.length - 1"
          :color="disabled ? 'var(--color-white-60)' : 'var(--color-primary)'"
          class="min-w-9 !rounded-full font-bold uppercase"
        >
          {{ operatorField }}
        </a-tag>
      </template>
    </div>

    <ErrorMessage :error-message="errorModel" />
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';

// Components
import MixedMenu from '@/components/tag-service/filter/shared/MixedMenu';
import FilterLevel2 from '@/components/tag-service/filter/shared/FilterLevel2';
import ErrorMessage from '@/components/shared/form/ErrorMessage';

// Constants

import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE, MODULE_LABELS } from '@/pages/tag-service/constants/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/filter/shared/operator';

// Utils
import findObjectByKey from '@/utils/form/findObjectByKey';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  site: String,
  disabled: Boolean
});

const conditionsModel = defineModel('conditions', { type: Object });
const errorModel = defineModel('error', { type: String });

/* --------------------------------------------
   運算符 (and / or)
--------------------------------------------- */
const operatorField = computed({
  get: () => conditionsModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: val => {
    if (!conditionsModel.value) return;
    conditionsModel.value[FILTER_FIELD.OPERATOR] = val;
  }
});

/* --------------------------------------------
   模組清單與 key 對應
--------------------------------------------- */
const moduleList = [
  { label: MODULE_LABELS[MODULE.EVENT], value: MODULE.EVENT, id: nanoid() },
  { label: MODULE_LABELS[MODULE.ENTITY], value: MODULE.ENTITY, id: nanoid() }
];

/* --------------------------------------------
   取得指定模組內容
--------------------------------------------- */
const getModule = moduleVal =>
  findObjectByKey(conditionsModel.value?.[FILTER_FIELD.MODULES], FILTER_FIELD.MODULE, moduleVal) ??
  {};

/* --------------------------------------------
   更新 / 新增模組內容
--------------------------------------------- */
const handleUpdateModule = (moduleVal, val) => {
  const modules = conditionsModel.value?.[FILTER_FIELD.MODULES] ?? [];
  const index = modules.findIndex(m => m[FILTER_FIELD.MODULE] === moduleVal);
  if (index >= 0) {
    // 更新既有模組
    modules[index] = { [FILTER_FIELD.MODULE]: moduleVal, ...val };
  } else {
    // 新增模組
    modules.push({ [FILTER_FIELD.MODULE]: moduleVal, ...val });
  }

  conditionsModel.value = {
    ...conditionsModel.value,
    [FILTER_FIELD.MODULES]: [...modules]
  };

  if (errorModel.value) errorModel.value = '';
};

/* --------------------------------------------
   清空指定模組條件
--------------------------------------------- */
const handleClearModule = moduleVal => {
  const updatedModules = (conditionsModel.value?.[FILTER_FIELD.MODULES] ?? []).map(m =>
    m[FILTER_FIELD.MODULE] === moduleVal ? { ...m, [FILTER_FIELD.CONDITIONS]: [] } : m
  );

  conditionsModel.value = {
    ...conditionsModel.value,
    [FILTER_FIELD.MODULES]: updatedModules
  };
};

/* --------------------------------------------
   初始化預設值
--------------------------------------------- */
onMounted(() => {
  // 沒值 → 初始化
  if (!conditionsModel.value || Object.keys(conditionsModel.value).length === 0) {
    const modules = moduleList.map(module => ({
      [FILTER_FIELD.MODULE]: module.value,
      [FILTER_FIELD.OPERATOR]: OPERATOR.AND,
      [FILTER_FIELD.CONDITIONS]: []
    }));
    conditionsModel.value = {
      [FILTER_FIELD.OPERATOR]: operatorField.value,
      [FILTER_FIELD.MODULES]: modules
    };
  }
});
</script>
