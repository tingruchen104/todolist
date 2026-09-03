<template>
  <!-- 運算子選單與前後說明文字，整體為一行敘述句 -->
  <p
    class="text-label flex flex-nowrap items-center justify-start gap-1.5 text-sm"
    :class="{ '!text-black-10': disabled }"
  >
    {{ prefix }}
    <Select
      v-model:value="operatorModel"
      v-variant="'primary'"
      :options="OPERATOR_OPTIONS"
      :show-search="false"
      :disabled="disabled"
      size="small"
      class="!w-auto"
    />
    {{ suffix }}
  </p>
</template>

<script setup>
// Components
import Select from '@/components/shared/select/Select.vue';

// Constants
import { OPERATOR_OPTIONS } from '@/pages/tag-service/constants/shared/operator';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
defineProps({
  /** 選單前的說明文字 */
  prefix: { type: String, default: '' },
  /** 選單後的說明文字 */
  suffix: { type: String, default: '' },
  /** 是否禁用選單 */
  disabled: Boolean
});

const operatorModel = defineModel('operator', {
  type: String,
  default: ''
});
</script>
