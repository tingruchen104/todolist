<template>
  <a-select
    ref="selectRef"
    v-variant="props.variant"
    v-bind="selectAttrs"
    :value="selectedLabel || undefined"
    :open="isOpen"
    :placeholder="placeholder"
    popup-class-name="!min-w-auto !p-0"
    @click="handleTriggerClick"
    @change="handleSelectChange"
    @blur="handleBlur"
  >
    <template #dropdownRender="{ props: dropdownProps }">
      <div ref="dropdownRef" class="flex flex-col" v-bind="dropdownProps">
        <!-- 全樹搜尋結果 -->
        <a-menu
          v-if="isGlobalSearch && searchKeyword"
          mode="vertical"
          :selectedKeys="[selectedPath.at(-1)]"
          class="max-h-46 min-w-56 overflow-y-auto !border-none !py-1"
          @click="handleFlatClick"
        >
          <a-menu-item
            v-for="match in flatMatches"
            :key="match.value"
            class="group relative !my-0 !px-3 !py-1.5 !leading-[1.5rem]"
          >
            <span
              class="group-hover:text-primary block w-full transition-colors duration-300 group-[.ant-menu-item-selected]:font-semibold"
            >
              <template v-for="(part, index) in match.parts" :key="index">
                <span v-if="part.matched" class="text-primary">{{ part.text }}</span>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </a-menu-item>

          <!-- 全樹搜尋無結果 -->
          <a-empty v-if="!flatMatches.length" description="暫無資料" />
        </a-menu>

        <!-- 逐層瀏覽與當層搜尋 -->
        <div v-else class="flex items-stretch justify-center">
          <div
            v-for="(menu, index) in visibleMenus"
            :key="index"
            class="border-secondary flex flex-col border-r last:border-r-0"
          >
            <!-- 搜尋框，只出現在目前展開的最後一層 -->
            <div v-if="showLevelSearch(index)" class="p-1 !pb-0">
              <a-input :ref="setSearchInputRef" v-model:value="searchQuery" class="!border-base">
                <template #prefix>
                  <i class="jb_icon_search !text-quaternary text-sm" />
                </template>
              </a-input>
            </div>

            <!-- 階層選項：父節點顯示展開箭頭，葉節點以 title 顯示說明 -->
            <a-menu
              mode="vertical"
              :selectedKeys="[selectedPath[index]]"
              class="max-h-46 overflow-y-auto !border-none !py-1"
              @scroll="handleScroll($event, index)"
              @click="handleMenuClick($event, index)"
            >
              <a-menu-item
                v-for="item in menu"
                :key="item.value"
                class="group relative !my-0 !px-3 !py-1.5 !leading-[1.5rem]"
                :class="{
                  '!pr-1.5': item.children !== undefined,
                  'is-hovered bg-text-hover': expandedPath[index] === item.value
                }"
                @mouseenter="handleMenuMouseenter(item, index)"
              >
                <span
                  class="group-hover:text-primary block w-full transition-colors duration-300 group-[.ant-menu-item-selected]:font-semibold"
                  :class="{
                    'group-[.is-hovered]:text-primary flex items-center justify-between':
                      item.children !== undefined
                  }"
                  :title="item.children === undefined ? item.description || item.label : undefined"
                >
                  {{ item.label }}
                  <i
                    v-if="item.children !== undefined"
                    class="jb_icon_right !text-quaternary group-hover:!text-primary group-[.is-hovered]:!text-primary group-[.ant-menu-item-selected]:!text-primary ml-1 inline-block transition-colors duration-300"
                  />
                </span>
              </a-menu-item>

              <!-- 當層無任何項目 -->
              <a-empty v-if="!menu.length" description="暫無資料" />
            </a-menu>
          </div>
        </div>
      </div>
    </template>
  </a-select>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue';
import { Form } from 'ant-design-vue';

// Utils
import filterSelectOption from '@/utils/form/filterSelectOption';
import matchesQuery from '@/utils/search/matchesQuery';
import splitByQuery from '@/utils/search/splitByQuery';

// 每層每批載入的選項數量，分類樹可能上千筆。
const CASCADER_CHUNK_SIZE = 100;
// 全樹搜尋結果顯示完整路徑時使用的分隔符。
const PATH_SEPARATOR = ' / ';
/** 判斷 path 節點是否存在；0 與空字串仍視為有效值。 */
const isDefined = value => value !== null && value !== undefined;

defineOptions({ inheritAttrs: false });

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 階層選項，以 children 表示下一層 */
  options: { type: Array, default: () => [] },
  /** 展開下一層的觸發方式 */
  expandTrigger: {
    type: String,
    default: 'click',
    validator: value => ['click', 'hover'].includes(value)
  },
  /** 開啟時是否自動展開第一層第一個項目 */
  autoExpandFirst: { type: Boolean, default: true },
  /** 選擇框顯示完整路徑或僅顯示最後一層 */
  showFullLabel: { type: Boolean, default: false },
  placeholder: { type: String, default: '請選擇' },
  variant: String,
  /** 傳出的值：path 為整條路徑的陣列，leaf 只給選到的那一層 */
  valueMode: {
    type: String,
    default: 'path',
    validator: value => ['path', 'leaf'].includes(value)
  },
  /**
   * 搜尋範圍
   *   - level：在面板中搜尋目前層級
   *   - all：由選擇框搜尋完整樹，並以單欄顯示結果
   */
  searchScope: {
    type: String,
    default: 'level',
    validator: value => ['level', 'all'].includes(value)
  }
});

const modelValue = defineModel('value');

/* --------------------------------------------
   下拉選單狀態
   - selectedPath 是已確認的值，expandedPath 是目前瀏覽位置；展開其他層級不應改變選值
--------------------------------------------- */
const attrs = useAttrs();
const formItemContext = Form.useInjectFormItemContext();

const isOpen = ref(false);
const selectRef = ref(null);
const dropdownRef = ref(null);
const searchInputRef = ref(null);
const searchQuery = ref('');
const selectedPath = ref([]);
const expandedPath = ref([]);
const loadedCountMap = ref({});

/** 更新內部搜尋字串，並保留呼叫端傳入的 onSearch listener。 */
const handleSearch = value => {
  searchQuery.value = value;
  attrs.onSearch?.(value);
};

const searchKeyword = computed(() => searchQuery.value.trim());
const isGlobalSearch = computed(() => props.searchScope === 'all');

/** 依搜尋模式提供 a-select 的搜尋契約。 */
const selectAttrs = computed(() => {
  const {
    filterOption: _filterOption,
    onSearch: _onSearch,
    searchValue: _searchValue,
    showSearch: _showSearch,
    ...attributes
  } = attrs;

  return {
    ...attributes,
    filterOption: false,
    showSearch: isGlobalSearch.value,
    ...(isGlobalSearch.value && {
      searchValue: searchQuery.value,
      onSearch: handleSearch
    })
  };
});

/* --------------------------------------------
   選項與搜尋結果
--------------------------------------------- */
/** 依已展開的 path 建立每一層要顯示的選單。 */
const menus = computed(() => {
  const levels = [];
  let options = props.options;

  for (const value of expandedPath.value) {
    levels.push(options);
    const selectedOption = options.find(option => option.value === value);
    if (!selectedOption || selectedOption.children === undefined) return levels;
    options = selectedOption.children;
  }

  levels.push(options);
  return levels;
});

/** 當層搜尋只篩選最後一層；其餘選單依已載入數量顯示。 */
const visibleMenus = computed(() =>
  menus.value.map((menu, index) => {
    const isSearchingCurrentLevel =
      !isGlobalSearch.value && index === menus.value.length - 1 && searchKeyword.value;

    if (isSearchingCurrentLevel) {
      return menu.filter(option => filterSelectOption(searchKeyword.value, option));
    }

    return menu.slice(0, loadedCountMap.value[index] ?? CASCADER_CHUNK_SIZE);
  })
);

/** 全樹搜尋只收集可選的葉節點，並保留完整路徑供顯示與選值。 */
const flatMatches = computed(() => {
  if (!isGlobalSearch.value || !searchKeyword.value) return [];

  const matches = [];

  /** 遞迴收集所有命中葉節點及其完整 path。 */
  const collectMatches = (options, ancestors = []) => {
    options.forEach(option => {
      const path = [...ancestors, option];

      if (option.children !== undefined) {
        collectMatches(option.children, path);
        return;
      }

      const label = path.map(item => item.label).join(PATH_SEPARATOR);
      if (!matchesQuery(label, searchKeyword.value)) return;

      matches.push({
        value: option.value,
        path: path.map(item => item.value),
        parts: splitByQuery(label, searchKeyword.value)
      });
    });
  };

  collectMatches(props.options);
  return matches;
});

/** 將已選 path 還原為選項，供 label 與 title 共用。 */
const selectedOptions = computed(() => {
  const pathOptions = [];
  let options = props.options;

  for (const value of selectedPath.value) {
    const selectedOption = options.find(option => option.value === value);
    if (!selectedOption) break;

    pathOptions.push(selectedOption);
    options = selectedOption.children ?? [];
  }

  return pathOptions;
});

const selectedLabel = computed(() => {
  const labels = selectedOptions.value.map(option => option.label);
  if (!labels.length) return '';
  return props.showFullLabel ? labels.join(PATH_SEPARATOR) : labels.at(-1) || '';
});

const selectedTitle = computed(() => {
  const titles = selectedOptions.value.map(option => option.description || option.label);
  if (!titles.length) return '';
  return props.showFullLabel ? titles.join(PATH_SEPARATOR) : titles.at(-1) || '';
});

/** leaf mode 收到外部 scalar 時，反查它在選項樹中的完整 path。 */
const findOptionPath = (options, target, ancestors = []) => {
  for (const option of options) {
    const path = [...ancestors, option.value];
    if (option.value === target) return path;

    const childPath = option.children ? findOptionPath(option.children, target, path) : null;
    if (childPath) return childPath;
  }

  return null;
};

/** 依 valueMode 將外部 path 或 leaf value 正規化為內部完整路徑。 */
const resolveSelectedPath = value => {
  if (props.valueMode === 'leaf') {
    return isDefined(value) ? (findOptionPath(props.options, value) ?? []) : [];
  }

  return Array.isArray(value) ? [...value] : null;
};

/* --------------------------------------------
   階層展開與搜尋
--------------------------------------------- */
let hoverTimer = null;
let closeTimer = null;

/** 展開指定層級後清除更深的 path、當層搜尋與滾動位置。 */
const expandMenu = (key, levelIndex) => {
  expandedPath.value = [...expandedPath.value.slice(0, levelIndex), key];
  searchQuery.value = '';
  loadedCountMap.value[levelIndex + 1] = CASCADER_CHUNK_SIZE;
  resetScroll();
};

/** hover 停留 150ms 才展開，避免游標經過時連續切換層級。 */
const handleHoverExpand = (key, levelIndex) => {
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (expandedPath.value[levelIndex] !== key) {
      expandMenu(key, levelIndex);
    }
  }, 150);
};

/** 當層搜尋框只出現在目前展開的最後一層。 */
const showLevelSearch = index => !isGlobalSearch.value && index === menus.value.length - 1;

/** hover 模式只有具有 children 的節點會展開下一層。 */
const handleMenuMouseenter = (item, levelIndex) => {
  if (props.expandTrigger === 'hover' && item.children !== undefined) {
    handleHoverExpand(item.value, levelIndex);
  }
};

/* --------------------------------------------
   選值與下拉選單控制
--------------------------------------------- */
/** 依 valueMode 對外送出完整 path 或葉節點值。 */
const commitSelection = path => {
  selectedPath.value = [...path];
  modelValue.value = props.valueMode === 'leaf' ? path.at(-1) : [...path];

  formItemContext?.onFieldChange?.();
};

/** 延後清除 focus class，讓關閉動畫完成後再重設搜尋狀態。 */
const closeDropdown = () => {
  isOpen.value = false;

  // Select 搜尋字會蓋住選取值；全樹搜尋需在關閉時立即清除。
  if (isGlobalSearch.value) searchQuery.value = '';

  clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    selectRef.value?.$el?.classList.remove('ant-select-focused');
    searchQuery.value = '';
  }, 300);
};

/** 點擊父節點時展開，點擊葉節點時提交完整選取路徑。 */
const handleMenuClick = (event, levelIndex) => {
  const key = event.key;
  const menu = menus.value[levelIndex];
  const item = menu.find(option => option.value === key);
  if (!item) return;

  if (item.children !== undefined) {
    if (props.expandTrigger === 'click') {
      event.domEvent.stopPropagation();
      expandMenu(key, levelIndex);
    }

    return;
  }

  commitSelection([...expandedPath.value.slice(0, levelIndex), key]);
  closeDropdown();
};

/** 全樹搜尋結果以 leaf value 反查命中 path 並提交選值。 */
const handleFlatClick = event => {
  const match = flatMatches.value.find(item => item.value === event.key);
  if (!match) return;

  expandedPath.value = [...match.path];
  commitSelection(match.path);
  closeDropdown();
};

/** a-select 清空時同步清除路徑、v-model 與 FormItem 驗證狀態。 */
const handleSelectChange = value => {
  if (value !== undefined) return;

  selectedPath.value = [];
  expandedPath.value = [];
  modelValue.value = props.valueMode === 'leaf' ? undefined : [];
  formItemContext?.onFieldChange?.();
  closeDropdown();
};

/** 關閉下拉並通知 FormItem 執行 blur 驗證。 */
const handleBlur = () => {
  isOpen.value = false;
  formItemContext?.onFieldBlur?.();
};

/** 點擊選擇框開啟下拉，點擊自訂 dropdown 內容時不重複觸發。 */
const handleTriggerClick = event => {
  if (dropdownRef.value?.contains(event.target)) return;

  isOpen.value = true;
};

/** 將各層選單的捲動位置歸零。 */
const resetScroll = () => {
  dropdownRef.value?.querySelectorAll('.ant-menu')?.forEach(menu => {
    menu.scrollTop = 0;
  });
};

/** 清除各層分批載入數量並重設捲動位置。 */
const resetLoadedMenus = () => {
  loadedCountMap.value = {};
  resetScroll();
};

/** 保存最後一層搜尋輸入框的實際 input ref，供開啟時自動聚焦。 */
const setSearchInputRef = input => {
  searchInputRef.value = input;
};

/* --------------------------------------------
   分段載入
--------------------------------------------- */
/** 指定層級捲動接近底部時載入下一批選項。 */
const handleScroll = (event, level) => {
  const menu = menus.value[level] || [];
  const loaded = loadedCountMap.value[level] ?? CASCADER_CHUNK_SIZE;
  const listElement = event.target;
  const isNearBottom =
    listElement.scrollTop + listElement.clientHeight >= listElement.scrollHeight - 20;

  if (loaded < menu.length && isNearBottom) {
    loadedCountMap.value[level] = loaded + CASCADER_CHUNK_SIZE;
  }
};

/* --------------------------------------------
   狀態同步
--------------------------------------------- */
/** 外部值或選項更新時，同步內部選取與展開路徑。 */
watch(
  [modelValue, () => props.options],
  ([value]) => {
    const path = resolveSelectedPath(value);

    if (path === null) return;

    selectedPath.value = path;
    expandedPath.value = [...path];
    resetLoadedMenus();
  },
  { immediate: true }
);

/** 開啟時還原已選路徑或預設第一層，當層搜尋同時對焦輸入框。 */
watch(isOpen, async open => {
  if (open) {
    const hasValidSelectedPath =
      Array.isArray(selectedPath.value) && selectedPath.value.some(isDefined);

    if (hasValidSelectedPath) {
      expandedPath.value = [...selectedPath.value];
    } else if (props.autoExpandFirst) {
      const first = props.options[0]?.value;
      if (first !== undefined) expandedPath.value = [first];
    }
  } else {
    searchQuery.value = '';
    resetLoadedMenus();
  }

  await nextTick();
  if (open && !isGlobalSearch.value) searchInputRef.value?.focus?.();
});

/** a-select 預設 title 只有顯示值，改為選項提供的完整階層說明。 */
watch(
  selectedTitle,
  async () => {
    await nextTick();

    const root = selectRef.value?.$el;
    if (!root) return;

    const selectionItem = root.querySelector('.ant-select-selection-item');
    if (!selectionItem) return;

    const title = selectedTitle.value || '';
    if (!title) selectionItem.removeAttribute('title');
    else selectionItem.setAttribute('title', title);
  },
  { immediate: true }
);

/** 點擊 trigger 與 dropdown 之外的區域時關閉選單。 */
const handleClickOutside = event => {
  const dropdownElement = dropdownRef.value;
  const triggerElement = selectRef.value?.$el;
  const clickedInsideDropdown = dropdownElement?.contains(event.target);
  const clickedInsideTrigger = triggerElement?.contains(event.target);

  if (!clickedInsideDropdown && !clickedInsideTrigger) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => {
  clearTimeout(hoverTimer);
  clearTimeout(closeTimer);
  document.removeEventListener('click', handleClickOutside);
});
</script>
