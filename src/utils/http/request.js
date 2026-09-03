import axios from 'axios';

// Utils
import { HTTP_METHOD_ENUM } from '@/utils/http/constants/methods';
import applyInterceptors from '@/utils/http/interceptors';
import globalRequestPool from '@/utils/http/concurrencyPool';

/* --------------------------------------------
   Axios service
   - baseURL 固定為 /api，由 vite proxy 轉往各環境
   - withCredentials 讓後端能以 cookie 驗證身分
--------------------------------------------- */
const service = axios.create({
  baseURL: '/api',
  timeout: 20000,
  withCredentials: true,
  responseType: 'json'
});

/** 取得指定 cookie 並解碼。 */
const getCookie = name => {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
};

/* --------------------------------------------
   Request interceptors
   - applyInterceptors 掛上共用的 loading 與錯誤處理
   - 併發池限制同時送出的 request 數量，可由 meta.skipConcurrency 略過
   - 非 GET 需帶上後端發出的 CSRF token
--------------------------------------------- */
applyInterceptors(service);

service.interceptors.request.use(
  async config => {
    if (!config.meta?.skipConcurrency) {
      config = await globalRequestPool(async () => config);
    }

    if (config.method && config.method.toUpperCase() !== HTTP_METHOD_ENUM.Get.toUpperCase()) {
      const csrfToken = getCookie('XSRF-TOKEN');
      if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
      }
    }

    return config;
  },
  error => Promise.reject(error)
);

/* --------------------------------------------
   HTTP methods
   - GET 與 DELETE 的第二個參數為 query params，其餘為 request body
   - options 直接併入 axios config，供 meta、headers、responseType 覆寫
--------------------------------------------- */
export const api = {
  get: (url, params, options = {}) =>
    service({ method: HTTP_METHOD_ENUM.Get, url, params, ...options }),

  post: (url, data, options = {}) =>
    service({ method: HTTP_METHOD_ENUM.Post, url, data, ...options }),

  put: (url, data, options = {}) =>
    service({ method: HTTP_METHOD_ENUM.Put, url, data, ...options }),

  patch: (url, data, options = {}) =>
    service({ method: HTTP_METHOD_ENUM.Patch, url, data, ...options }),

  delete: (url, params, options = {}) =>
    service({ method: HTTP_METHOD_ENUM.Delete, url, params, ...options })
};

export default service;
