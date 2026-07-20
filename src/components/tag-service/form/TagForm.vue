<template>
  <section class="px-12 py-8">
    <a-form ref="formRef" :model="formState" :rules="rules" class="flex flex-col gap-15">
      <!-- 標籤設定 -->
      <section class="max-w-[60rem]">
        <SectionTitle class="mb-2.5">
          標籤設定
          <template #hint>因資安相關設定，新增標籤後需等待至隔日方可於系統下載名單</template>
        </SectionTitle>

        <a-form-item
          :name="FORM_FIELD.TAG_NAME"
          :label="FORM_FIELD_LABELS[FORM_FIELD.TAG_NAME]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input
            size="large"
            v-model:value="formState[FORM_FIELD.TAG_NAME]"
            :disabled="isDisabled(FORM_FIELD.TAG_NAME)"
            :title="isDisabled(FORM_FIELD.TAG_NAME) ? formState[FORM_FIELD.TAG_NAME] : ''"
          />
        </a-form-item>

        <a-form-item
          :name="FORM_FIELD.TAG"
          :label="FORM_FIELD_LABELS[FORM_FIELD.TAG]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input
            size="large"
            v-model:value="formState[FORM_FIELD.TAG]"
            placeholder="請輸入半形英文、數字以及底線(_)、(.)"
            :disabled="isDisabled(FORM_FIELD.TAG)"
            :title="isDisabled(FORM_FIELD.TAG) ? formState[FORM_FIELD.TAG] : ''"
          />
        </a-form-item>

        <a-form-item
          :name="FORM_FIELD.DESCRIPTION"
          :label="FORM_FIELD_LABELS[FORM_FIELD.DESCRIPTION]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-textarea
            size="large"
            v-model:value="formState[FORM_FIELD.DESCRIPTION]"
            :rows="4"
            :disabled="isDisabled(FORM_FIELD.DESCRIPTION)"
            :title="isDisabled(FORM_FIELD.DESCRIPTION) ? formState[FORM_FIELD.DESCRIPTION] : ''"
          />
        </a-form-item>
        <a-row
          v-if="formState[FORM_FIELD.SCHEDULE]"
          class="ant-form-item custom-form-item"
          :gutter="8"
          align="top"
        >
          <a-col :span="8">
            <div class="ant-form-item-label">
              <label
                :for="`form_item_${FORM_FIELD.SCHEDULE}_${SCHEDULE_FIELD.TYPE}`"
                :class="{ 'ant-form-item-required': formMode === FORM_MODE.CREATE }"
                :title="FORM_FIELD_LABELS[FORM_FIELD.SCHEDULE]"
              >
                {{ FORM_FIELD_LABELS[FORM_FIELD.SCHEDULE] }}
              </label>
            </div>
          </a-col>
          <a-col :span="16" class="!pl-0">
            <section class="flex w-full items-start gap-2.5">
              <a-form-item
                :name="[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.TYPE]"
                :rules="rules[[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.TYPE]]"
                class="!mb-0 w-full"
              >
                <Select
                  size="large"
                  v-model:value="formState[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.TYPE]"
                  :options="SCHEDULE_TYPE_OPTIONS"
                />
              </a-form-item>

              <a-form-item
                v-if="scheduleDayOptions.length"
                :name="[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.DAYS]"
                :rules="rules[[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.DAYS]]"
                class="!mb-0 w-full"
              >
                <Select
                  mode="multiple"
                  size="large"
                  v-model:value="formState[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS]"
                  :options="scheduleDayOptions"
                />
              </a-form-item>
            </section>
          </a-col>
        </a-row>

        <a-form-item
          :name="FORM_FIELD.PRODUCT"
          :label="FORM_FIELD_LABELS[FORM_FIELD.PRODUCT]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <CreatableSelect
            size="large"
            v-model:value="formState[FORM_FIELD.PRODUCT]"
            :options="metadataOptions[FORM_FIELD.PRODUCTS]"
            :add-rules="rules[FORM_FIELD.PRODUCT]"
            :disabled="isDisabled(FORM_FIELD.PRODUCT)"
            @update:options="metadataOptions[FORM_FIELD.PRODUCTS] = $event"
          />
        </a-form-item>

        <a-form-item
          :name="FORM_FIELD.SITE"
          :label="FORM_FIELD_LABELS[FORM_FIELD.SITE]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <Select
            size="large"
            v-model:value="formState[FORM_FIELD.SITE]"
            :options="metadataOptions[FORM_FIELD.SITES]"
            :disabled="isDisabled(FORM_FIELD.SITE)"
            @change="formState[FORM_FIELD.INDEX] = null"
          />
        </a-form-item>

        <a-form-item
          :name="FORM_FIELD.INDEX"
          :label="FORM_FIELD_LABELS[FORM_FIELD.INDEX]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <Select
            size="large"
            v-model:value="formState[FORM_FIELD.INDEX]"
            :options="metadataOptions[FORM_FIELD.INDEX]"
            :disabled="isDisabled(FORM_FIELD.INDEX) || !formState[FORM_FIELD.SITE]"
          />
        </a-form-item>

        <a-form-item
          :name="FORM_FIELD.GROUPS"
          :label="FORM_FIELD_LABELS[FORM_FIELD.GROUPS]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-checkbox-group
            v-variant="'large'"
            v-model:value="formState[FORM_FIELD.GROUPS]"
            :disabled="isDisabled(FORM_FIELD.GROUPS)"
          >
            <a-checkbox
              v-for="group in metadataOptions[FORM_FIELD.GROUPS]"
              :key="group.value"
              :value="group.value"
            >
              {{ group.label }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </section>

      <!-- 標籤規則 -->
      <TagFormQuery
        v-model:form-state="formState"
        v-model:conditions-error="conditionsError"
        :tag-id="tagId"
      />

      <section class="flex max-w-[60rem] items-center justify-between gap-4">
        <section>
          <div v-if="formState[FORM_FIELD.STATUS] === 1">
            <a-button v-variant="'primary'" @click="showDownloadConfirm">下載名單</a-button>
            <a-modal
              v-if="formState[FORM_FIELD.STATUS] === 1"
              v-model:open="isDownloadConfirmOpen"
              ok-text="下載"
              @ok="handleDownload"
              :closable="false"
            >
              <template #title>
                <span
                  class="bg-primary mr-2 inline-flex size-7 items-center justify-center rounded-full"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 1.5C10 0.947715 9.55228 0.5 9 0.5C8.44771 0.5 8 0.947715 8 1.5L9 1.5L10 1.5ZM8 10.6667C8 11.219 8.44772 11.6667 9 11.6667C9.55229 11.6667 10 11.219 10 10.6667H9L8 10.6667ZM13.0404 9.70711C13.431 9.31658 13.431 8.68342 13.0404 8.29289C12.6499 7.90237 12.0168 7.90237 11.6262 8.29289L12.3333 9L13.0404 9.70711ZM9.58926 11.7441L8.88215 11.037H8.88215L9.58926 11.7441ZM8.41074 11.7441L9.11785 11.037H9.11785L8.41074 11.7441ZM6.37377 8.29289C5.98325 7.90237 5.35008 7.90237 4.95956 8.29289C4.56904 8.68342 4.56904 9.31658 4.95956 9.70711L5.66667 9L6.37377 8.29289ZM2.5 12.3333C2.5 11.781 2.05228 11.3333 1.5 11.3333C0.947715 11.3333 0.5 11.781 0.5 12.3333H1.5H2.5ZM17.5 12.3333C17.5 11.781 17.0523 11.3333 16.5 11.3333C15.9477 11.3333 15.5 11.781 15.5 12.3333H16.5H17.5ZM15.135 16.2275L14.681 15.3365L14.681 15.3365L15.135 16.2275ZM16.2275 15.135L17.1185 15.589L17.1185 15.589L16.2275 15.135ZM1.77248 15.135L0.881477 15.589L1.77248 15.135ZM2.86502 16.2275L2.41103 17.1185H2.41103L2.86502 16.2275ZM9 1.5L8 1.5L8 10.6667L9 10.6667H10L10 1.5L9 1.5ZM12.3333 9L11.6262 8.29289L8.88215 11.037L9.58926 11.7441L10.2964 12.4512L13.0404 9.70711L12.3333 9ZM8.41074 11.7441L9.11785 11.037L6.37377 8.29289L5.66667 9L4.95956 9.70711L7.70364 12.4512L8.41074 11.7441ZM9.58926 11.7441L8.88215 11.037C8.94724 10.9719 9.05276 10.9719 9.11785 11.037L8.41074 11.7441L7.70364 12.4512C8.4196 13.1671 9.5804 13.1671 10.2964 12.4512L9.58926 11.7441ZM1.5 12.3333H0.5V12.5H1.5H2.5V12.3333H1.5ZM5.5 16.5V17.5H12.5V16.5V15.5H5.5V16.5ZM16.5 12.5H17.5V12.3333H16.5H15.5V12.5H16.5ZM12.5 16.5V17.5C13.1836 17.5 13.7564 17.5008 14.2234 17.4626C14.7021 17.4235 15.1571 17.3386 15.589 17.1185L15.135 16.2275L14.681 15.3365C14.5781 15.389 14.4156 15.4403 14.0606 15.4693C13.6938 15.4992 13.2166 15.5 12.5 15.5V16.5ZM16.5 12.5H15.5C15.5 13.2166 15.4992 13.6938 15.4693 14.0606C15.4403 14.4156 15.389 14.5781 15.3365 14.681L16.2275 15.135L17.1185 15.589C17.3386 15.1571 17.4235 14.7021 17.4626 14.2234C17.5008 13.7564 17.5 13.1836 17.5 12.5H16.5ZM15.135 16.2275L15.589 17.1185C16.2475 16.783 16.783 16.2475 17.1185 15.589L16.2275 15.135L15.3365 14.681C15.1927 14.9632 14.9632 15.1927 14.681 15.3365L15.135 16.2275ZM1.5 12.5H0.5C0.5 13.1836 0.499222 13.7564 0.537382 14.2234C0.576495 14.7021 0.661435 15.1571 0.881477 15.589L1.77248 15.135L2.66349 14.681C2.61105 14.5781 2.55975 14.4156 2.53074 14.0606C2.50078 13.6938 2.5 13.2166 2.5 12.5H1.5ZM5.5 16.5V15.5C4.78343 15.5 4.30615 15.4992 3.93944 15.4693C3.5844 15.4403 3.42194 15.389 3.31901 15.3365L2.86502 16.2275L2.41103 17.1185C2.84289 17.3386 3.29785 17.4235 3.77657 17.4626C4.24362 17.5008 4.81644 17.5 5.5 17.5V16.5ZM1.77248 15.135L0.881477 15.589C1.21703 16.2475 1.75247 16.783 2.41103 17.1185L2.86502 16.2275L3.31901 15.3365C3.03677 15.1927 2.8073 14.9632 2.66349 14.681L1.77248 15.135Z"
                      fill="white"
                    />
                  </svg>
                </span>
                下載「{{ formState[FORM_FIELD.TAG_NAME] }}」
              </template>
              <div>
                <p>請遵循下列建議以保護會員資訊安全：</p>
                <ol class="list-decimal pl-4">
                  <li>檔案使用完畢後刪除：使用完畢後，請立即刪除下載的檔案，避免資訊外洩。</li>
                  <li>長時間使用請加密：若需長時間使用該檔案，請務必使用加密措施保護資料安全。</li>
                  <li>定期檢查存檔：定期檢查您的設備中儲存的檔案，刪除過期或不必要的資料。</li>
                </ol>
              </div>
            </a-modal>
          </div>
        </section>

        <!-- 送出 -->
        <section class="flex items-center justify-end gap-4">
          <a-button size="large" @click="onCancel">取消</a-button>
          <a-button type="primary" size="large" @click="onValidate">{{ submitText }}</a-button>
          <a-modal v-model:open="isSubmitConfirmOpen" @ok="onSubmit" :closable="false">
            <template #title> {{ submitText }}「{{ formState[FORM_FIELD.TAG_NAME] }}」 </template>
            <div>
              <p>
                {{ submitText }}標籤後，<span class="text-primary"
                  >檔案使用完畢請重新通知相關人員進行審核</span
                >。
              </p>
              <p>審核通過後，標籤方可進行運算。</p>
            </div>
          </a-modal>
        </section>
      </section>
    </a-form>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, provide } from 'vue';

// Components
import SectionTitle from '@/components/shared/title/SectionTitle';
import CreatableSelect from '@/components/shared/select/CreatableSelect';
import Select from '@/components/shared/select/Select';
import TagFormQuery from '@/components/tag-service/form/TagFormQuery';

// Utils
import env from '@/utils/env';
import RULES from '@/utils/form/validationRules';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/shared/metadataOptions';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/filter/entity/referencedTags';

// Composables
import { useSchedule } from '@/pages/tag-service/composables/form/useSchedule';

// API
import { downloadGroupColValuesFile } from '@/api/tag-service/tags/group-col-values-file';

// Constants
import { FORM_MODE } from '@/pages/tag-service/constants/form/formMode';
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/filter/module';
import {
  SCHEDULE_FIELD,
  SCHEDULE_TYPE_OPTIONS
} from '@/pages/tag-service/constants/form/tagForm/scheduleField';
import { filterIndexOptionsBySite } from '@/pages/tag-service/constants/form/tagForm/siteIndexRules';
import {
  QUERY_FIELD,
  QUERY_TYPE
} from '@/pages/tag-service/constants/form/tagFormQuery/queryField';
import { ERROR_CODE, ERROR_MESSAGE } from '@/pages/tag-service/constants/shared/errorCode';

/* --------------------------------------------
   Props 與 Emits
--------------------------------------------- */
const props = defineProps({
  formMode: { type: String, required: true },
  tagId: { type: [String, null], required: true },
  submitText: { type: String, required: true },
  disabledFields: { type: Array, default: () => [] }
});

const emit = defineEmits(['submit']);

/* --------------------------------------------
   Stores & Refs
--------------------------------------------- */
const userStore = useUserStore();
const metadataOptionsStore = useMetadataOptionsStore();
const referencedTagsStore = useReferencedTagsStore();

const formRef = ref();
const isDownloadConfirmOpen = ref(false);
const isSubmitConfirmOpen = ref(false);
const conditionsError = ref('');

/* --------------------------------------------
   error Model
--------------------------------------------- */
const errorCode = defineModel('errorCode', {
  type: Number,
  default: null
});

/* --------------------------------------------
   Form State Model
--------------------------------------------- */
const formState = defineModel('formState', {
  type: Object,
  default: () => ({
    [FORM_FIELD.TAG_NAME]: '',
    [FORM_FIELD.TAG]: '',
    [FORM_FIELD.DESCRIPTION]: '',
    [FORM_FIELD.SCHEDULE]: {},
    [FORM_FIELD.PRODUCT]: null,
    [FORM_FIELD.SITE]: null,
    [FORM_FIELD.INDEX]: null,
    [FORM_FIELD.GROUPS]: [],
    [QUERY_FIELD.QUERY_TYPE]: null,
    [QUERY_FIELD.QUERY_SQL]: '',
    [QUERY_FIELD.FILE_ID]: '',
    [QUERY_FIELD.FILE]: [],
    [FILTER_FIELD.CONDITION]: {},
    [FILTER_FIELD.REFERENCED_TAGS]: {}
  })
});

/* --------------------------------------------
   Disabled Field Helper
--------------------------------------------- */
const isDisabled = field => props.disabledFields?.includes(field);

/* --------------------------------------------
   選項資料
--------------------------------------------- */
const metadataOptions = ref({});

/* --------------------------------------------
   表單驗證規則
--------------------------------------------- */
const rules = {
  [FORM_FIELD.TAG_NAME]: [
    RULES.requiredText(),
    RULES.maxLength(50),
    RULES.serverErrorCode(
      () => errorCode.value,
      ERROR_CODE.TAG_NAME_DUPLICATE,
      ERROR_MESSAGE[ERROR_CODE.TAG_NAME_DUPLICATE]
    )
  ],
  [FORM_FIELD.TAG]: [
    RULES.requiredText(),
    RULES.maxLength(50),
    RULES.alphaNumUnderscoreDot(),
    RULES.noLeadingDot('名稱的開頭不得為"."'),
    RULES.serverErrorCode(
      () => errorCode.value,
      ERROR_CODE.TAG_DUPLICATE,
      ERROR_MESSAGE[ERROR_CODE.TAG_DUPLICATE]
    )
  ],
  [FORM_FIELD.DESCRIPTION]: [RULES.maxLength(100)],
  [[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.TYPE]]: [
    RULES.requiredIf(() => props.formMode === FORM_MODE.CREATE, '請選擇項目')
  ],
  [[FORM_FIELD.SCHEDULE, SCHEDULE_FIELD.DAYS]]: [RULES.requiredSelect()],
  [FORM_FIELD.PRODUCT]: [
    RULES.requiredSelect(),
    RULES.maxLength(30),
    RULES.alphaNumUnderscoreDot(),
    RULES.noLeadingDot('名稱的開頭不得為"."')
  ],
  [FORM_FIELD.SITE]: [RULES.requiredSelect()],
  [FORM_FIELD.INDEX]: [RULES.requiredSelect()],
  [QUERY_FIELD.QUERY_TYPE]: [RULES.requiredSelect()],
  [QUERY_FIELD.QUERY_SQL]: [
    RULES.requiredIf(
      () => formState.value[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.QUERY_SQL,
      '請輸入 SQL'
    )
  ]
};

/* --------------------------------------------
   提供表單驗證方法給子元件使用
--------------------------------------------- */
provide('formContext', {
  validate: fields => formRef.value?.validate(fields),
  validateAll: () => formRef.value?.validate(),
  clearValidate: fields => formRef.value?.clearValidate(fields)
});

/* --------------------------------------------
   取得更新設定選項
--------------------------------------------- */
const { scheduleDayOptions } = useSchedule(formState);

/* --------------------------------------------
   監聽 Site 變更，更新 Index 選項
--------------------------------------------- */
const syncIndexOptionsBySite = () => {
  // 根據 Site 過濾 Index 選項
  if (formState.value[FORM_FIELD.SITE]) {
    metadataOptions.value[FORM_FIELD.INDEX] = filterIndexOptionsBySite(
      formState.value[FORM_FIELD.SITE],
      metadataOptionsStore.metadataOptions[FORM_FIELD.INDEX]
    );
  } else {
    metadataOptions.value[FORM_FIELD.INDEX] = [];
  }
};

watch(
  () => formState.value[FORM_FIELD.SITE],
  () => {
    syncIndexOptionsBySite();
  },
  { immediate: true }
);

/* --------------------------------------------
   名單下載
--------------------------------------------- */
const showDownloadConfirm = () => {
  isDownloadConfirmOpen.value = true;
};

const handleDownload = async () => {
  try {
    isDownloadConfirmOpen.value = false;
    const params = {
      [FORM_FIELD.EDITOR]: userStore.userId
    };
    await downloadGroupColValuesFile(formState.value[FORM_FIELD.TAG], params);
  } catch (_error) {
    // console.error(_error);
  }
};

/* --------------------------------------------
   errorCode 監聽，表單驗證
--------------------------------------------- */
watch(
  () => errorCode.value,
  code => {
    if (code === null) return;
    formRef.value.validate([FORM_FIELD.TAG_NAME, FORM_FIELD.TAG]);
    errorCode.value = null;
  }
);

/* --------------------------------------------
   清除篩選器空的欄位
--------------------------------------------- */
const cleanEmptyFields = value => {
  if (value == null) return undefined;

  if (typeof value !== 'object' || value instanceof Date) {
    return value === '' ? undefined : value;
  }

  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(item => cleanEmptyFields(item))
      .filter(item => item !== undefined);
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  const result = {};
  Object.entries(value).forEach(([key, item]) => {
    const cleanedItem = cleanEmptyFields(item);
    if (cleanedItem !== undefined) {
      result[key] = cleanedItem;
    }
  });

  return Object.keys(result).length > 0 ? result : undefined;
};

const cleanConditionPayload = condition => {
  const cloned = JSON.parse(JSON.stringify(condition));

  cloned[FILTER_FIELD.MODULES]?.forEach(module => {
    const isEventModule = module?.module === MODULE.EVENT;
    module[FILTER_FIELD.CONDITIONS]?.forEach(group => {
      if (group[FILTER_FIELD.CONDITIONS]) {
        group[FILTER_FIELD.CONDITIONS] = group[FILTER_FIELD.CONDITIONS]
          .filter(Boolean) // 避免 null/undefined
          .map(cond => {
            const cleaned = cleanEmptyFields(cond);
            if (!cleaned) return cleaned;
            if (isEventModule) delete cleaned.type;
            return cleaned;
          })
          .filter(cond => cond !== undefined);
      }
    });
  });

  return cloned;
};

/* --------------------------------------------
   表單驗證
--------------------------------------------- */
const formData = ref(null);
const onValidate = () => {
  // 驗證篩選器 Condition (至少要有一個條件）
  if (formState.value[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.CONDITION) {
    const modules = formState.value[FILTER_FIELD.CONDITION]?.[FILTER_FIELD.MODULES] ?? [];

    const isAllEmpty = modules.every(module =>
      (module[FILTER_FIELD.CONDITIONS] ?? []).every(
        group => (group[FILTER_FIELD.CONDITIONS] ?? []).length === 0
      )
    );

    conditionsError.value = isAllEmpty ? '請至少設定一個篩選器條件' : '';

    // 同步 referencedTags 至 formState
    formState.value[FILTER_FIELD.REFERENCED_TAGS] = referencedTagsStore.referencedTags;
  }

  // 驗證全表單
  formRef.value
    .validate()
    .then(() => {
      if (conditionsError.value) return;

      const data = new FormData();

      /* --------------------------------------------
         標籤設定
      -------------------------------------------- */
      // 必填欄位
      data.append(FORM_FIELD.EDITOR, userStore.userId);
      data.append(FORM_FIELD.PRODUCT, formState.value[FORM_FIELD.PRODUCT]);
      data.append(FORM_FIELD.SITE, formState.value[FORM_FIELD.SITE]);
      data.append(FORM_FIELD.TAG, formState.value[FORM_FIELD.TAG]);
      data.append(FORM_FIELD.TAG_NAME, formState.value[FORM_FIELD.TAG_NAME]);
      data.append(FORM_FIELD.DESCRIPTION, formState.value[FORM_FIELD.DESCRIPTION] || '');
      data.append(FORM_FIELD.INDEX, formState.value[FORM_FIELD.INDEX]);
      data.append(QUERY_FIELD.QUERY_TYPE, formState.value[QUERY_FIELD.QUERY_TYPE]);

      // 更新頻率
      if (formState.value[FORM_FIELD.SCHEDULE]?.[SCHEDULE_FIELD.TYPE]) {
        const payload = {
          [SCHEDULE_FIELD.TYPE]: formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.TYPE]
        };

        // 更新天數是 [] 的話不傳
        if (
          Array.isArray(formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS]) &&
          formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS].length > 0
        ) {
          payload[SCHEDULE_FIELD.DAYS] = formState.value[FORM_FIELD.SCHEDULE][SCHEDULE_FIELD.DAYS];
        }

        data.append(FORM_FIELD.SCHEDULE, JSON.stringify(payload));
      }

      // 群組（array）
      if (
        Array.isArray(formState.value[FORM_FIELD.GROUPS]) &&
        formState.value[FORM_FIELD.GROUPS].length > 0
      ) {
        formState.value[FORM_FIELD.GROUPS].forEach(group => {
          data.append(`${FORM_FIELD.GROUPS}[]`, group);
        });
      } else {
        // 沒有勾選同步設定 -> 帶空值
        data.append(`${FORM_FIELD.GROUPS}[]`, '');
      }

      /* --------------------------------------------
         標籤規則
      ------------------------------------------- */
      // SQL 規則
      if (
        formState.value[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.QUERY_SQL &&
        formState.value[QUERY_FIELD.QUERY_SQL]
      ) {
        data.append(QUERY_FIELD.QUERY_SQL, formState.value[QUERY_FIELD.QUERY_SQL]);
      }

      // 匯入名單檔案
      if (formState.value[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.IMPORT_FILE) {
        if (formState.value[QUERY_FIELD.FILE_ID]) {
          data.append(QUERY_FIELD.FILE_ID, formState.value[QUERY_FIELD.FILE_ID]);
        } else if (
          formState.value[QUERY_FIELD.FILE]?.length &&
          formState.value[QUERY_FIELD.FILE][0].originFileObj
        ) {
          data.append(QUERY_FIELD.FILE, formState.value[QUERY_FIELD.FILE][0].originFileObj);
        }
      }

      // 篩選器
      if (formState.value[QUERY_FIELD.QUERY_TYPE] === QUERY_TYPE.CONDITION) {
        const condition = formState.value[FILTER_FIELD.CONDITION];
        if (condition) {
          const cleaned = cleanConditionPayload(condition);
          data.append(FILTER_FIELD.CONDITION, JSON.stringify(cleaned));
        }

        const referencedTags = formState.value[FILTER_FIELD.REFERENCED_TAGS];
        if (referencedTags) {
          data.append(FILTER_FIELD.REFERENCED_TAGS, JSON.stringify(referencedTags));
        } else {
          data.append(FILTER_FIELD.REFERENCED_TAGS, '');
        }
      }

      /* --------------------------------------------
         最後：開啟確認視窗
      -------------------------------------------- */
      formData.value = data;
      // console.log('formData entries:');
      // for (const [key, value] of formData.value.entries()) {
      //   try {
      //     console.log(key, JSON.parse(value));
      //   } catch {
      //     console.log(key, value);
      //   }
      // }
      isSubmitConfirmOpen.value = true;
    })
    .catch(err => console.error('validate error:', err));
};

/* --------------------------------------------
   送出表單
--------------------------------------------- */
const onSubmit = () => {
  isSubmitConfirmOpen.value = false;
  emit('submit', formData.value);
};

/* --------------------------------------------
   取消
--------------------------------------------- */
const onCancel = () => {
  window.location.href = `${env.VUE_APP_DOMAIN_URL}tag/index`;
};

/* --------------------------------------------
   初始化表單欄位
--------------------------------------------- */
const initializeFormState = () => {
  // 初始化 Schedule 欄位
  formState.value[FORM_FIELD.SCHEDULE] ??= {
    [SCHEDULE_FIELD.TYPE]: null,
    [SCHEDULE_FIELD.DAYS]: []
  };
};

/* --------------------------------------------
   初始選項載入（改為呼叫 store）
--------------------------------------------- */
onMounted(async () => {
  try {
    await metadataOptionsStore.fetchMetadataOptions();
    metadataOptions.value = JSON.parse(JSON.stringify(metadataOptionsStore.metadataOptions));
    // metadata 載入後，重新依目前 site 過濾 index 選項
    syncIndexOptionsBySite();

    initializeFormState();
  } catch (_error) {
    // console.error(_error);
  }
});

/* --------------------------------------------
   離開頁面時清除欄位快取（Filter Options）
   - 避免不同標籤頁之間共用舊快取
--------------------------------------------- */
onUnmounted(() => {
  metadataOptionsStore.reset();
});
</script>
