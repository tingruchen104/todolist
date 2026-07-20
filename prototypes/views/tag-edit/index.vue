<template>
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
import TagForm from '@/components/tag-service/form/TagForm';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/filter/entity/referencedTags';

// API
import { getTagConfig, createTag, updateTag } from '@/api/tag-service/tags';

// Constants
import {
  FORM_MODE,
  FORM_MODE_LABELS,
  FORM_MODE_TITLE
} from '@/pages/tag-service/constants/form/formMode';
import { FORM_FIELD } from '@/pages/tag-service/constants/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { QUERY_FIELD, QUERY_TYPE } from '@/pages/tag-service/constants/form/tagFormQuery/queryField';

/* --------------------------------------------
   Router 與 Store 初始化
--------------------------------------------- */
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const referencedTagsStore = useReferencedTagsStore();

/* --------------------------------------------
  Ref 與響應式資料
--------------------------------------------- */
const tagFormRef = ref(); // TagForm 元件 ref
const formState = ref({}); // TagForm 資料
const errorCode = ref(null); // 錯誤代碼
// prototype 環境路由沒有 :tag 參數，帶入範例標籤代號（原頁從路由取得 tagId）
const tagId = computed(() => route.params.tag ?? 'chloe_test_filter_entity');

/* --------------------------------------------
   表單模式判斷
   （prototype 環境固定為編輯模式，原頁依路由名稱判斷）
--------------------------------------------- */
const mode = computed(() => FORM_MODE.EDIT);

/* --------------------------------------------
   需要禁用的欄位 (edit 模式)
--------------------------------------------- */
const disabledFields = computed(() =>
  mode.value === FORM_MODE.EDIT
    ? [FORM_FIELD.TAG_NAME, FORM_FIELD.TAG, FORM_FIELD.SITE]
    : []
);

/* --------------------------------------------
   資料抓取與清理函式
   - fetchData(): 根據 tagId 取得資料
   - 判斷 queryType
   - Clone 模式刪除特定欄位
--------------------------------------------- */
const fetchData = async () => {
  if (!tagId.value) return;

  try {
    errorCode.value = null;

    const { data } = await getTagConfig(tagId.value);
    const cleanedData = {
      ...data,
      [QUERY_FIELD.QUERY_SQL]: data[QUERY_FIELD.QUERY]
    };

    // 判斷 queryType
    if (cleanedData[QUERY_FIELD.FILE_ID]) {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.IMPORT_FILE;
      cleanedData[QUERY_FIELD.QUERY_SQL] = ''; // 清空 query 內容
    } else if (cleanedData[FILTER_FIELD.CONDITION]) {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.CONDITION;
      cleanedData[QUERY_FIELD.QUERY_SQL] = ''; // 清空 query 內容
    } else {
      cleanedData[QUERY_FIELD.QUERY_TYPE] = QUERY_TYPE.QUERY_SQL;
    }

    // clone 模式刪除特定欄位
    if (mode.value === FORM_MODE.CLONE) {
      delete cleanedData[FORM_FIELD.STATUS];
      delete cleanedData[QUERY_FIELD.FILE_ID];
      delete cleanedData[QUERY_FIELD.QUERY];
      delete cleanedData[QUERY_FIELD.QUERY_SQL];
      if (cleanedData[QUERY_FIELD.QUERY_TYPE] !== QUERY_TYPE.CONDITION) {
        delete cleanedData[QUERY_FIELD.QUERY_TYPE];
      }
    }

    if (cleanedData[FILTER_FIELD.REFERENCED_TAGS]) {
      referencedTagsStore.setReferencedTags(cleanedData[FILTER_FIELD.REFERENCED_TAGS]);
      delete cleanedData[FILTER_FIELD.REFERENCED_TAGS];
    }

    // 更新 formState
    formState.value = cleanedData;

    // 更新文件標題
    document.title = `標籤 2.0｜${FORM_MODE_TITLE[mode.value]} - ${cleanedData[FORM_FIELD.TAG_NAME]}`;
  } catch (err) {
    console.error('取得 Tag 資料失敗：', err);

    // 導至標籤列表頁面
    // setTimeout(() => {
    //   window.location.href = `${env.VUE_APP_DOMAIN_URL}tag/index`;
    // }, 3000);
  }
};

/* --------------------------------------------
   監聽路由變化 (手動改 URL 時刷新資料)
--------------------------------------------- */
watch(
  () => route.fullPath,
  async () => {
    // 重置表單資料
    formState.value = {};

    // 清空 referencedTags stores
    referencedTagsStore.reset();

    if (mode.value !== FORM_MODE.CREATE) {
      await fetchData();
    }
  }
);

/* --------------------------------------------
   表單送出處理函式
   - Edit: 更新資料
   - Create / Clone: 新增資料
   - 處理重複命名錯誤
--------------------------------------------- */
const handleSubmit = async formData => {
  try {
    errorCode.value = null;

    if (mode.value === FORM_MODE.EDIT) {
      // 編輯模式
      formData.append(FORM_FIELD.OWNER, formState.value[FORM_FIELD.OWNER]);

      await updateTag(tagId.value, formData);

      notification.success({ message: `標籤${FORM_MODE_LABELS[mode.value]}成功` });
      // 更新資料後重新抓取
      await fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // create / clone 模式
      formData.append(FORM_FIELD.OWNER, userStore.userMail);

      const res = await createTag(formData);

      notification.success({ message: `標籤${FORM_MODE_LABELS[mode.value]}成功` });
      // 跳轉到編輯模式頁面
      router.push(`/tags/${res.data[FORM_FIELD.TAG]}/${FORM_MODE.EDIT}`);

      // 等待畫面渲染完成再滾動
      await nextTick();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  } catch (error) {
    // console.error(error);
    errorCode.value = Number(error.code);
  }
};

onMounted(async () => {
  /* --------------------------------------------
   初始化抓資料 (非 Create 模式)
  --------------------------------------------- */
  if (mode.value !== FORM_MODE.CREATE) {
    await fetchData();
  }
});
</script>
