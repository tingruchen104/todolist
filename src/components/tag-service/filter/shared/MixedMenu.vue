<template>
  <!-- 標籤條件操作符 -->
  <p
    class="text-label flex flex-nowrap items-center justify-start gap-1.5 text-sm"
    :class="{ '!text-black-10': disabled }"
  >
    標籤對象須符合
    <a-select
      size="small"
      v-variant="'primary'"
      v-model:value="operatorModel"
      :options="options"
      :show-search="false"
      class="!w-auto"
      :disabled="disabled"
    />
    規則：
  </p>
</template>

<script setup>
// Constants
import { OPERATOR_OPTIONS } from '@/pages/tag-service/constants/filter/shared/operator';

defineProps({
  /** 是否禁用選單 */
  disabled: Boolean
});

/* --------------------------------------------
   Model
--------------------------------------------- */
const operatorModel = defineModel('operator', {
  type: String,
  default: ''
});

/* --------------------------------------------
   選項資料
--------------------------------------------- */
const options = OPERATOR_OPTIONS;
</script>
