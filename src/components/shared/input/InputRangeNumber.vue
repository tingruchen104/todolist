<template>
  <!-- 數值區間輸入，兩個 input-number 共用一個外框與底線指示 -->
  <div
    class="input-number-range"
    :class="[
      attrs.class,
      {
        'input-number-range--focused': !!focusedInput,
        'input-number-range--disabled': disabled
      }
    ]"
  >
    <div
      class="input-number-range__wrapper border-base hover:border-primary bg-white-100 relative flex items-center justify-start rounded-sm border-1 transition-all duration-200"
      :class="{
        '!bg-disabled': disabled
      }"
      :style="attrs.style"
    >
      <!-- 起始值 -->
      <a-form-item no-style>
        <a-input-number
          ref="startRef"
          v-model:value="start"
          v-bind="commonAttrs"
          :placeholder="startPlaceholder"
          class="input-number-range__start !border-none !bg-transparent !shadow-none"
          :disabled="disabled"
          @keydown.enter.prevent="handleEnter('start')"
          @focus="handleFocus('start')"
          @blur="handleBlur"
        />
      </a-form-item>

      <span class="text-disabled mx-2 flex size-4 items-center justify-center"> ~ </span>

      <!-- 結束值 -->
      <a-form-item no-style>
        <a-input-number
          ref="endRef"
          v-model:value="end"
          v-bind="commonAttrs"
          :placeholder="endPlaceholder"
          class="input-number-range__end !border-none !bg-transparent !shadow-none"
          :disabled="disabled"
          @keydown.enter.prevent="handleEnter('end')"
          @focus="handleFocus('end')"
          @blur="handleBlur"
        />
      </a-form-item>

      <!-- 焦點底線，依最後聚焦的輸入框位移 -->
      <span
        class="input-number-range__spotlight bg-primary absolute -bottom-px left-0 h-0.5 w-[calc((100%_-_2rem_-_0.6875rem_*_2)_/_2)] transition-all duration-300 ease-out"
        :class="{
          'translate-x-[0.6875rem]': lastFocused === 'start',
          'translate-x-[calc(100%_+_2rem_+_0.6875rem)]': lastFocused === 'end',
          'opacity-100': !!focusedInput,
          'opacity-0': !focusedInput
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { Form } from 'ant-design-vue';

defineOptions({
  inheritAttrs: false
});

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 區間值 [起始, 結束]，供 a-form-item 的 v-model:value 使用 */
  value: {
    type: Array,
    default: null
  },
  disabled: Boolean
});

const emit = defineEmits(['update:value']);

// 元件接管兩個 input 的事件，需主動通知外層 FormItem 驗證。
const formItemContext = Form.useInjectFormItemContext();
const modelValue = defineModel({
  type: Array,
  default: () => [null, null]
});

const attrs = useAttrs();

/* --------------------------------------------
   輸入與焦點狀態
--------------------------------------------- */
const startRef = ref();
const endRef = ref();
const focusedInput = ref(null);
const lastFocused = ref('start');
let blurFrame = null;

/** 記錄目前焦點與最後聚焦端，供整組 blur 判斷及底線定位。 */
const handleFocus = input => {
  focusedInput.value = input;
  lastFocused.value = input;
};

/** 離開整組輸入框後，清除不完整區間或校正起訖順序。 */
const handleBlur = () => {
  focusedInput.value = null;

  // 兩個輸入框之間切換會先 blur 再 focus，延後一幀才判斷是否離開整組。
  cancelAnimationFrame(blurFrame);
  blurFrame = requestAnimationFrame(() => {
    if (focusedInput.value !== null) return;

    const [startValue, endValue] = modelValue.value;

    const isPartiallyFilled =
      (startValue == null && endValue != null) || (startValue != null && endValue == null);
    if (isPartiallyFilled) {
      modelValue.value = [null, null];
    } else if (startValue != null && endValue != null) {
      const startNumber = Number(startValue);
      const endNumber = Number(endValue);

      if (!Number.isNaN(startNumber) && !Number.isNaN(endNumber) && startNumber > endNumber) {
        modelValue.value = [endValue, startValue];
      }
    }

    formItemContext?.onFieldBlur?.();
  });
};

/** Enter 在起始與結束輸入框間切換焦點，不送出外層表單。 */
const handleEnter = input => {
  if (input === 'start') endRef.value?.focus();
  else startRef.value?.focus();
};

/* --------------------------------------------
   外部 value 與內部區間雙向同步
   - 值相同時不回寫，避免 watch 互相觸發
   - 內部變更時同時通知 FormItem 執行 change 驗證
--------------------------------------------- */
watch(
  () => props.value,
  value => {
    if (!Array.isArray(value)) return;

    const nextValue = [value[0] ?? null, value[1] ?? null];
    const currentValue = modelValue.value;
    if (currentValue[0] === nextValue[0] && currentValue[1] === nextValue[1]) return;

    modelValue.value = nextValue;
  },
  { immediate: true }
);

watch(
  modelValue,
  value => {
    const previousValue = props.value;
    if (
      Array.isArray(previousValue) &&
      previousValue[0] === value[0] &&
      previousValue[1] === value[1]
    ) {
      return;
    }

    emit('update:value', value);

    formItemContext?.onFieldChange?.();
  },
  { deep: true }
);

/** placeholder 可傳單一字串，或依序提供起始／結束兩個文字。 */
const startPlaceholder = computed(() =>
  Array.isArray(attrs.placeholder) ? attrs.placeholder[0] : attrs.placeholder
);
const endPlaceholder = computed(() =>
  Array.isArray(attrs.placeholder) ? attrs.placeholder[1] : attrs.placeholder
);

/** 排除外框與 v-model 接管的 attrs，其餘轉傳給兩個 input-number。 */
const commonAttrs = computed(() => {
  const {
    'placeholder': _placeholder,
    'class': _class,
    'style': _style,
    'value': _value,
    'modelValue': _modelValue,
    'onUpdate:value': _updateValue,
    'onUpdate:modelValue': _updateModelValue,
    ...rest
  } = attrs;
  return rest;
});

/** 將兩個 input-number 分別綁定區間端點，寫入時整組替換以觸發同步。 */
const start = computed({
  get: () => modelValue.value[0],
  set: val => {
    modelValue.value = [val, modelValue.value[1]];
  }
});

const end = computed({
  get: () => modelValue.value[1],
  set: val => {
    modelValue.value = [modelValue.value[0], val];
  }
});

onBeforeUnmount(() => cancelAnimationFrame(blurFrame));
</script>

<style scoped>
.input-number-range {
  .input-number-range__start {
    :deep(input) {
      padding-right: 0;
    }
  }

  .input-number-range__end {
    :deep(input) {
      padding-left: 0;
    }
  }

  .input-number-range__start,
  .input-number-range__end {
    flex-grow: 1;
  }

  &[variant='outline'] {
    .input-number-range__wrapper {
      outline-style: solid;
      outline-width: 0.125rem;
      outline-color: var(--color-primary-10);
      outline-offset: -1px;

      border-color: transparent;
      box-shadow: var(--shadow-default);

      &:hover {
        outline-color: var(--color-primary-20);
      }
    }

    &[class*='-focused'] {
      .input-number-range__wrapper {
        outline-color: var(--color-primary-20);
      }
    }

    &[class*='-disabled'] {
      .input-number-range__wrapper {
        outline-color: var(--color-white-70);
      }
    }

    &[class*='-status-error']:not([class*='-disabled']) {
      .input-number-range__wrapper {
        outline-color: var(--color-error-40);
      }
    }
  }
}

/* FormItem 錯誤狀態 */
:global(.ant-form-item-has-error) .input-number-range {
  .input-number-range__wrapper {
    border-color: var(--color-white-60) !important;
  }

  &[variant='outline'] .input-number-range__wrapper {
    outline-color: var(--color-error-40) !important;
  }

  .input-number-range__spotlight {
    background-color: var(--color-error) !important;
  }
}
</style>
