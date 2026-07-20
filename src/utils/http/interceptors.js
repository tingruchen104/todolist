import env from '@/utils/env';
import { notification, Modal } from 'ant-design-vue';
import { useLoadingStore } from '@/stores/loading';
import { HTTP_STATUS_CODE_ENUM } from '@/utils/http/constants/statusCode';

// 避免多個 API 同時觸發重複登出彈窗
let isSessionExpired = false;

/* --------------------------------------------
   通知去重：同訊息只顯示一次
   - 以 type+message+description 組成穩定 key
   - 使用 AntD 的 key 來避免堆疊
   - onClose 時移除，之後可再次顯示
--------------------------------------------- */
const showingNotiKeys = new Set();

function buildNotiKey(type, message, description) {
  const m = (message ?? '').toString().trim();
  const d = (description ?? '').toString().trim();
  return `${type}::${m}::${d}`;
}

/**
 * @param {'success'|'error'|'warning'|'info'|'open'} type
 * @param {{message?:string, description?:string, duration?:number}} opts
 */
function notifyOnce(type, opts = {}) {
  const { message, description, duration } = opts;
  const key = buildNotiKey(type, message, description);

  if (showingNotiKeys.has(key)) return; // 已顯示中 → 直接略過

  showingNotiKeys.add(key);

  // 用 notification.open 以便自訂 key；也可用 notification[type]
  notification[type]({
    key,
    message,
    description,
    duration, // 可傳入；不傳用 AntD 預設
    onClose: () => {
      showingNotiKeys.delete(key);
    }
  });
}

export default function applyInterceptors(service) {
  /* -------------------------------
     Request 攔截器
  -------------------------------- */
  service.interceptors.request.use(
    config => {
      if (config.hideLoading !== true) {
        useLoadingStore().show();
      }
      return config;
    },
    error => {
      useLoadingStore().hide();
      return Promise.reject(error);
    }
  );

  /* -------------------------------
     Response 攔截器
  -------------------------------- */
  service.interceptors.response.use(
    // 成功回應
    async response => {
      if (response.config.hideLoading !== true) {
        useLoadingStore().hide();
      }

      const method = response.config.method?.toUpperCase();
      const contentType = response.headers['content-type'] || '';

      /* -------------------------------
         處理下載 API（blob 回傳但實際是 JSON 錯誤）
      -------------------------------- */
      if (response.config.responseType === 'blob' && contentType.includes('application/json')) {
        try {
          const text = await response.data.text();
          const parsed = JSON.parse(text);
          const status = response.status || 500;
          // 強制讓 axios 錯誤流程接手
          return Promise.reject({ response: { status, data: parsed } });
        } catch (_error) {
          return Promise.reject({
            response: { status: 500, data: { error: { message: '無法解析伺服器回應' } } }
          });
        }
      }

      /* -------------------------------
         Blob 下載檔案（CSV / ZIP / PDF）
      -------------------------------- */
      if (response.config.responseType === 'blob') {
        return response; // ← 直接回傳，不進 JSON 檢查
      }

      const res = response.data;

      /* -------------------------------
         一般 API 正常回傳 JSON
      -------------------------------- */
      if (res && res.data !== undefined) {
        if (method === 'POST' && typeof res.data === 'string') {
          // 成功訊息去重
          notifyOnce('success', { message: res.data });
        }
        return res;
      }

      /* -------------------------------
         有 error 物件（mock / API 錯誤）
      -------------------------------- */
      if (res && res.error) {
        const msg = `系統錯誤 - ${res.error.code || '未知狀態'}`;
        notifyOnce('error', {
          message: msg,
          description: res.error.message || '未知錯誤'
        });
        console.error(`API Error: ${msg}`, res.error);
        return Promise.reject(res.error);
      }

      /* -------------------------------
         防呆 fallback（未預期格式）
      -------------------------------- */
      notifyOnce('error', {
        message: '系統錯誤',
        description: '未知 API 錯誤'
      });
      console.error('API Error: 未知 API 錯誤', response);
      return Promise.reject({ error: { message: '未知 API 錯誤' } });
    },

    // 錯誤回應（後端 4xx/5xx）
    error => {
      if (error.config?.hideLoading !== true) {
        useLoadingStore().hide();
      }

      /* -------------------------------
         統一錯誤結構解析
      -------------------------------- */
      const status = error.response?.status || 0;
      const data = error.response?.data;
      const resError =
        data?.error ||
        data?.data?.error ||
        (typeof data === 'object' && 'message' in data ? data : null);

      /* -------------------------------
         401 權限或登入狀態錯誤
      -------------------------------- */
      if (status === HTTP_STATUS_CODE_ENUM.Unauthorized && !isSessionExpired) {
        isSessionExpired = true;

        Modal.warning({
          title: '登入逾時',
          content: '為維護您的帳戶安全，系統因長時間未操作而自動登出，請重新登入。',
          okText: '重新登入',
          maskClosable: false,
          onOk: () => {
            isSessionExpired = false;
            window.location.href = `${env.VUE_APP_DOMAIN_URL}login`;
          },
          onCancel: () => {
            isSessionExpired = false;
          }
        });

        return Promise.reject({ error: { message: '未登入或 session 過期' } });
      }

      /* -------------------------------
         一般錯誤處理 (validation / system)
      -------------------------------- */
      if (resError && (resError.message || resError.code !== undefined)) {
        const msg = `系統錯誤 - ${status || '未知狀態'}`;
        notifyOnce('error', {
          message: msg,
          description: resError.message || '未知錯誤'
        });
        console.error(`API Error: ${msg}`, resError);
        return Promise.reject(resError);
      }

      /* -------------------------------
         未知錯誤（網路中斷 / timeout / blob decode fail）
      -------------------------------- */
      console.error('API Error fallback:', error);
      notifyOnce('error', {
        message: '系統錯誤',
        description: error?.message || '網路異常或逾時'
      });

      return Promise.reject(error);
    }
  );
}
