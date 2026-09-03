import { HTTP_METHOD_ENUM } from '@/utils/http/constants/methods';
import applyInterceptors from '@/utils/http/interceptors';
import globalRequestPool from '@/utils/http/concurrencyPool';

/* --------------------------------------------
   Mock service
   - 以最小介面模仿 axios instance，讓 interceptors 能原樣套用
   - 回應內容一律由 mock function 以 config.response 提供，此處不產生資料
   - 未提供 response 視為 mock 未實作，回 404 而非空資料
--------------------------------------------- */
const mockService = {
  interceptors: {
    request: {
      use(success, error) {
        this._success = success;
        this._error = error;
      }
    },
    response: {
      use(success, error) {
        this._success = success;
        this._error = error;
      }
    }
  },

  async request(config) {
    const { response } = config;

    if (response) {
      // 帶 status 代表要模擬錯誤，需以 reject 走 response error interceptor
      if (response.status) {
        const error = {
          config,
          response,
          message: `Mock Error ${response.status}`
        };
        await Promise.resolve();
        throw error;
      }

      return {
        data: response,
        config,
        status: 200,
        headers: { 'content-type': 'application/json' },
        statusText: 'OK'
      };
    }

    return {
      data: {
        error: {
          code: 404,
          message: `Mock 未定義: ${config.method} ${config.url}`,
          details: {}
        }
      },
      config,
      status: 404,
      headers: { 'content-type': 'application/json' },
      statusText: 'Not Found'
    };
  }
};

applyInterceptors(mockService);

/**
 * 依 Axios response 結構執行全域 response interceptor。
 * 併發池與 interceptor 行為與正式 request 相同，確保 mock 與正式流程一致。
 */
async function mockRequest(config) {
  try {
    config.headers = config.headers || {};

    if (!config.meta?.skipConcurrency) {
      config = await globalRequestPool(async () => config);
    }

    const response = await mockService.request(config);

    if (mockService.interceptors.response._success) {
      return mockService.interceptors.response._success(response);
    }
    return response.data;
  } catch (error) {
    if (mockService.interceptors.response._error) {
      return mockService.interceptors.response._error(error);
    }
    throw error;
  }
}

/* --------------------------------------------
   HTTP methods
   - 第二個參數為物件，data 為送出內容、response 為要回傳的 envelope
   - 呼叫方式與正式 api 不同，正式 api 的第二個參數是 params 或 body
--------------------------------------------- */
export const api = {
  get: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Get, url, data, response, ...options }),

  post: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Post, url, data, response, ...options }),

  put: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Put, url, data, response, ...options }),

  patch: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Patch, url, data, response, ...options }),

  delete: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Delete, url, data, response, ...options })
};

export default mockService;
