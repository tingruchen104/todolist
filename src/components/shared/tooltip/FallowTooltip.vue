<template>
  <section
    v-show="visible"
    ref="tooltipEl"
    class="pointer-events-none fixed z-[2147483646] rounded-sm bg-black/90 px-2 py-1 text-xs text-white transition-opacity duration-75"
    :style="{
      left: 0,
      top: 0,
      transform: `translate3d(${finalX}px, ${finalY}px, 0)`
    }"
  >
    {{ content }}
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const finalX = ref(0);
const finalY = ref(0);
const content = ref('');
const visible = ref(false);
const tooltipEl = ref(null);

let lastHoveredEl = null;
let tooltipRect = { width: 0, height: 0 };
let rafId = null;

/* ------------------------------------------
  一路往上找 title 的元素
------------------------------------------- */
function findTitleSource(el) {
  let current = el;

  while (current) {
    if (current.hasAttribute?.('title') || current.hasAttribute?.('data-original-title')) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

/* ------------------------------------------
  否還在 title source 或它的子層？
------------------------------------------- */
function isDescendant(parent, child) {
  let node = child;

  while (node) {
    if (node === parent) return true;
    node = node.parentElement;
  }

  return false;
}

/* ------------------------------------------
  離開 title source 才真正隱藏 tooltip
------------------------------------------- */
function hideTooltipIfLeaveTitleSource(event) {
  if (!lastHoveredEl) return;

  // 還在 lastHoveredEl 或子層 → 不隱藏
  if (isDescendant(lastHoveredEl, event.target)) {
    return;
  }

  // 真的離開了
  restoreTitle(lastHoveredEl);
  lastHoveredEl = null;
  visible.value = false;
}

/* ------------------------------------------
  hover change 時才處理 title + text + rect
------------------------------------------- */
function updateTooltipText(el) {
  restoreTitle(lastHoveredEl);
  lastHoveredEl = el;

  let text = null;

  if (el && el.hasAttribute('title')) {
    text = el.getAttribute('title');
    el.setAttribute('data-original-title', text);
    el.removeAttribute('title');
  } else if (el && el.hasAttribute('data-original-title')) {
    text = el.getAttribute('data-original-title');
  } else {
    visible.value = false;
    return;
  }

  if (!text?.trim()) {
    visible.value = false;
    return;
  }

  content.value = text;
  visible.value = true;

  // rect 僅量一次
  tooltipRect = tooltipEl.value?.getBoundingClientRect() || { width: 0, height: 0 };
}

/* ------------------------------------------
 取得目前元素的 cursor
------------------------------------------- */
function getCursorStyle(el) {
  if (!el) return 'default';
  return window.getComputedStyle(el).cursor || 'default';
}

/* ------------------------------------------
  根據 cursor 類型決定偏移
------------------------------------------- */
function getOffsetByCursor(cursor) {
  switch (cursor) {
    case 'pointer': // 手指
      return { x: 3, y: 19 };
    case 'text': // 輸入 I-beam
      return { x: 0, y: 12 };
    default: // auto, other
      return { x: 6, y: 17 };
  }
}

/* ------------------------------------------
  mousemove：只更新座標（rAF）
------------------------------------------- */
function handleMove(event) {
  const hovered = findTitleSource(event.target);

  // 沒找到 title → 判斷是否真的離開
  if (!hovered) {
    hideTooltipIfLeaveTitleSource(event);
    return;
  }

  // hover 改變 → 才更新 tooltip 內容與 rect
  if (hovered !== lastHoveredEl) {
    updateTooltipText(hovered);
  }

  const mouseX = event.clientX;
  const mouseY = event.clientY;

  cancelAnimationFrame(rafId);

  rafId = requestAnimationFrame(() => {
    const cursor = getCursorStyle(hovered);
    const offset = getOffsetByCursor(cursor);

    let nextX = mouseX + offset.x;
    let nextY = mouseY + offset.y;

    if (nextX + tooltipRect.width > window.innerWidth) {
      nextX = mouseX - tooltipRect.width - offset.x;
    }
    if (nextY + tooltipRect.height > window.innerHeight) {
      nextY = mouseY - tooltipRect.height - offset.y;
    }

    finalX.value = nextX;
    finalY.value = nextY;
  });
}

/* ------------------------------------------
  還原 title
------------------------------------------- */
function restoreTitle(el) {
  if (!el) return;

  const saved = el.getAttribute('data-original-title');

  if (saved !== null) {
    el.setAttribute('title', saved);
    el.removeAttribute('data-original-title');
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMove);
});
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMove);
  cancelAnimationFrame(rafId);
});
</script>
