import { api } from '@/utils/http/request';

/**
 * Mock - 取得使用者 Profile
 * GET /api/user/profile
 */
export const getUserTagProfile = () => {
  return api.get('/user/profile', {
    response: {
      data: {
        userId: '123',
        userName: '測試使用者'
      },
      metadata: {}
    }
  });
};
