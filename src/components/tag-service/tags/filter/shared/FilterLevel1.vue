<template>
  <!-- 篩選器第一層：事件／會員模組，以及模組之間的 operator -->
  <section>
    <OperatorList
      v-model:operator="operatorField"
      :items="moduleList"
      :item-keys="moduleKeys"
      prefix="標籤對象須符合"
      suffix="規則："
      :disabled="disabled"
    >
      <!-- 各篩選模組，模組標題為縱書，停用時整區轉為灰色 -->
      <template #default="{ item, index }">
        <section
          class="border-primary flex w-full items-center justify-start gap-3 rounded border px-3 py-5"
          :class="{
            '!border-error': errorModel,
            '!border-base !cursor-not-allowed': item.disabled || disabled
          }"
        >
          <h6
            class="writing-mode-vertical-lr text-primary text-sm font-semibold tracking-[0.375rem]"
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
            :disabled="item.disabled || disabled"
            @update:module="handleUpdateModule(item.value, $event)"
            @remove-self="handleClearModule(item.value)"
          />
        </section>
      </template>
    </OperatorList>

    <!-- 篩選器整體的驗證錯誤 -->
    <ErrorMessage :error-message="errorModel" />
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { nanoid } from 'nanoid';

// Components
import OperatorList from '@/components/tag-service/shared/operator/OperatorList';
import FilterLevel2 from '@/components/tag-service/tags/filter/shared/FilterLevel2';
import ErrorMessage from '@/components/shared/form/ErrorMessage';

// Utils
import findObjectByKey from '@/utils/form/findObjectByKey';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { createFilter } from '@/pages/tag-service/constants/tags/filter/shared/filterSchema';
import { MODULE, MODULE_LABELS } from '@/pages/tag-service/constants/tags/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/shared/operator';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
defineProps({
  /** 用於組合 form name prefix，如 ['modules', 0, 'conditions', 1] */
  namePrefix: { type: Array, required: true },
  /** 目前選擇的標籤對象，往下傳給欄位選項使用 */
  site: String,
  disabled: Boolean
});

const conditionsModel = defineModel('conditions', { type: Object });
const errorModel = defineModel('error', { type: String });

/* --------------------------------------------
   運算子與模組清單
   - 第一層 operator 決定各模組之間的組合方式
--------------------------------------------- */
const operatorField = computed({
  get: () => conditionsModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: value => {
    if (!conditionsModel.value) return;
    conditionsModel.value[FILTER_FIELD.OPERATOR] = value;
  }
});

const moduleList = [
  { label: MODULE_LABELS[MODULE.EVENT], value: MODULE.EVENT, id: nanoid() },
  { label: MODULE_LABELS[MODULE.ENTITY], value: MODULE.ENTITY, id: nanoid() }
];
const moduleKeys = moduleList.map(item => item.id);

/** 從 model 取出指定模組；尚未建立時回空物件供子層初始化。 */
const getModule = moduleValue =>
  findObjectByKey(
    conditionsModel.value?.[FILTER_FIELD.MODULES],
    FILTER_FIELD.MODULE,
    moduleValue
  ) ?? {};

/* --------------------------------------------
   新增、更新與清除模組
--------------------------------------------- */
/** 更新既有模組或新增模組節點，並清除整體條件錯誤。 */
const handleUpdateModule = (moduleValue, value) => {
  const modules = [...(conditionsModel.value?.[FILTER_FIELD.MODULES] ?? [])];
  const index = modules.findIndex(module => module[FILTER_FIELD.MODULE] === moduleValue);
  const updatedModule = { [FILTER_FIELD.MODULE]: moduleValue, ...value };

  if (index >= 0) {
    modules[index] = updatedModule;
  } else {
    modules.push(updatedModule);
  }

  conditionsModel.value = {
    ...conditionsModel.value,
    [FILTER_FIELD.MODULES]: modules
  };

  if (errorModel.value) errorModel.value = '';
};

/** 清空指定模組的條件，但保留固定的模組節點。 */
const handleClearModule = moduleValue => {
  const modules = (conditionsModel.value?.[FILTER_FIELD.MODULES] ?? []).map(module =>
    module[FILTER_FIELD.MODULE] === moduleValue
      ? { ...module, [FILTER_FIELD.CONDITIONS]: [] }
      : module
  );

  conditionsModel.value = {
    ...conditionsModel.value,
    [FILTER_FIELD.MODULES]: modules
  };
};

/* --------------------------------------------
   缺少條件時建立完整篩選器結構
--------------------------------------------- */
onMounted(() => {
  if (!conditionsModel.value || Object.keys(conditionsModel.value).length === 0) {
    conditionsModel.value = createFilter({ operator: operatorField.value });
  }
});
</script>
