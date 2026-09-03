<template>
  <button
    v-if="!open"
    ref="trigger"
    class="prototype-control-trigger"
    :class="{ 'is-anchored': !!rect }"
    :style="triggerStyle"
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="open"
    :aria-label="title"
    @click="openPanel"
  >
    ✳︎
  </button>

  <template v-if="open">
    <div class="prototype-control-mask" :class="{ 'is-dim': !rect }" @click="closePanel" />
    <div v-if="rect" class="prototype-control-spotlight" :style="spotlightStyle" />

    <section
      ref="panel"
      class="prototype-control-panel"
      :class="layout ? `is-${layout.placement}` : 'is-centered'"
      :style="layout?.panel"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      @keydown="handleKeydown"
    >
      <span v-if="layout" class="prototype-control-arrow" :style="layout.arrow" />

      <h2>{{ title }}</h2>
      <slot :draft="draft" />
      <footer>
        <button type="button" class="cancel-btn" @click="closePanel">取消</button>
        <button type="button" class="apply-btn" @click="apply">{{ okText }}</button>
      </footer>
    </section>
  </template>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from "vue";

const props = defineProps({
  title: { type: String, default: "預覽控制" },
  okText: { type: String, default: "重新預覽" },
  modelValue: { type: Object, default: () => ({}) },
  // 要框出的區域：元素、元件、CSS selector，或回傳前述任一者的函式。
  // 未指定時面板置中、不框出區域。
  target: { type: [Object, String, Function], default: null },
});

const emit = defineEmits(["update:modelValue", "submit"]);
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
const open = ref(false);
const draft = ref({});
const trigger = ref(null);
const panel = ref(null);
const rect = ref(null);
const panelHeight = ref(0);
let previousFocus = null;

const SPOTLIGHT_PADDING = 8;
const PANEL_WIDTH = 320;
// 面板與視窗邊緣的最小間距
const GAP = 12;
const ARROW = 6;
const ARROW_INSET = 10;
// 箭頭尖端與框線之間的間距
const ARROW_GAP = 8;
// 目標區域到面板邊緣的距離：框線外擴 + 箭頭間距 + 箭頭高度
const PANEL_OFFSET = SPOTLIGHT_PADDING + ARROW_GAP + ARROW;
// 依序取第一個放得下的方位；都放不下時取空間最大的
const PLACEMENTS = ["right", "left", "bottom", "top"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const clone = (value) => structuredClone(toRaw(value ?? {}));
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* --------------------------------------------
   量測目標區域
--------------------------------------------- */
const resolveTarget = () => {
  const raw = typeof props.target === "function" ? props.target() : props.target;
  if (!raw) return null;
  if (typeof raw === "string") return document.querySelector(raw);
  return raw.$el ?? raw;
};

// 值沒變就不寫入 rect：量測由 scroll 觸發，每次都換新物件會讓重排與量測互相觸發
const measure = () => {
  const el = resolveTarget();
  if (!el?.getBoundingClientRect) {
    rect.value = null;
    return;
  }

  const box = el.getBoundingClientRect();
  const top = Math.round(box.top);
  const left = Math.round(box.left);
  const width = Math.round(box.width);
  const height = Math.round(box.height);
  const current = rect.value;

  if (
    current &&
    current.top === top &&
    current.left === left &&
    current.width === width &&
    current.height === height
  ) {
    return;
  }

  rect.value = { top, left, width, height, right: left + width, bottom: top + height };
};

let measureFrame = null;
const scheduleMeasure = () => {
  if (measureFrame !== null) return;
  measureFrame = requestAnimationFrame(() => {
    measureFrame = null;
    measure();
  });
};

/* --------------------------------------------
   量測面板高度：決定上下方位與置中對齊都需要
--------------------------------------------- */
let panelObserver = null;

watch(open, async (isOpen) => {
  if (!isOpen) {
    panelObserver?.disconnect();
    panelHeight.value = 0;
    return;
  }

  await nextTick();
  if (!panel.value) return;

  // 取 border box：面板自身有內距，contentRect 會少算
  panelObserver ??= new ResizeObserver(() => {
    const height = Math.round(panel.value?.getBoundingClientRect().height ?? 0);
    if (height && height !== panelHeight.value) panelHeight.value = height;
  });
  panelObserver.observe(panel.value);
  panelHeight.value = Math.round(panel.value.getBoundingClientRect().height);
});

onMounted(() => {
  measure();
  window.addEventListener("scroll", scheduleMeasure, true);
  window.addEventListener("resize", scheduleMeasure);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", scheduleMeasure, true);
  window.removeEventListener("resize", scheduleMeasure);
  if (measureFrame !== null) cancelAnimationFrame(measureFrame);
  panelObserver?.disconnect();
});

watch(() => props.target, scheduleMeasure);

/* --------------------------------------------
   位置
--------------------------------------------- */
const triggerStyle = computed(() => {
  if (!rect.value) return {};
  return { left: `${rect.value.right - 14}px`, top: `${rect.value.top - 14}px` };
});

const spotlightStyle = computed(() => {
  if (!rect.value) return {};
  const r = rect.value;
  return {
    left: `${r.left - SPOTLIGHT_PADDING}px`,
    top: `${r.top - SPOTLIGHT_PADDING}px`,
    width: `${r.width + SPOTLIGHT_PADDING * 2}px`,
    height: `${r.height + SPOTLIGHT_PADDING * 2}px`,
  };
});

const layout = computed(() => {
  if (!rect.value) return null;

  const r = rect.value;
  const { innerWidth: vw, innerHeight: vh } = window;

  const height = panelHeight.value;
  const space = {
    right: vw - r.right - PANEL_OFFSET - GAP,
    left: r.left - PANEL_OFFSET - GAP,
    bottom: vh - r.bottom - PANEL_OFFSET - GAP,
    top: r.top - PANEL_OFFSET - GAP,
  };
  const need = { right: PANEL_WIDTH, left: PANEL_WIDTH, bottom: height, top: height };

  const placement =
    PLACEMENTS.find((side) => space[side] >= need[side]) ??
    PLACEMENTS.reduce((a, b) => (space[a] >= space[b] ? a : b));

  const isSide = placement === "right" || placement === "left";
  let left;
  let top;

  if (isSide) {
    left = placement === "right" ? r.right + PANEL_OFFSET : r.left - PANEL_OFFSET - PANEL_WIDTH;
    top = r.top + r.height / 2 - height / 2;
  } else {
    top = placement === "bottom" ? r.bottom + PANEL_OFFSET : r.top - PANEL_OFFSET - height;
    left = r.left + r.width / 2 - PANEL_WIDTH / 2;
  }

  left = clamp(left, GAP, Math.max(GAP, vw - PANEL_WIDTH - GAP));
  top = clamp(top, GAP, Math.max(GAP, vh - height - GAP));

  // 箭頭沿面板邊緣對齊區域中心，兩端留邊避免超出圓角
  const center = isSide ? r.top + r.height / 2 : r.left + r.width / 2;
  const start = isSide ? top : left;
  const length = isSide ? height : PANEL_WIDTH;
  const limit = Math.max(ARROW_INSET, length - ARROW * 2 - ARROW_INSET);
  const offset = clamp(center - start - ARROW, ARROW_INSET, limit);

  return {
    placement,
    panel: {
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      width: `${PANEL_WIDTH}px`,
      // 高度量到之前先隱藏，避免以錯誤位置閃現一格
      visibility: height ? null : "hidden",
    },
    arrow: isSide ? { top: `${Math.round(offset)}px` } : { left: `${Math.round(offset)}px` },
  };
});

/* --------------------------------------------
   開關
--------------------------------------------- */
const openPanel = () => {
  measure();
  draft.value = clone(model.value);
  previousFocus =
    document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : trigger.value;
  open.value = true;
  nextTick(() => panel.value?.focus());
};

const closePanel = () => {
  open.value = false;
  nextTick(() => {
    const focusTarget = previousFocus?.isConnected ? previousFocus : trigger.value;
    focusTarget?.focus();
  });
};

const apply = () => {
  const value = clone(draft.value);
  model.value = value;
  emit("submit", value);
  closePanel();
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closePanel();
    return;
  }
  if (event.key !== "Tab") return;

  const focusable = [...(panel.value?.querySelectorAll(focusableSelector) ?? [])];
  if (focusable.length === 0) {
    event.preventDefault();
    panel.value?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === panel.value)
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
</script>

<style scoped>
.prototype-control-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 1.625rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #4096ff;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  &:hover {
    opacity: 1;
  }
}

.prototype-control-trigger.is-anchored {
  position: fixed;
  z-index: 10001;
  box-shadow: 0 1px 0.25rem rgb(0 0 0 / 30%);
}

/* 攔截面板以外的點擊；未指定 target 時同時負責壓暗 */
.prototype-control-mask {
  position: fixed;
  z-index: 9999;
  inset: 0;
}

.prototype-control-mask.is-dim {
  background: rgb(0 0 0 / 45%);
}

/* 框出目標區域，其餘範圍以 box-shadow 壓暗；純視覺，不攔截點擊 */
.prototype-control-spotlight {
  position: fixed;
  z-index: 9999;
  outline: 2px solid rgb(255 255 255 / 90%);
  box-shadow: 0 0 0 9999px rgb(0 0 0 / 45%);
  pointer-events: none;
}

/* 不裁切內容，否則箭頭會被切掉；面板不捲動，高度由內容決定 */
.prototype-control-panel {
  position: fixed;
  z-index: 10000;
  padding: 0.75rem 1rem;
  border-radius: 0.3125rem;
  background: #ffffff;
  color: #5f6d7e;
  box-shadow: 0 0.375rem 1.25rem rgb(0 0 0 / 25%);
}

.prototype-control-panel.is-centered {
  top: 50%;
  left: 50%;
  width: min(480px, calc(100vw - 2.5rem));
  transform: translate(-50%, -50%);
}

.prototype-control-panel h2 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: bold;
}

/* 指向目標區域的三角形箭頭 */
.prototype-control-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 0.5rem solid transparent;
}

.is-right .prototype-control-arrow {
  left: -0.5rem;
  border-right-color: #ffffff;
}

.is-left .prototype-control-arrow {
  right: -0.5rem;
  border-left-color: #ffffff;
}

.is-bottom .prototype-control-arrow {
  top: -1rem;
  border-bottom-color: #ffffff;
}

.is-top .prototype-control-arrow {
  bottom: -1rem;
  border-top-color: #ffffff;
}

footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
  button {
    padding: 0.375rem 1rem;
    border: none;
    border-radius: 0.25rem;
    background: #4096ff;
    color: #ffffff;
    font-size: 0.875rem;
    font-weight: bold;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .cancel-btn {
    background: #f5f5f5;
    color: #5f6d7e;
  }
  .apply-btn {
    background: #ff7800;
    color: #ffffff;
  }
}
</style>
