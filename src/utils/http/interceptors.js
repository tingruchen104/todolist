import { notification, Modal } from 'ant-design-vue';

// Utils
import env from '@/utils/env';
import { HTTP_STATUS_CODE_ENUM } from '@/utils/http/constants/statusCode';

// Store
import { useLoadingStore } from '@/stores/loading';

// 多個 request 同時 401 時只顯示一個登入逾時 Modal
let isSessionExpiryModalOpen = false;

/* --------------------------------------------
   通知去重
   - 併發 request 失敗時會產生多筆相同內容的通知
   - 以內容組成 key，同一則通知關閉後才允許再次出現
--------------------------------------------- */
const showingNotificationKeys = new Set();

/** 以類型與文字內容組出通知的唯一 key。 */
function buildNotificationKey(type, message, description) {
  const normalizedMessage = (message ?? '').toString().trim();
  const normalizedDescription = (description ?? '').toString().trim();
  return `${type}::${normalizedMessage}::${normalizedDescription}`;
}

/**
 * 顯示通知，內容相同者在關閉前不重複顯示。
 *
 * @param {'success'|'error'|'warning'|'info'|'open'} type
 * @param {{message?:string, description?:string, duration?:number}} options
 */
function notifyOnce(type, options = {}) {
  const { message, description, duration } = options;
  const key = buildNotificationKey(type, message, description);

  if (showingNotificationKeys.has(key)) return;

  showingNotificationKeys.add(key);

  notification[type]({
    key,
    message,
    description,
    duration,
    onClose: () => {
      showingNotificationKeys.delete(key);
    }
  });
}

/**
 * 掛上全域 request 與 response 攔截器。
 * 正式與 mock service 共用，確保 loading、錯誤通知與登入逾時行為一致。
 *
 * @param {Object} service - axios instance 或具有相同 interceptors 介面的物件
 */
export default function applyInterceptors(service) {
  /* --------------------------------------------
     Request 攔截器
     - 顯示全域 loading，可由 config.hideLoading 關閉
  --------------------------------------------- */
  service.interceptors.request.use(
    config => {
      if (config.hideLoading !== true) {
        useLoadingStore().show();
      }
      return config;
    },
    error => {
      if (error.config?.hideLoading !== true) {
        useLoadingStore().hide();
      }
      return Promise.reject(error);
    }
  );

  /* --------------------------------------------
     Response 攔截器
     - 成功時回傳 envelope 本身，呼叫端以 { data, metadata } 取值
     - POST 回傳字串視為操作結果訊息，直接顯示成功通知
     - 錯誤統一在此顯示通知，呼叫端只需處理需要額外提示的情境
  --------------------------------------------- */
  service.interceptors.response.use(
    async response => {
      if (response.config.hideLoading !== true) {
        useLoadingStore().hide();
      }

      const method = response.config.method?.toUpperCase();
      const contentType = response.headers['content-type'] || '';

      /* Blob request 可能以 JSON 回傳錯誤內容 */
      if (response.config.responseType === 'blob' && contentType.includes('application/json')) {
        try {
          const text = await response.data.text();
          const parsed = JSON.parse(text);
          const status = response.status || 500;
          return Promise.reject({ response: { status, data: parsed } });
        } catch (_error) {
          return Promise.reject({
            response: { status: 500, data: { error: { message: '無法解析伺服器回應' } } }
          });
        }
      }

      if (response.config.responseType === 'blob') {
        return response;
      }

      const payload = response.data;

      // 正常 envelope：{ data, metadata }
      if (payload && payload.data !== undefined) {
        if (method === 'POST' && typeof payload.data === 'string') {
          notifyOnce('success', { message: payload.data });
        }
        return payload;
      }

      // 業務錯誤：HTTP 200 但 envelope 帶 error
      if (payload?.error) {
        const notificationTitle = `系統錯誤 - ${payload.error.code || '未知狀態'}`;
        notifyOnce('error', {
          message: notificationTitle,
          description: payload.error.message || '未知錯誤'
        });
        console.error(`API Error: ${notificationTitle}`, payload.error);
        return Promise.reject(payload.error);
      }

      notifyOnce('error', {
        message: '系統錯誤',
        description: '未知 API 錯誤'
      });
      console.error('API Error: 未知 API 錯誤', response);
      return Promise.reject({ error: { message: '未知 API 錯誤' } });
    },

    error => {
      if (error.config?.hideLoading !== true) {
        useLoadingStore().hide();
      }

      const status = error.response?.status || 0;
      const data = error.response?.data;
      // 錯誤內容可能在 data.error、data.data.error，或 data 本身
      const responseError =
        data?.error ||
        data?.data?.error ||
        (data && typeof data === 'object' && 'message' in data ? data : null);

      if (status === HTTP_STATUS_CODE_ENUM.Unauthorized && !isSessionExpiryModalOpen) {
        isSessionExpiryModalOpen = true;

        Modal.warning({
          title: '登入逾時',
          content: '為維護您的帳戶安全，系統因長時間未操作而自動登出，請重新登入。',
          okText: '重新登入',
          maskClosable: false,
          onOk: () => {
            isSessionExpiryModalOpen = false;
            window.location.href = `${env.VUE_APP_DOMAIN_URL}login`;
          },
          onCancel: () => {
            isSessionExpiryModalOpen = false;
          }
        });

        return Promise.reject({ error: { message: '未登入或 session 過期' } });
      }

      if (responseError && (responseError.message || responseError.code !== undefined)) {
        const notificationTitle = `系統錯誤 - ${status || '未知狀態'}`;
        notifyOnce('error', {
          message: notificationTitle,
          description: responseError.message || '未知錯誤'
        });
        console.error(`API Error: ${notificationTitle}`, responseError);
        return Promise.reject(responseError);
      }

      console.error('API Error fallback:', error);
      notifyOnce('error', {
        message: '系統錯誤',
        description: error?.message || '網路異常或逾時'
      });

      return Promise.reject(error);
    }
  );
}
