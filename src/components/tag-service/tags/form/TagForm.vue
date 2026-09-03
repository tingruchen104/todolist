<template>
  <section class="px-12 py-8">
    <!-- 標籤表單，區塊順序為標籤設定、標籤規則、送出 -->
    <a-form
      ref="formRef"
      size="large"
      :model="formState"
      :rules="rules"
      class="flex flex-col gap-15"
    >
      <!-- 標籤設定：名稱、敘述、更新頻率、分類與同步設定 -->
      <section class="max-w-[60rem]">
        <SectionTitle class="mb-2.5">
          標籤設定
          <template #subTitle>因資安相關設定，新增標籤後需等待至隔日方可於系統下載名單</template>
        </SectionTitle>

        <a-form-item
          :name="FORM_FIELD.TAG_NAME"
          :label="FORM_FIELD_LABELS[FORM_FIELD.TAG_NAME]"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 16 }"
        >
          <a-input
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
            v-model:value="formState[FORM_FIELD.DESCRIPTION]"
            :rows="4"
            :disabled="isDisabled(FORM_FIELD.DESCRIPTION)"
            :title="isDisabled(FORM_FIELD.DESCRIPTION) ? formState[FORM_FIELD.DESCRIPTION] : ''"
          />
        </a-form-item>

        <!-- schedule.type + schedule.days：更新類型決定第二層星期／日期選項 -->
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

      <!-- 標籤規則：SQL、匯入名單或篩選器 -->
      <TagFormQuery
        v-model:form-state="formState"
        v-model:conditions-error="conditionsError"
        :tag-id="tagId"
      />

      <!-- 名單下載與表單送出，兩者皆需二次確認 -->
      <section class="flex max-w-[60rem] items-center justify-between gap-4">
        <section>
          <div v-if="formState[FORM_FIELD.STATUS] === 1">
            <a-button v-variant="'primary'" @click="handleOpenDownloadConfirm">下載名單</a-button>
            <a-modal
              v-if="formState[FORM_FIELD.STATUS] === 1"
              v-model:open="isDownloadConfirmOpen"
              ok-text="下載"
              :closable="false"
              @ok="handleDownload"
            >
              <template #title>
                <span
                  class="bg-primary mr-2 inline-flex size-7 items-center justify-center rounded-full"
                >
                  <DownloadIcon />
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

        <!-- 取消與送出，送出前先開啟確認 Modal -->
        <section class="flex items-center justify-end gap-4">
          <a-button size="large" @click="handleCancel">取消</a-button>
          <a-button type="primary" size="large" @click="handleValidate">{{ submitText }}</a-button>
          <a-modal v-model:open="isSubmitConfirmOpen" :closable="false" @ok="handleSubmit">
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
import DownloadIcon from '@/components/shared/icon/DownloadIcon';
import SectionTitle from '@/components/shared/title/SectionTitle';
import CreatableSelect from '@/components/shared/select/CreatableSelect';
import Select from '@/components/shared/select/Select';
import TagFormQuery from '@/components/tag-service/tags/form/TagFormQuery';

// Utils
import env from '@/utils/env';
import RULES from '@/utils/form/validationRules';

// Store
import { useUserStore } from '@/pages/tag-service/stores/shared/user';
import { useMetadataOptionsStore } from '@/pages/tag-service/stores/tags/shared/metadataOptions';
import { useReferencedTagsStore } from '@/pages/tag-service/stores/tags/filter/entity/referencedTags';

// Composables
import { useSchedule } from '@/pages/tag-service/composables/tags/form/useSchedule';

// API
import { downloadGroupColValuesFile } from '@/api/tag-service/tags/group-col-values-file';

// Constants
import { FORM_MODE } from '@/pages/tag-service/constants/tags/form/formMode';
import {
  FORM_FIELD,
  FORM_FIELD_LABELS
} from '@/pages/tag-service/constants/tags/form/tagForm/formField';
import { FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/shared/filterField';
import { MODULE } from '@/pages/tag-service/constants/tags/filter/module';
import {
  SCHEDULE_FIELD,
  SCHEDULE_TYPE_OPTIONS
} from '@/pages/tag-service/constants/tags/form/tagForm/scheduleField';
import { filterIndexOptionsBySite } from '@/pages/tag-service/constants/tags/form/tagForm/siteIndexRules';
import {
  QUERY_FIELD,
  QUERY_TYPE
} from '@/pages/tag-service/constants/tags/form/tagFormQuery/queryField';
import { EVENT_FILTER_FIELD } from '@/pages/tag-service/constants/tags/filter/event/filterEventField';
import { ERROR_CODE, ERROR_MESSAGE } from '@/pages/tag-service/constants/tags/shared/errorCode';

/* --------------------------------------------
   Props / v-model / Emits
--------------------------------------------- */
const props = defineProps({
  /** 表單模式，決定送出走新增或更新 */
  formMode: { type: String, required: true },
  /** 既有標籤的識別碼，新增模式為 null */
  tagId: { type: [String, null], required: true },
  /** 送出按鈕文字，由外層依模式決定 */
  submitText: { type: String, required: true },
  /** 不可更動的欄位，內容為 FORM_FIELD */
  disabledFields: { type: Array, default: () => [] }
});

const emit = defineEmits(['submit']);

/* --------------------------------------------
   Store 與表單狀態
   - formState 是畫面狀態，也是送出 payload 的資料來源
   - metadataOptions 使用本地副本，site 變動時會覆寫 index 選項
   - conditionsError 由送出前的篩選器檢查寫入，顯示於篩選器下方
--------------------------------------------- */
const userStore = useUserStore();
const metadataOptionsStore = useMetadataOptionsStore();
const referencedTagsStore = useReferencedTagsStore();

const formRef = ref();
const isDownloadConfirmOpen = ref(false);
const isSubmitConfirmOpen = ref(false);
const conditionsError = ref('');

const errorCode = defineModel('errorCode', {
  type: Number,
  default: null
});

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

/** 欄位是否由外層指定為不可更動。 */
const isDisabled = field => props.disabledFields?.includes(field);
const metadataOptions = ref({});

/* --------------------------------------------
   表單驗證規則
   - serverErrorCode 將後端業務錯誤呈現在對應欄位
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
   - 篩選器層層嵌套，子元件需能依自身 name path 觸發驗證
--------------------------------------------- */
provide('formContext', {
  validate: fields => formRef.value?.validate(fields),
  validateAll: () => formRef.value?.validate(),
  clearValidate: fields => formRef.value?.clearValidate(fields)
});

const { scheduleDayOptions } = useSchedule(formState);

/* --------------------------------------------
   Site 與 Index 選項
   - index 可選範圍由 site 決定；載入既有資料時需立即同步
--------------------------------------------- */
/** 依目前 site 篩選可用的 index；未選 site 時清空選項。 */
const syncIndexOptionsBySite = () => {
  if (formState.value[FORM_FIELD.SITE]) {
    metadataOptions.value[FORM_FIELD.INDEX] = filterIndexOptionsBySite(
      formState.value[FORM_FIELD.SITE],
      metadataOptionsStore.metadataOptions[FORM_FIELD.INDEX]
    );
  } else {
    metadataOptions.value[FORM_FIELD.INDEX] = [];
  }
};

// 載入既有標籤時 site 已有值，需 immediate 才能立即算出 index 選項。
watch(
  () => formState.value[FORM_FIELD.SITE],
  () => {
    syncIndexOptionsBySite();
  },
  { immediate: true }
);

/* --------------------------------------------
   開啟確認並下載既有標籤名單
--------------------------------------------- */
/** 開啟名單下載確認視窗。 */
const handleOpenDownloadConfirm = () => {
  isDownloadConfirmOpen.value = true;
};

/** 下載同步設定的名單，需帶操作者以供後端記錄。 */
const handleDownload = async () => {
  try {
    isDownloadConfirmOpen.value = false;
    const params = {
      [FORM_FIELD.EDITOR]: userStore.userId
    };
    await downloadGroupColValuesFile(formState.value[FORM_FIELD.TAG], params);
  } catch (_error) {
    // Request 錯誤由全域 interceptor 顯示。
  }
};

/* --------------------------------------------
   後端欄位錯誤
   - 收到業務錯誤碼後重跑對應欄位驗證，再清空錯誤碼避免重複觸發
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
   篩選器 payload
   - 先複製畫面條件再清除空值，避免送出前改動畫面狀態
   - 事件 type 只供前端切換，不進 API payload
--------------------------------------------- */
/** 遞迴移除 null、空字串及清理後為空的物件或陣列。 */
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

/** 複製整份篩選器並逐層清掉空值，不改動畫面上的資料。 */
const cleanConditionPayload = condition => {
  const cloned = JSON.parse(JSON.stringify(condition));

  cloned[FILTER_FIELD.MODULES]?.forEach(module => {
    const isEventModule = module?.[FILTER_FIELD.MODULE] === MODULE.EVENT;
    module[FILTER_FIELD.CONDITIONS]?.forEach(group => {
      if (group[FILTER_FIELD.CONDITIONS]) {
        group[FILTER_FIELD.CONDITIONS] = group[FILTER_FIELD.CONDITIONS]
          .filter(Boolean)
          .map(conditionItem => {
            const cleanedCondition = cleanEmptyFields(conditionItem);
            if (!cleanedCondition) return cleanedCondition;
            if (isEventModule) delete cleanedCondition[EVENT_FILTER_FIELD.TYPE];
            return cleanedCondition;
          })
          .filter(conditionItem => conditionItem !== undefined);
      }
    });
  });

  return cloned;
};

/* --------------------------------------------
   依實際條件重建 referencedTags
   - 送出的內容必須與篩選器裡的標籤條件完全相符
   - store 可能留有已被刪除或未使用的標籤（如帶入條件後又刪掉），不列入
--------------------------------------------- */
/**
 * 從篩選器條件蒐集實際引用到的標籤。
 *
 * @param {Object} condition - 篩選器內容
 * @returns {Object} { 標籤代碼: 顯示名稱 }
 */
const collectReferencedTags = condition => {
  const referencedTags = {};

  condition?.[FILTER_FIELD.MODULES]?.forEach(module => {
    module[FILTER_FIELD.CONDITIONS]?.forEach(group => {
      group[FILTER_FIELD.CONDITIONS]?.forEach(cond => {
        if (cond?.[FILTER_FIELD.CATEGORY] !== FORM_FIELD.TAGS) return;

        const values = cond[FILTER_FIELD.VALUES] ?? [cond[FILTER_FIELD.VALUE]];
        values.forEach(value => {
          const label = referencedTagsStore.referencedTags[value];
          if (label) referencedTags[value] = label;
        });
      });
    });
  });

  return referencedTags;
};

/* --------------------------------------------
   驗證篩選條件、組裝 FormData 與確認送出
   - 驗證通過後暫存 FormData，待使用者於確認 Modal 送出
--------------------------------------------- */
const pendingFormData = ref(null);

/**
 * 檢查篩選器是否至少有一個條件，並同步 referencedTags。
 * 規則類型不是篩選器時不檢查，直接清掉錯誤訊息。
 */
const validateFilterConditions = () => {
  if (formState.value[QUERY_FIELD.QUERY_TYPE] !== QUERY_TYPE.FILTER) {
    conditionsError.value = '';
    return;
  }

  const condition = formState.value[FILTER_FIELD.CONDITION];
  const modules = condition?.[FILTER_FIELD.MODULES] ?? [];
  const isEmpty = modules.every(module =>
    (module[FILTER_FIELD.CONDITIONS] ?? []).every(
      group => (group[FILTER_FIELD.CONDITIONS] ?? []).length === 0
    )
  );

  conditionsError.value = isEmpty ? '請至少設定一個篩選器條件' : '';
  formState.value[FILTER_FIELD.REFERENCED_TAGS] = collectReferencedTags(condition);
};

/** 加入標籤設定區塊的欄位。 */
const appendTagSettings = data => {
  data.append(FORM_FIELD.EDITOR, userStore.userId);
  data.append(FORM_FIELD.PRODUCT, formState.value[FORM_FIELD.PRODUCT]);
  data.append(FORM_FIELD.SITE, formState.value[FORM_FIELD.SITE]);
  data.append(FORM_FIELD.TAG, formState.value[FORM_FIELD.TAG]);
  data.append(FORM_FIELD.TAG_NAME, formState.value[FORM_FIELD.TAG_NAME]);
  data.append(FORM_FIELD.DESCRIPTION, formState.value[FORM_FIELD.DESCRIPTION] || '');
  data.append(FORM_FIELD.INDEX, formState.value[FORM_FIELD.INDEX]);
  data.append(QUERY_FIELD.QUERY_TYPE, formState.value[QUERY_FIELD.QUERY_TYPE]);
};

/** 加入更新設定；第二層天數依排程類型決定是否附帶。 */
const appendSchedule = data => {
  const schedule = formState.value[FORM_FIELD.SCHEDULE];
  if (!schedule?.[SCHEDULE_FIELD.TYPE]) return;

  const payload = {
    [SCHEDULE_FIELD.TYPE]: schedule[SCHEDULE_FIELD.TYPE]
  };

  if (Array.isArray(schedule[SCHEDULE_FIELD.DAYS]) && schedule[SCHEDULE_FIELD.DAYS].length) {
    payload[SCHEDULE_FIELD.DAYS] = schedule[SCHEDULE_FIELD.DAYS];
  }

  data.append(FORM_FIELD.SCHEDULE, JSON.stringify(payload));
};

/** 加入同步設定；未勾選時仍需送出空值，後端才會清除既有設定。 */
const appendGroups = data => {
  const groups = formState.value[FORM_FIELD.GROUPS];

  if (Array.isArray(groups) && groups.length) {
    groups.forEach(group => data.append(`${FORM_FIELD.GROUPS}[]`, group));
    return;
  }

  // API 以空字串表示沒有同步群組。
  data.append(`${FORM_FIELD.GROUPS}[]`, '');
};

/** 依規則類型加入 SQL、匯入檔案或篩選器內容。 */
const appendQueryRule = data => {
  const queryType = formState.value[QUERY_FIELD.QUERY_TYPE];

  if (queryType === QUERY_TYPE.QUERY_SQL && formState.value[QUERY_FIELD.QUERY_SQL]) {
    data.append(QUERY_FIELD.QUERY_SQL, formState.value[QUERY_FIELD.QUERY_SQL]);
    return;
  }

  if (queryType === QUERY_TYPE.IMPORT_FILE) {
    if (formState.value[QUERY_FIELD.FILE_ID]) {
      data.append(QUERY_FIELD.FILE_ID, formState.value[QUERY_FIELD.FILE_ID]);
    } else if (formState.value[QUERY_FIELD.FILE]?.[0]?.originFileObj) {
      data.append(QUERY_FIELD.FILE, formState.value[QUERY_FIELD.FILE][0].originFileObj);
    }
    return;
  }

  if (queryType !== QUERY_TYPE.FILTER) return;

  const condition = formState.value[FILTER_FIELD.CONDITION];
  if (condition) {
    data.append(FILTER_FIELD.CONDITION, JSON.stringify(cleanConditionPayload(condition)));
  }

  const referencedTags = formState.value[FILTER_FIELD.REFERENCED_TAGS];
  data.append(FILTER_FIELD.REFERENCED_TAGS, referencedTags ? JSON.stringify(referencedTags) : '');
};

/** 組出送出用的 FormData。 */
const createFormData = () => {
  const data = new FormData();

  appendTagSettings(data);
  appendSchedule(data);
  appendGroups(data);
  appendQueryRule(data);

  return data;
};

/** 驗證表單與篩選器，通過後開啟送出確認 Modal。 */
const handleValidate = async () => {
  validateFilterConditions();

  try {
    await formRef.value.validate();
  } catch (_error) {
    // FormItem 顯示各欄位錯誤，不另外建立重複回饋。
    return;
  }

  if (conditionsError.value) return;

  pendingFormData.value = createFormData();
  isSubmitConfirmOpen.value = true;
};

/** 確認送出，實際的 API 呼叫由外層 View 處理。 */
const handleSubmit = () => {
  isSubmitConfirmOpen.value = false;
  emit('submit', pendingFormData.value);
};

/* --------------------------------------------
   取消編輯並返回主站標籤列表
--------------------------------------------- */
/** 放棄目前表單並返回主站標籤列表。 */
const handleCancel = () => {
  window.location.href = `${env.VUE_APP_DOMAIN_URL}tag/index`;
};

/* --------------------------------------------
   補齊排程欄位的預設結構
--------------------------------------------- */
/** 避免 schedule v-model 綁定於 undefined。 */
const initializeFormState = () => {
  formState.value[FORM_FIELD.SCHEDULE] ??= {
    [SCHEDULE_FIELD.TYPE]: null,
    [SCHEDULE_FIELD.DAYS]: []
  };
};

/* --------------------------------------------
   初始化與清理
--------------------------------------------- */
onMounted(async () => {
  try {
    await metadataOptionsStore.fetchMetadataOptions();
    // index 選項會依 site 改寫，因此不可直接修改 store 內容。
    metadataOptions.value = JSON.parse(JSON.stringify(metadataOptionsStore.metadataOptions));
    syncIndexOptionsBySite();

    initializeFormState();
  } catch (_error) {
    // Request 錯誤由全域 interceptor 顯示。
  }
});

// 換頁後清除快取，避免下一個標籤沿用前一頁的 metadata。
onUnmounted(() => {
  metadataOptionsStore.reset();
});
</script>
