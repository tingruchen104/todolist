<template>
  <div
    class="input-number-range"
    :class="{
      'input-number-range--focused': !!focused,
      'input-number-range--disabled': disabled
    }"
  >
    <div
      class="input-number-range__wrapper border-base hover:border-primary bg-white-100 relative flex items-center justify-start rounded-sm border-1 transition-all duration-200"
      :class="{
        '!bg-disabled': disabled
      }"
      :style="inputWrapperStyle"
    >
      <!-- start -->
      <a-form-item no-style>
        <a-input-number
          ref="startRef"
          v-model:value="start"
          v-bind="commonAttrs"
          :placeholder="startPlaceholder"
          class="input-number-range__start !border-none !bg-transparent !shadow-none"
          :disabled="disabled"
          @keydown.enter.prevent="onEnter('start')"
          @focus="onFocus('start')"
          @blur="onBlur"
        />
      </a-form-item>

      <span class="text-disabled mx-2 flex size-4 items-center justify-center"> ~ </span>

      <!-- end -->
      <a-form-item no-style>
        <a-input-number
          ref="endRef"
          v-model:value="end"
          v-bind="commonAttrs"
          :placeholder="endPlaceholder"
          class="input-number-range__end !border-none !bg-transparent !shadow-none"
          :disabled="disabled"
          @keydown.enter.prevent="onEnter('end')"
          @focus="onFocus('end')"
          @blur="onBlur"
        />
      </a-form-item>

      <!-- spotlight -->
      <span
        class="input-number-range__spotlight bg-primary absolute -bottom-px left-0 h-0.5 w-[calc((100%_-_2rem_-_0.6875rem_*_2)_/_2)] transition-all duration-300 ease-out"
        :class="{
          'translate-x-[0.6875rem]': lastFocused === 'start',
          'translate-x-[calc(100%_+_2rem_+_0.6875rem)]': lastFocused === 'end',
          'opacity-100': !!focused,
          'opacity-0': !focused
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs, ref, watch } from 'vue';
import { Form } from 'ant-design-vue';

defineOptions({
  inheritAttrs: false
});

/* =========================================================
 * Props & Emits
========================================================= */
const props = defineProps({
  value: {
    type: Array,
    default: null
  },
  disabled: Boolean
});

const emit = defineEmits(['update:value']);

/* =========================================================
 * AntDV FormItem Context（關鍵）
========================================================= */
const formItemContext = Form.useInjectFormItemContext();

/* =========================================================
 * v-model（實際的 range array）
========================================================= */
const modelValue = defineModel({
  type: Array,
  default: () => [null, null]
});

/* =========================================================
 * attrs
========================================================= */
const attrs = useAttrs();

/* =========================================================
 * refs
========================================================= */
const startRef = ref();
const endRef = ref();

/* =========================================================
 * focus 狀態
========================================================= */
const focused = ref(null); // 'start' | 'end' | null
const lastFocused = ref('start');

const onFocus = which => {
  focused.value = which;
  lastFocused.value = which;
};

/* =========================================================
 * blur（整個 component 都沒 focus 才算）
========================================================= */
const onBlur = () => {
  focused.value = null;

  requestAnimationFrame(() => {
    if (focused.value !== null) return;

    let [s, e] = modelValue.value;

    /* 半填 → 清空 */
    const halfFilled = (s == null && e != null) || (s != null && e == null);
    if (halfFilled) {
      modelValue.value = [null, null];
    } else if (s != null && e != null) {
      const startNum = Number(s);
      const endNum = Number(e);

      /* start > end → swap */
      if (!Number.isNaN(startNum) && !Number.isNaN(endNum) && startNum > endNum) {
        modelValue.value = [e, s];
      }
    }

    formItemContext?.onFieldBlur?.();
  });
};

/* =========================================================
 * Enter → 切換 focus
========================================================= */
const onEnter = which => {
  if (which === 'start') endRef.value?.focus();
  else startRef.value?.focus();
};

/* =========================================================
 * 外部 value → 內部同步
========================================================= */
watch(
  () => props.value,
  val => {
    if (!Array.isArray(val)) return;

    const next = [val[0] ?? null, val[1] ?? null];
    const curr = modelValue.value;
    if (curr[0] === next[0] && curr[1] === next[1]) return;

    modelValue.value = next;
  },
  { immediate: true }
);

/* =========================================================
 * 內部變動 → 對外 emit + 觸發 change 驗證
========================================================= */
watch(
  modelValue,
  val => {
    const prev = props.value;
    if (Array.isArray(prev) && prev[0] === val[0] && prev[1] === val[1]) return;

    emit('update:value', val);

    formItemContext?.onFieldChange?.();
  },
  { deep: true }
);

/* =========================================================
 * wrapper style
========================================================= */
const inputWrapperStyle = computed(() => attrs.style);

/* =========================================================
 * placeholder 拆分
========================================================= */
const startPlaceholder = computed(() =>
  Array.isArray(attrs.placeholder) ? attrs.placeholder[0] : attrs.placeholder
);
const endPlaceholder = computed(() =>
  Array.isArray(attrs.placeholder) ? attrs.placeholder[1] : attrs.placeholder
);

/* =========================================================
 * a-input-number attrs 過濾
========================================================= */
const commonAttrs = computed(() => {
  const {
    'placeholder': _placeholder,
    'style': _style,
    'value': _value,
    'modelValue': _modelValue,
    'onUpdate:value': _updateValue,
    'onUpdate:modelValue': _updateModelValue,
    ...rest
  } = attrs;
  return rest;
});

/* =========================================================
 * start / end computed
========================================================= */
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

  .ant-input-number {
    flex-grow: 1;
  }

  &[variant='outline'] {
    .input-number-range__wrapper {
      outline-style: solid;
      outline-width: 2px;
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
</style>

<style>
.ant-form-item-has-error {
  .input-number-range {
    .input-number-range__wrapper {
      border-color: var(--color-white-60) !important;
    }
    &[variant='outline'] {
      .input-number-range__wrapper {
        outline-color: var(--color-error-40) !important;
      }
    }
    .input-number-range__spotlight {
      background-color: var(--color-error) !important;
    }
  }
}
</style>
