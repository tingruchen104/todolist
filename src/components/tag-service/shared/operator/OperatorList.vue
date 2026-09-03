<template>
  <section class="flex w-full flex-col items-start justify-start gap-3.5">
    <!-- 運算子選單，兩項以上才需要選擇 -->
    <OperatorSelect
      v-if="items.length > 1"
      v-model:operator="operatorModel"
      :prefix="prefix"
      :suffix="suffix"
      :disabled="disabled"
    />

    <!-- 各項目由呼叫端以 slot 提供，項目之間插入運算子標籤 -->
    <template v-for="{ item, index, key, hasNext } in entries" :key="key">
      <slot :item="item" :index="index" />

      <a-tag
        v-if="hasNext"
        :color="tagColor"
        class="min-w-9 justify-center !rounded-full font-semibold uppercase"
        :class="tagClass"
      >
        {{ operatorModel }}
      </a-tag>
    </template>

    <!-- 新增按鈕，未給 addText 或已達上限時不顯示 -->
    <a-button
      v-if="canAdd"
      v-variant="addVariant"
      :disabled="disabled"
      size="small"
      shape="round"
      @click="emit('add')"
    >
      <template #icon><i class="jb_icon_add" /></template>{{ addText }}
    </a-button>
  </section>
</template>

<script setup>
import { computed } from 'vue';

// Components
import OperatorSelect from '@/components/tag-service/shared/operator/OperatorSelect';

/* --------------------------------------------
   Props / v-model / Emits
--------------------------------------------- */
const props = defineProps({
  /** 要排列的項目，內容由呼叫端以 default slot 決定 */
  items: { type: Array, default: () => [] },
  /** 與 items 索引對應的穩定 key；項目可增刪時不可使用 index */
  itemKeys: { type: Array, required: true },
  /** 項目數量上限；達上限後隱藏新增按鈕 */
  max: { type: Number, default: Infinity },
  /** 運算子選單前的說明文字 */
  prefix: { type: String, default: '' },
  /** 運算子選單後的說明文字 */
  suffix: { type: String, default: '' },
  /** 新增按鈕文字；未提供時不顯示新增按鈕 */
  addText: { type: String, default: '' },
  /** 新增按鈕的 variant */
  addVariant: { type: String, default: '' },
  /** 附加於運算子標籤的 class，供呼叫端調整位置 */
  tagClass: { type: String, default: '' },
  disabled: Boolean
});

const emit = defineEmits(['add']);

const operatorModel = defineModel('operator', {
  type: String,
  default: ''
});

/* --------------------------------------------
   組合項目、運算子標籤與新增上限
--------------------------------------------- */
/** 合併項目、穩定 key 與運算子標籤的顯示位置。 */
const entries = computed(() =>
  props.items.map((item, index) => ({
    item,
    index,
    key: props.itemKeys[index],
    hasNext: index < props.items.length - 1
  }))
);

/** 停用時改用灰色 operator 標籤。 */
const tagColor = computed(() =>
  props.disabled ? 'var(--color-white-60)' : 'var(--color-primary)'
);

/** 有新增文案且尚未達數量上限時顯示新增按鈕。 */
const canAdd = computed(() => Boolean(props.addText) && props.items.length < props.max);
</script>
