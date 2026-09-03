/**
 * 建立一個可共用的請求併發池
 * - 限制同時執行的 API 數量
 * - 其餘 request 會排隊等待
 */
export const createConcurrencyPool = (limit = 6) => {
  const queue = [];
  let activeCount = 0;

  /** 有空額時取出下一個排隊的 task，完成後遞補。 */
  const next = () => {
    if (queue.length === 0 || activeCount >= limit) return;
    const { task, resolve, reject } = queue.shift();
    activeCount += 1;
    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        activeCount -= 1;
        next();
      });
  };

  // 回傳的函式將 task 排入佇列，額滿時等待前面的 request 完成
  return async task => {
    return new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next();
    });
  };
};

/** 建立全域單例，限制同時最多 8 個請求 */
const globalRequestPool = createConcurrencyPool(8);

export default globalRequestPool;
