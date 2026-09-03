<template>
  <section class="max-w-[60rem]">
    <SectionTitle class="mb-2.5">標籤規則</SectionTitle>
    <!-- queryType：切換 SQL、匯入名單或篩選器，未設定 site 前停用 -->
    <a-form-item :name="QUERY_FIELD.QUERY_TYPE">
      <a-radio-group
        v-variant="'large'"
        v-model:value="formState[QUERY_FIELD.QUERY_TYPE]"
        :options="QUERY_TYPE_OPTIONS"
        :title="
          !formState[FORM_FIELD.SITE] ? `請先設定${FORM_FIELD_LABELS[FORM_FIELD.SITE]}` : undefined
        "
        :disabled="!formState[FORM_FIELD.SITE]"
      />
    </a-form-item>

    <!-- querySQL：直接輸入可於 DBR 執行的 SQL 語法 -->
    <a-form-item
      v-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.QUERY_SQL"
      :name="QUERY_FIELD.QUERY_SQL"
    >
      <a-textarea
        v-model:value="formState[QUERY_FIELD.QUERY_SQL]"
        :rows="8"
        placeholder="請輸入可在 DBR 執行的 QuerySQL 語法"
        :disabled="!formState[FORM_FIELD.SITE]"
      />
    </a-form-item>

    <!-- importFile / fileId / file：既有檔案識別或單一 csv／xlsx 新檔 -->
    <a-config-provider
      v-else-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.IMPORT_FILE"
      component-size="middle"
    >
      <div>
        <a-form-item :name="QUERY_FIELD.IMPORT_FILE">
          <UploadButton
            v-model:file-list="formState[QUERY_FIELD.FILE]"
            :file-names="fileNames"
            :download-api="handleDownloadImportFile"
            :max-count="1"
            accept=".csv,.xlsx"
            :max-size-map="{ '.csv': 30, '.xlsx': 14 }"
            :disabled="!formState[FORM_FIELD.SITE]"
            @change="handleChange"
          />
        </a-form-item>
        <div class="text-quaternary mt-2">
          <p>【匯入說明】</p>
          <ol class="list-decimal pl-8">
            <li>第一欄輸入 idno、pid、custno、jobno，請勿設定表頭。</li>
            <li>
              支援 csv 及 xlsx 格式上傳。csv 檔案大小限制 30MB，約可存 180 萬筆資料。xlsx
              檔案大小限制 14MB，約可存 100 萬筆資料。
            </li>
          </ol>
        </div>
      </div>
    </a-config-provider>

    <!-- condition：以三層條件組合產生名單，內容由 FilterLevel1 開始 -->
    <a-config-provider
      v-else-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.FILTER"
      component-size="middle"
    >
      <FilterLevel1
        v-model:conditions="formState[FILTER_FIELD.CONDITION]"
        v-model:error="conditionsErrorModel"
        :name-prefix="[FILTER_FIELD.CONDITION]"
        :site="formState[FORM_FIELD.SITE]"
        :disabled="!formState[FORM_FIELD.SITE]"
      />
    </a-config-provider>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue';

// Components
import SectionTitle from '@/components/shared/title/SectionTitle';
import UploadButton from '@/components/shared/upload/UploadButton';
import FilterLevel1 from '@/components/tag-service/tags/filter/shared/FilterLevel1';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useFilterOptionsStore } from '@/pages/tag-service/stores/tags/filter/shared/filterOptions';

// API
import { downloadFile } from '@/api/tag-service/tags/file';

// Constants
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import {
  QUERY_FIELD,
  QUERY_TYPE,
  QUERY_TYPE_OPTIONS
} from '@/pages/tag-service/constants/tags/form/tagFormQuery/queryField';

/* --------------------------------------------
   標籤規則表單狀態
--------------------------------------------- */
const props = defineProps({
  /** 既有標籤識別碼；新增模式為 null，用於判斷是否有已上傳檔案 */
  tagId: {
    type: [String, null],
    required: true
  }
});

const formState = defineModel('formState', {
  type: Object,
  required: true
});

// 篩選器整體錯誤由 TagForm 在送出前檢查並寫入。
const conditionsErrorModel = defineModel('conditionsError', {
  type: String,
  default: ''
});

/* --------------------------------------------
   使用者與篩選欄位 Store
--------------------------------------------- */
const userStore = useUserStore();
const filterOptionsStore = useFilterOptionsStore();

/* --------------------------------------------
   既有匯入檔案的顯示名稱與下載
--------------------------------------------- */
const fileNames = computed(() => {
  const fileId = formState.value?.[QUERY_FIELD.FILE_ID];
  return props.tagId && fileId ? [`tag_config_${formState.value?.[FORM_FIELD.TAG]}`] : [];
});

/** 重新選檔後清除既有 fileId，送出時改帶新檔案。 */
const handleChange = () => {
  formState.value[QUERY_FIELD.FILE_ID] = '';
};

/** 下載既有匯入名單，並帶入操作者供後端記錄。 */
const handleDownloadImportFile = async () => {
  try {
    const params = {
      [FORM_FIELD.EDITOR]: userStore.userId
    };
    await downloadFile(formState.value[FORM_FIELD.TAG], params);
  } catch (_error) {
    // Request 錯誤由全域 interceptor 顯示。
  }
};

/* --------------------------------------------
   離開頁面時清除欄位快取（Filter Options）
   - 避免不同標籤頁之間共用舊快取
--------------------------------------------- */
onBeforeUnmount(() => {
  filterOptionsStore.reset();
});
</script>
