<template>
  <!-- 上傳按鈕與檔案清單，檔案本身由外層表單一併送出 -->
  <a-upload
    v-bind="$attrs"
    v-model:file-list="fileList"
    :accept="accept"
    :before-upload="beforeUpload"
    :custom-request="handleCustomRequest"
    @change="handleChange"
  >
    <!-- 上傳入口 -->
    <slot name="trigger">
      <a-button v-variant="'primary'" @click="handleTriggerClick">
        <i class="jb_icon_go_top" />上傳檔案
      </a-button>
    </slot>

    <!-- 檔案清單：已上傳的檔案可下載，新選擇的檔案僅顯示名稱 -->
    <template #itemRender="{ file, actions }">
      <div
        class="group hover:bg-opacity flex items-center justify-between gap-2 rounded-sm px-2 py-1 transition-all duration-300"
      >
        <!-- 檔名與狀態：既有檔案可下載，新選擇的檔案僅顯示名稱 -->
        <div class="flex items-center gap-1">
          <i class="jb_icon_annex text-quaternary flex size-5 items-center justify-center" />
          <p v-if="!file.url" :class="[{ '!text-error': file.status === 'error' }]">
            {{ file.name }}
          </p>
          <a-button
            v-else
            type="link"
            is-inline
            v-variant="file.status === 'error' ? 'error' : 'info'"
            @click="handleDownload(file)"
          >
            {{ file.name }}
          </a-button>
        </div>

        <!-- 刪除按鈕 -->
        <a-button
          is-icon
          size="small"
          title="刪除檔案"
          class="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
          @click="handleConfirmRemove(actions.remove, file)"
        >
          <template #icon><i class="jb_icon_clear" /></template>
        </a-button>
      </div>
    </template>
  </a-upload>
</template>

<script setup>
import { nextTick, watch } from 'vue';
import { message, Upload, Modal } from 'ant-design-vue';

/* --------------------------------------------
   Props / v-model
--------------------------------------------- */
const props = defineProps({
  /** 可接受的副檔名，以逗號分隔，例如 .csv,.xlsx */
  accept: {
    type: String,
    default: ''
  },
  /** 下載既有檔案的函式；未提供時檔名不可點擊 */
  downloadApi: {
    type: Function,
    default: null
  },
  /** 既有檔案的識別碼，用於初始化顯示清單 */
  fileNames: {
    type: Array,
    default: () => []
  },
  /** 檔案數量上限；達上限後點擊上傳會提示先刪除 */
  maxCount: {
    type: Number,
    default: 1
  },
  /** 各副檔名的 MB 上限，例如 { '.csv': 30 }。 */
  maxSizeMap: {
    type: Object,
    default: () => ({})
  }
});

const fileList = defineModel('fileList', {
  type: Array,
  default: () => []
});

const fileNames = defineModel('fileNames', {
  type: Array,
  default: () => []
});

const emit = defineEmits(['change']);

/* --------------------------------------------
   檔案同步
   - 既有 fileId 只在清單為空時帶入，避免覆寫使用者剛選擇的檔案
--------------------------------------------- */
watch(
  () => props.fileNames,
  fileIds => {
    if (fileList.value.length === 0 && Array.isArray(fileIds) && fileIds.length > 0) {
      fileList.value = fileIds.map(fileId => ({
        uid: fileId,
        name: fileId,
        status: 'done',
        url: fileId
      }));
    }
  },
  { immediate: true }
);

/** 檔案數量已達上限時阻止開啟檔案選擇器，並提示先刪除舊檔。 */
const handleTriggerClick = event => {
  if (fileList.value.length >= props.maxCount) {
    Modal.warning({
      title: '檔案數量已達上限',
      content:
        props.maxCount === 1
          ? `請先刪除「${fileList.value[0].name}」，再重新上傳新檔案。`
          : `最多只能上傳 ${props.maxCount} 個檔案，請先刪除再重新上傳新檔案。`,
      okText: '確定'
    });
    event.stopPropagation();
    event.preventDefault();
    return Upload.LIST_IGNORE;
  }
};

/** 檔案由外層表單送出，停用 Upload 內建 request。 */
const handleCustomRequest = () => {};

/* --------------------------------------------
   檔案驗證
   - 不合規檔案回傳 LIST_IGNORE，不加入 Upload 清單
--------------------------------------------- */
/** 依 accept 與 maxSizeMap 驗證副檔名及各格式的 MB 上限。 */
const beforeUpload = file => {
  if (!props.accept) return true;

  const acceptedExtensions = props.accept
    .split(',')
    .map(extension => extension.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const matchedExtension = acceptedExtensions.find(extension => fileName.endsWith(extension));

  if (!matchedExtension) {
    message.error(`僅支援 ${props.accept} 格式檔案`);
    return Upload.LIST_IGNORE;
  }

  const maxSizeMb = props.maxSizeMap[matchedExtension];
  if (maxSizeMb != null && file.size / 1024 / 1024 > maxSizeMb) {
    message.error(`${matchedExtension} 檔案大小不可超過 ${maxSizeMb}MB`);
    return Upload.LIST_IGNORE;
  }

  return true;
};

/** 將 Upload 清單中的已完成檔案同步為外層 fileNames。 */
const handleChange = info => {
  const updatedFileNames = fileList.value
    .filter(file => file.status === 'done')
    .map(file => file.uid || file.name);

  fileNames.value = updatedFileNames;
  emit('change', info);
};

/* --------------------------------------------
   確認刪除與下載既有檔案
--------------------------------------------- */
/** 使用者確認後刪除檔案，並在 DOM 更新後同步外層檔名。 */
const handleConfirmRemove = (remove, file) => {
  Modal.confirm({
    title: '檔案刪除確認',
    content: `是否確認刪除 ${file.name} ？`,
    okText: '確定',
    okType: 'danger',
    cancelText: '取消',
    icon: null,
    class: 'no-confirm-icon',
    onOk: () => {
      remove();
      nextTick(() => {
        fileNames.value = fileList.value
          .filter(item => item.status === 'done')
          .map(item => item.uid || item.name);
        emit('change', { type: 'remove', file });
      });
    }
  });
};

/** 已上傳檔案透過外層提供的 API 下載。 */
const handleDownload = file => {
  if (!props.downloadApi) return;
  props.downloadApi(file);
};
</script>
