<template>
  <!-- 篩選器第三層：條件群組內的各個條件項目 -->
  <OperatorList
    v-model:operator="operatorField"
    :items="conditionList"
    :item-keys="conditionIds"
    :max="MAX_CONDITIONS"
    prefix="標籤對象須符合"
    suffix="規則："
    add-text="規則"
    tag-class="-translate-x-1/2"
    class="px-6"
    :disabled="disabled"
    @add="handleAddCondition"
  >
    <!-- 各條件項目 -->
    <template #default="{ index }">
      <section
        class="border-l-primary bg-background relative w-full rounded border-l-5 px-5 pt-2 shadow"
        :class="{ '!border-l-base bg-white-10': disabled }"
      >
        <div class="flex items-start justify-between gap-8">
          <!-- 事件條件 -->
          <FilterEventItem
            v-if="moduleValue === MODULE.EVENT"
            v-model:condition="conditionList[index]"
            :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
            :disabled="disabled"
          />

          <!-- 會員與標籤條件 -->
          <FilterEntityItem
            v-else-if="moduleValue === MODULE.ENTITY"
            v-model:condition="conditionList[index]"
            :name-prefix="[...namePrefix, FILTER_FIELD.CONDITIONS, index]"
            :site="site"
            :disabled="disabled"
          />

          <!-- 條件操作：複製、刪除 -->
          <div class="flex h-9 items-center justify-end gap-2.5">
            <a-button
              v-if="canCopyCondition"
              is-icon
              title="複製"
              :disabled="disabled"
              @click="handleCopyCondition(index)"
            >
              <template #icon><i class="jb_icon_copy" /></template>
            </a-button>

            <a-button
              is-icon
              title="刪除"
              :disabled="disabled"
              @click="handleRemoveCondition(index)"
            >
              <template #icon><i class="jb_icon_delete" /></template>
            </a-button>
          </div>
        </div>
      </section>
    </template>
  </OperatorList>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { nanoid } from 'nanoid';

// Components
import OperatorList from '@/components/tag-service/shared/operator/OperatorList';
import FilterEventItem from '@/components/tag-service/tags/filter/event/FilterEventItem';
import FilterEntityItem from '@/components/tag-service/tags/filter/entity/FilterEntityItem';

// Constants
import {
  FILTER_FIELD,
  MAX_CONDITIONS
} from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import {
  createConditions,
  createConditionItem
} from '@/pages/tag-service/constants/tags/filter/shared/filterSchema';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import { OPERATOR } from '@/pages/tag-service/constants/shared/operator';

/* --------------------------------------------
   Props / v-model / Emits
--------------------------------------------- */
defineProps({
  /** 所屬模組，決定渲染事件或會員條件元件 */
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

const conditionModel = defineModel('condition', { type: Object });
const emit = defineEmits(['removeSelf']);

/* --------------------------------------------
   運算子與條件項目
   - conditionIds 提供可增刪、複製清單的穩定 key，不與 index 綁定
--------------------------------------------- */
const operatorField = computed({
  get: () => conditionModel.value?.[FILTER_FIELD.OPERATOR] ?? OPERATOR.AND,
  set: value => {
    if (!conditionModel.value) return;
    conditionModel.value[FILTER_FIELD.OPERATOR] = value;
  }
});

const conditionList = computed(() => conditionModel.value?.[FILTER_FIELD.CONDITIONS] ?? []);
const conditionIds = ref([]);
const canCopyCondition = computed(() => conditionList.value.length < MAX_CONDITIONS);

/* --------------------------------------------
   新增、複製與移除條件項目
--------------------------------------------- */
/** 新增空條件項目並建立對應的穩定 key。 */
const handleAddCondition = () => {
  conditionList.value.push(createConditionItem());
  conditionIds.value.push(nanoid());
};

/** 深拷貝指定條件並插入其後，避免兩筆共用巢狀資料。 */
const handleCopyCondition = index => {
  const condition = JSON.parse(JSON.stringify(conditionList.value[index]));
  conditionList.value.splice(index + 1, 0, condition);
  conditionIds.value.splice(index + 1, 0, nanoid());
};

/** 移除條件；僅剩一筆時通知外層移除整個條件群組。 */
const handleRemoveCondition = index => {
  if (conditionList.value.length <= 1) {
    emit('removeSelf');
    return;
  }

  conditionList.value.splice(index, 1);
  conditionIds.value.splice(index, 1);
};

/* --------------------------------------------
   補齊條件群組並建立條件項目 key
--------------------------------------------- */
onMounted(async () => {
  if (!conditionModel.value || Object.keys(conditionModel.value).length === 0) {
    conditionModel.value = createConditions();

    await nextTick();
    handleAddCondition();
  }

  conditionIds.value = conditionList.value.map(() => nanoid());
});
</script>
