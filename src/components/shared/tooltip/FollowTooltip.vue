<template>
  <!-- 跟隨滑鼠的全域 tooltip，內容取自來源元素的 title -->
  <section
    v-show="visible"
    ref="tooltipEl"
    class="pointer-events-none fixed z-[2147483646] flex flex-col rounded-sm bg-black/90 px-2 py-1 text-xs leading-[1.375] whitespace-pre-line text-white transition-opacity duration-75"
    :style="{
      left: 0,
      top: 0,
      transform: `translate3d(${finalX}px, ${finalY}px, 0)`
    }"
  >
    <!-- 警示樣式：第一行加上 icon，其餘行維持一般文字 -->
    <template v-if="isWarning">
      <p class="text-warning flex items-center gap-1">
        <i class="jb_icon_alert-line -translate-y-px" />
        {{ tooltipLines[0] }}
      </p>
      <p v-for="(line, index) in tooltipLines.slice(1)" :key="`${index}-${line}`">{{ line }}</p>
    </template>
    <template v-else>{{ content }}</template>
  </section>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

/* --------------------------------------------
   路由與狀態
   - 全站僅掛載一份，透過 mousemove 判斷目前的來源元素
   - 位置與尺寸不需響應式，以模組變數保存避免多餘 render
--------------------------------------------- */
const route = useRoute();

const finalX = ref(0);
const finalY = ref(0);
const content = ref('');
const visible = ref(false);
const tooltipEl = ref(null);
const isWarning = ref(false);
const tooltipLines = computed(() => content.value.split('\n'));

let lastHoveredEl = null;
let tooltipRect = { width: 0, height: 0 };
let rafId = null;
let pointerPosition = { x: 0, y: 0 };

/* --------------------------------------------
   Tooltip 來源與內容
   - 顯示期間將來源元素的 title 移至 data-original-title，隱藏或卸載時必須還原
--------------------------------------------- */
/** 往上尋找帶有 title 或暫存 title 的祖先元素。 */
const findTitleSource = element => element.closest?.('[title], [data-original-title]') ?? null;

/** 將暫存於 data-original-title 的內容還原至 title。 */
const restoreTitle = element => {
  if (!element) return;

  const savedTitle = element.getAttribute('data-original-title');

  if (savedTitle !== null) {
    element.setAttribute('title', savedTitle);
    element.removeAttribute('data-original-title');
  }
};

/** 隱藏 tooltip 並還原來源元素的原生 title。 */
const hideTooltip = () => {
  restoreTitle(lastHoveredEl);
  lastHoveredEl = null;
  visible.value = false;
};

/* --------------------------------------------
   Tooltip 定位
   - 依游標樣式避開指標，超出視窗時翻轉並限制在 viewport 內
--------------------------------------------- */
/** 取得來源元素實際套用的 cursor 樣式。 */
const getCursorStyle = element => window.getComputedStyle(element).cursor || 'default';

/** 依 cursor 圖示範圍回傳不遮住指標的定位偏移量。 */
const getOffsetByCursor = cursor => {
  switch (cursor) {
    case 'pointer':
      return { x: 3, y: 19 };
    case 'text':
      return { x: 0, y: 12 };
    default:
      return { x: 6, y: 17 };
  }
};

/** 在下一個 animation frame 量測並限制 tooltip 於 viewport 內。 */
const scheduleTooltipPosition = sourceElement => {
  // mousemove 期間只保留下一幀的定位計算。
  cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    const cursor = getCursorStyle(sourceElement);
    const offset = getOffsetByCursor(cursor);
    const { x: mouseX, y: mouseY } = pointerPosition;

    let nextX = mouseX + offset.x;
    let nextY = mouseY + offset.y;

    if (nextX + tooltipRect.width > window.innerWidth) {
      nextX = mouseX - tooltipRect.width - offset.x;
    }
    if (nextY + tooltipRect.height > window.innerHeight) {
      nextY = mouseY - tooltipRect.height - offset.y;
    }

    finalX.value = Math.min(Math.max(0, nextX), Math.max(0, window.innerWidth - tooltipRect.width));
    finalY.value = Math.min(
      Math.max(0, nextY),
      Math.max(0, window.innerHeight - tooltipRect.height)
    );
  });
};

/* --------------------------------------------
   Tooltip 內容更新
--------------------------------------------- */
/** 接管來源元素的 title，渲染內容後重新量測並定位。 */
const updateTooltip = async element => {
  restoreTitle(lastHoveredEl);
  lastHoveredEl = element;

  let text = null;

  if (element?.hasAttribute('title')) {
    text = element.getAttribute('title');
    element.setAttribute('data-original-title', text);
    element.removeAttribute('title');
  } else if (element?.hasAttribute('data-original-title')) {
    text = element.getAttribute('data-original-title');
  } else {
    visible.value = false;
    return;
  }

  if (!text?.trim()) {
    visible.value = false;
    return;
  }

  content.value = text;
  isWarning.value = element.hasAttribute('data-tooltip-warning');
  visible.value = true;

  // 內容渲染後再量測尺寸與位置
  await nextTick();

  if (lastHoveredEl !== element || !visible.value) return;

  tooltipRect = tooltipEl.value?.getBoundingClientRect() || { width: 0, height: 0 };
  scheduleTooltipPosition(element);
};

/* --------------------------------------------
   事件與生命週期
--------------------------------------------- */
/** 游標來源改變時更新內容，停留在同一來源時只更新位置。 */
const handleMove = event => {
  const sourceElement = findTitleSource(event.target);

  if (!sourceElement) {
    hideTooltip();
    return;
  }

  pointerPosition = { x: event.clientX, y: event.clientY };

  // 來源元素變更時更新內容與尺寸
  if (sourceElement !== lastHoveredEl) updateTooltip(sourceElement);

  scheduleTooltipPosition(sourceElement);
};

onMounted(() => {
  window.addEventListener('mousemove', handleMove);
});

/** 路由切換會直接移除來源元素，沒有 mousemove 可觸發離開判斷 */
watch(() => route.fullPath, hideTooltip);

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMove);
  cancelAnimationFrame(rafId);
  hideTooltip();
});
</script>
