<template>
  <section class="max-w-[60rem]">
    <SectionTitle class="mb-2.5">標籤規則</SectionTitle>
    <!-- Radio 切換 -->
    <a-form-item :name="QUERY_FIELD.QUERY_TYPE">
      <a-radio-group
        v-variant="'large'"
        v-model:value="formState[QUERY_FIELD.QUERY_TYPE]"
        :options="queryTypeOptions"
        :title="
          !formState[FORM_FIELD.SITE] ? `請先設定${FORM_FIELD_LABELS[FORM_FIELD.SITE]}` : undefined
        "
        :disabled="!formState[FORM_FIELD.SITE]"
      />
    </a-form-item>

    <!-- QuerySQL -->
    <a-form-item
      v-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.QUERY_SQL"
      :name="QUERY_FIELD.QUERY_SQL"
    >
      <a-textarea
        size="large"
        v-model:value="formState[QUERY_FIELD.QUERY_SQL]"
        :rows="8"
        placeholder="請輸入可在 DBR 執行的 QuerySQL 語法"
        :disabled="!formState[FORM_FIELD.SITE]"
      />
    </a-form-item>

    <!-- 匯入 -->
    <div v-else-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.IMPORT_FILE">
      <a-form-item :name="QUERY_FIELD.IMPORT_FILE">
        <UploadButton
          v-model:file-list="formState[QUERY_FIELD.FILE]"
          :file-names="fileNames"
          :download-api="downloadImportFile"
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
            支援 csv 及 xlsx 格式上傳。csv 檔案大小限制 30MB，約可存 180 萬筆資料。xlsx 檔案大小限制
            14MB，約可存 100 萬筆資料。
          </li>
        </ol>
      </div>
    </div>
    <!-- Filter -->
    <FilterLevel1
      v-if="formState[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.CONDITION"
      v-model:conditions="formState[FILTER_FIELD.CONDITION]"
      v-model:error="conditionsErrorModel"
      :referenced-tags="formState[FILTER_FIELD.REFERENCED_TAGS]"
      :name-prefix="[FILTER_FIELD.CONDITION]"
      :site="formState[FORM_FIELD.SITE]"
      :disabled="!formState[FORM_FIELD.SITE]"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useFilterOptionsStore } from '@/pages/tag-service/stores/filter/shared/filterOptions';

// Components
import SectionTitle from '@/components/shared/title/SectionTitle';
import UploadButton from '@/components/shared/upload/UploadButton';
import FilterLevel1 from '@/components/tag-service/filter/shared/FilterLevel1';

// Constants & API
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import {
  QUERY_FIELD,
  QUERY_TYPE,
  QUERY_TYPE_OPTIONS
} from '@/pages/tag-service/constants/form/tagFormQuery/queryField';
import { downloadFile } from '@/api/tag-service/tags/file';

/* --------------------------------------------
   Props 與響應式資料
--------------------------------------------- */
const props = defineProps({
  tagId: {
    type: [String, null],
    required: true
  }
});

const formState = defineModel('formState', {
  type: Object,
  required: true
});

const conditionsErrorModel = defineModel('conditionsError', {
  type: String,
  default: ''
});

/* --------------------------------------------
   Store
--------------------------------------------- */
const userStore = useUserStore();
const filterOptionsStore = useFilterOptionsStore();

/* --------------------------------------------
   匯入檔案名稱
--------------------------------------------- */
const fileNames = computed(() => {
  const fileId = formState.value?.[QUERY_FIELD.FILE_ID];
  return props.tagId && fileId ? [`tag_config_${formState.value?.[FORM_FIELD.TAG]}`] : [];
});

/* --------------------------------------------
   QueryType 選項
--------------------------------------------- */
const queryTypeOptions = QUERY_TYPE_OPTIONS;

/* --------------------------------------------
   上傳檔案相關處理
--------------------------------------------- */
// 上傳列表變更時清空 fileId
const handleChange = _info => {
  formState.value[QUERY_FIELD.FILE_ID] = '';
};

// 匯入檔案下載 API
const downloadImportFile = async _file => {
  try {
    const params = {
      [FORM_FIELD.EDITOR]: userStore.userId
    };
    await downloadFile(formState.value[FORM_FIELD.TAG], params);
  } catch (_error) {
    // console.error(_error);
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
