/**
 * 建立一個可共用的請求併發池
 * - 限制同時執行的 API 數量
 * - 其餘 request 會排隊等待
 */
export const createConcurrencyPool = (limit = 6) => {
  const queue = [];
  let activeCount = 0;

  const next = () => {
    if (queue.length === 0 || activeCount >= limit) return;
    const { fn, resolve, reject } = queue.shift();
    activeCount++;
    fn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeCount--;
        next();
      });
  };

  return async fn => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
};

/** 建立全域單例，限制同時最多 8 個請求 */
const globalRequestPool = createConcurrencyPool(8);

export default globalRequestPool;
