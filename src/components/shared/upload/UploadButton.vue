<template>
  <a-upload
    v-bind="$attrs"
    v-model:file-list="fileList"
    :accept="accept"
    :before-upload="beforeUpload"
    :custom-request="() => {}"
    @change="handleChange"
  >
    <!-- 上傳按鈕（可覆寫 slot="trigger"） -->
    <slot name="trigger">
      <a-button v-variant="'primary'" @click="handleTriggerClick"
        ><i class="jb_icon_go_top" />上傳檔案</a-button
      >
    </slot>

    <!-- 自訂上傳項目 -->
    <template #itemRender="{ file, actions }">
      <div
        class="group hover:bg-opacity flex items-center justify-between gap-2 rounded-sm px-2 py-1 transition-all duration-300"
      >
        <!-- 檔名 + icon -->
        <div class="flex items-center gap-1">
          <i class="jb_icon_annex text-quaternary flex size-5 items-center justify-center" />
          <p v-if="!file.url" :class="[{ '!text-error': file.status === 'error' }]">
            {{ file.name }}
          </p>
          <a
            v-else
            href="javascript:void(0)"
            :class="
              file.status === 'error'
                ? '!text-error hover:text-error-50 active:text-error-70'
                : '!text-info hover:text-info-50 active:text-info-70'
            "
            @click.prevent="() => handleDownload(file)"
          >
            {{ file.name }}
          </a>
        </div>

        <!-- 刪除按鈕 -->
        <a-button
          is-icon
          size="small"
          class="pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
          @click="() => confirmRemove(actions.remove, file)"
        >
          <i class="jb_icon_clear" />
        </a-button>
      </div>
    </template>
  </a-upload>
</template>

<script setup>
import { nextTick, watch } from 'vue';
import { message, Upload, Modal } from 'ant-design-vue';

const props = defineProps({
  accept: {
    type: String,
    default: '' // e.g. ".csv,.txt"
  },
  downloadApi: {
    type: Function,
    default: null // (file) => Promise<Blob>
  },
  fileNames: {
    type: Array, // 後端傳回的 fileId 陣列
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 1 // 上傳上限數量
  },
  maxSizeMap: {
    type: Object,
    default: () => ({}) // e.g. { '.csv': 30, '.xlsx': 14 }（單位 MB）
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

/**
 * 監聽 fileNames → 自動轉換成 Antdv fileList 格式
 */
watch(
  () => props.fileNames,
  newIds => {
    if (fileList.value.length === 0 && Array.isArray(newIds) && newIds.length > 0) {
      fileList.value = newIds.map(id => ({
        uid: id,
        name: id,
        status: 'done',
        url: id
      }));
    }
  },
  { immediate: true }
);

/**
 * 數量限制
 */
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

/**
 * 檔案格式與大小驗證
 */
const beforeUpload = file => {
  if (!props.accept) return true;

  const exts = props.accept.split(',').map(e => e.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const matchedExt = exts.find(ext => name.endsWith(ext));

  if (!matchedExt) {
    message.error(`僅支援 ${props.accept} 格式檔案`);
    return Upload.LIST_IGNORE;
  }

  const maxMB = props.maxSizeMap[matchedExt];
  if (maxMB != null && file.size / 1024 / 1024 > maxMB) {
    message.error(`${matchedExt} 檔案大小不可超過 ${maxMB}MB`);
    return Upload.LIST_IGNORE;
  }

  return true;
};

/**
 * 上傳變更事件
 */
const handleChange = info => {
  const updatedFileNames = fileList.value
    .filter(f => f.status === 'done')
    .map(f => f.uid || f.name);

  fileNames.value = updatedFileNames;
  emit('change', info);
};

/**
 * 刪除確認
 */
const confirmRemove = (removeFn, file) => {
  Modal.confirm({
    title: '檔案刪除確認',
    content: `是否確認刪除 ${file.name} ？`,
    okText: '確定',
    okType: 'danger',
    cancelText: '取消',
    icon: null,
    class: 'no-confirm-icon',
    onOk: () => {
      removeFn();
      // 同步更新外層 fileNames
      nextTick(() => {
        const updated = fileList.value.filter(f => f.status === 'done').map(f => f.uid || f.name);
        fileNames.value = updated;
        emit('change', { type: 'remove', file });
      });
    }
  });
};

/**
 * 點擊檔名 → 下載檔案
 */
const handleDownload = file => {
  if (!props.downloadApi) return;
  props.downloadApi(file);
};
</script>
