import { HTTP_METHOD_ENUM } from '@/utils/http/constants/methods';
import applyInterceptors from '@/utils/http/interceptors';
import globalRequestPool from '@/utils/http/concurrencyPool';

// 建立假的 service
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

    // 模擬有 response
    if (response) {
      // 模擬錯誤情境（帶 status）
      if (response.status) {
        const err = {
          config,
          response, // axios 錯誤結構
          message: `Mock Error ${response.status}`
        };
        await Promise.resolve(); // 模擬非同步
        throw err; // 讓攔截器走 error 分支
      }

      // 模擬成功回傳
      return {
        data: response,
        config,
        status: 200,
        headers: { 'content-type': 'application/json' },
        statusText: 'OK'
      };
    }

    // 沒給 response 時，預設為未定義 mock
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

// 套用攔截器
applyInterceptors(mockService);

// 模擬 axios 的呼叫 API
async function mockRequest(config) {
  try {
    config.headers = config.headers || {};

    if (!config.meta?.skipConcurrency) {
      config = await globalRequestPool(async () => config);
    }

    const res = await mockService.request(config);

    // 成功攔截
    if (mockService.interceptors.response._success) {
      return mockService.interceptors.response._success(res);
    }
    return res.data;
  } catch (err) {
    // 錯誤攔截
    if (mockService.interceptors.response._error) {
      return mockService.interceptors.response._error(err);
    }
    throw err;
  }
}

// 語法糖
export const api = {
  // GET
  get: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Get, url, data, response, ...options }),

  // POST
  post: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Post, url, data, response, ...options }),

  // PUT
  put: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Put, url, data, response, ...options }),

  // PATCH
  patch: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Patch, url, data, response, ...options }),

  // DELETE
  delete: (url, { data, response = {}, ...options } = {}) =>
    mockRequest({ method: HTTP_METHOD_ENUM.Delete, url, data, response, ...options })
};

export default mockService;
