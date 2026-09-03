<template>
  <!-- route mode + tagId：切換新增、編輯與複製流程，送出由本 View 串接 API -->
  <TagForm
    ref="tagFormRef"
    :form-mode="mode"
    :submit-text="FORM_MODE_LABELS[mode]"
    :disabled-fields="disabledFields"
    :tag-id="tagId"
    :formState="formState"
    :error-code="errorCode"
    @submit="handleSubmit"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notification } from 'ant-design-vue';

// Components
import TagForm from '@/components/tag-service/tags/form/TagForm';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/tags/filter/entity/referencedTags';

// API
import { getTagConfig, createTag, updateTag } from '@/api/tag-service/tags';

// Constants
import {
  FORM_MODE,
  FORM_MODE_LABELS,
  FORM_MODE_TITLE
} from '@/pages/tag-service/constants/tags/form/formMode';
import { FORM_FIELD } from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import {
  QUERY_FIELD,
  QUERY_TYPE
} from '@/pages/tag-service/constants/tags/form/tagFormQuery/queryField';

/* --------------------------------------------
   頁面狀態
--------------------------------------------- */
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const referencedTagsStore = useReferencedTagsStore();

const tagFormRef = ref(); // TagForm 元件 ref
const formState = ref({}); // TagForm 畫面資料
const errorCode = ref(null); // 交由 TagForm 顯示的後端業務錯誤碼
const tagId = computed(() => route.params.tag ?? null); // 從路由取得標籤識別碼
const mode = computed(() => route.name);

/** 編輯模式不可更改標籤名稱、代碼與站台。 */
const disabledFields = computed(() =>
  mode.value === FORM_MODE.EDIT ? [FORM_FIELD.TAG_NAME, FORM_FIELD.TAG, FORM_FIELD.SITE] : []
);

/* --------------------------------------------
   讀取表單資料
   - API 未回傳 queryType，需依 SQL、匯入檔案或篩選器內容判斷
   - 複製模式移除既有標籤的識別與狀態欄位
--------------------------------------------- */
/** 取得既有標籤，正規化規則類型及複製模式欄位後寫入表單。 */
const fetchData = async () => {
  if (!tagId.value) return;

  try {
    errorCode.value = null;

    const { data } = await getTagConfig(tagId.value);
    const cleanedData = {
      ...data,
      [QUERY_FIELD.QUERY_SQL]: data[QUERY_FIELD.QUERY]
    };

    // 依互斥的 payload 欄位反推畫面使用的 queryType。
    if (cleanedData[QUERY_FIELD.FILE_ID]) {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.IMPORT_FILE;
      cleanedData[QUERY_FIELD.QUERY_SQL] = '';
    } else if (cleanedData[FILTER_FIELD.CONDITION]) {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.FILTER;
      cleanedData[QUERY_FIELD.QUERY_SQL] = '';
    } else {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.QUERY_SQL;
    }

    // 複製只能沿用可安全重建的設定；識別、狀態與既有檔案不可帶入。
    if (mode.value === FORM_MODE.CLONE) {
      delete cleanedData[FORM_FIELD.STATUS];
      delete cleanedData[QUERY_FIELD.FILE_ID];
      delete cleanedData[QUERY_FIELD.QUERY];
      delete cleanedData[QUERY_FIELD.QUERY_SQL];
      if (cleanedData[QUERY_FIELD.QUERY_TYPE] !== QUERY_TYPE.FILTER) {
        delete cleanedData[QUERY_FIELD.QUERY_TYPE];
      }
    }

    // referencedTags 由 store 管理顯示名稱，不保留在表單畫面狀態。
    if (cleanedData[FILTER_FIELD.REFERENCED_TAGS]) {
      referencedTagsStore.setReferencedTags(cleanedData[FILTER_FIELD.REFERENCED_TAGS]);
      delete cleanedData[FILTER_FIELD.REFERENCED_TAGS];
    }

    formState.value = cleanedData;

    document.title = `標籤 2.0｜${FORM_MODE_TITLE[mode.value]} - ${cleanedData[FORM_FIELD.TAG_NAME]}`;
  } catch (err) {
    console.error('取得 Tag 資料失敗：', err);
  }
};

/* --------------------------------------------
   路由同步
   - 手動變更 URL 時先清掉前一個標籤的表單與引用，再讀取新資料
--------------------------------------------- */
watch(
  () => route.fullPath,
  async () => {
    formState.value = {};
    referencedTagsStore.reset();

    if (mode.value !== FORM_MODE.CREATE) {
      await fetchData();
    }
  }
);

/* --------------------------------------------
   表單送出
   - Edit: 更新資料
   - Create / Clone: 新增資料
   - 後端業務錯誤碼交回 TagForm 顯示於對應欄位
--------------------------------------------- */
/** 依頁面模式新增或更新標籤，成功後同步 route／資料與頁面位置。 */
const handleSubmit = async formData => {
  try {
    errorCode.value = null;

    if (mode.value === FORM_MODE.EDIT) {
      // 編輯沿用既有 owner，完成後重抓後端正規化結果。
      formData.append(FORM_FIELD.OWNER, formState.value[FORM_FIELD.OWNER]);

      await updateTag(tagId.value, formData);

      notification.success({ message: `標籤${FORM_MODE_LABELS[mode.value]}成功` });
      await fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 新增與複製以目前登入者為 owner，成功後進入新標籤的編輯頁。
      formData.append(FORM_FIELD.OWNER, userStore.userMail);

      const res = await createTag(formData);

      notification.success({ message: `標籤${FORM_MODE_LABELS[mode.value]}成功` });
      router.push(`/tags/${res.data[FORM_FIELD.TAG]}/${FORM_MODE.EDIT}`);

      // 等待新 route 的畫面完成渲染再滾動。
      await nextTick();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  } catch (error) {
    errorCode.value = Number(error.code);
  }
};

/* --------------------------------------------
   非新增模式的初始資料載入
--------------------------------------------- */
onMounted(async () => {
  if (mode.value !== FORM_MODE.CREATE) {
    await fetchData();
  }
});
</script>
