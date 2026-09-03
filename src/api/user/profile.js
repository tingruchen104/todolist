import api from '@/utils/http/request';

/**
 * 取得使用者 Profile
 * GET /api/user/profile
 */
export const getUserTagProfile = () => {
  return api.get('/user/profile');
};
