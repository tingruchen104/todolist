<template>
  <section class="flex w-full flex-col items-start justify-start gap-3.5 px-6">
    <!-- AND / OR 運算符 -->
    <template v-if="operatorField && conditionList.length > 1">
      <MixedMenu v-model:operator="operatorField" :disabled="disabled" />
    </template>

    <!-- 各條件項 -->
    <template v-for="(_condition, index) in conditionList" :key="conditionIds[index]">
      <section
        class="border-l-primary bg-background relative w-full rounded border-l-5 px-5 pt-2 shadow"
        :class="{ '!border-l-base bg-white-10': disabled }"
      >
        <div class="flex items-start justify-between gap-8">
          <!-- Event 模組 -->
          <FilterEventItem
            v-if="moduleValue === MODULE.EVENT"
            v-model:condition="conditionList[index]"
            :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
            :disabled="disabled"
          />

          <!-- Entity 模組 -->
          <FilterEntityItem
            v-else-if="moduleValue === MODULE.ENTITY"
            v-model:condition="conditionList[index]"
            :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
            :site="site"
            :disabled="disabled"
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
            <a-button
              is-icon
              title="刪除"
              @click="handleRemoveCondition(index)"
              :disabled="disabled"
            >
              <template #icon><i class="jb_icon_delete" /></template>
            </a-button>
          </div>
        </div>
      </section>

      <!-- 運算符標籤 -->
      <a-tag
        v-if="index < conditionList.length - 1"
        :color="disabled ? 'var(--color-white-60)' : 'var(--color-primary)'"
        class="min-w-9 -translate-x-1/2 !rounded-full font-bold uppercase"
      >
        {{ operatorField }}
      </a-tag>

      <!-- 新增按鈕 -->
      <a-button
        v-else-if="!isAddConditionDisabled"
        size="small"
        shape="round"
        @click="handleAddCondition"
        :disabled="disabled"
      >
        <template #icon><i class="jb_icon_add" /></template>規則
      </a-button>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { nanoid } from 'nanoid';

// Components
import MixedMenu from '@/components/tag-service/filter/shared/MixedMenu';
import FilterEventItem from '@/components/tag-service/filter/event/FilterEventItem';
import FilterEntityItem from '@/components/tag-service/filter/entity/FilterEntityItem';

// Constants
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/filter/shared/operator';

/* --------------------------------------------
   Props
--------------------------------------------- */
defineProps({
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
const conditionModel = defineModel('condition', { type: Object });

/* --------------------------------------------
   Emits
--------------------------------------------- */
const emit = defineEmits(['removeSelf']);

/* --------------------------------------------
   運算符（AND / OR）
--------------------------------------------- */
const operatorField = computed({
  get: () => conditionModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: val => {
    if (!conditionModel.value) return;
    conditionModel.value[FILTER_FIELD.OPERATOR] = val;
  }
});

/* --------------------------------------------
   條件清單與 Key 對應
--------------------------------------------- */
const conditionList = computed(() => conditionModel.value?.[FILTER_FIELD.CONDITIONS] ?? []);
const conditionIds = ref([]);
const isAddConditionDisabled = computed(() => conditionList.value.length >= 10);

/* --------------------------------------------
   新增條件
--------------------------------------------- */
const handleAddCondition = () => {
  conditionModel.value[FILTER_FIELD.CONDITIONS].push({});
  conditionIds.value.push(nanoid());
};

/* --------------------------------------------
   複製條件
--------------------------------------------- */
const handleCopyCondition = index => {
  const clone = JSON.parse(JSON.stringify(conditionList.value[index]));
  conditionModel.value[FILTER_FIELD.CONDITIONS].splice(index + 1, 0, clone);
  conditionIds.value.splice(index + 1, 0, nanoid());
};

/* --------------------------------------------
   移除條件
--------------------------------------------- */
const handleRemoveCondition = index => {
  if (conditionList.value.length <= 1) {
    emit('removeSelf');
  } else {
    conditionList.value.splice(index, 1);
    conditionIds.value.splice(index, 1);
  }
};

/* --------------------------------------------
   初始化
--------------------------------------------- */
onMounted(async () => {
  // 沒值 → 初始化
  if (!conditionModel.value || Object.keys(conditionModel.value).length === 0) {
    conditionModel.value = {
      [FILTER_FIELD.OPERATOR]: OPERATOR.AND,
      [FILTER_FIELD.CONDITIONS]: []
    };

    await nextTick();
    handleAddCondition();
  }

  // 初始化時給每個 condition 生成穩定 id
  conditionIds.value = conditionList.value.map(() => nanoid());
});
</script>
