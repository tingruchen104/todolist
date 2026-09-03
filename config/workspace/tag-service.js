import { createPage } from '../modules/page.js';

const pages = [
  createPage('tag-service/index.js', 'tag-service/index.html', '標籤2.0', 'tag-service')
];

/** tag-service workspace 的入口、build 輸出與 CDN public path。 */
export default {
  name: 'tag-service',
  spa: true,
  pages,
  outputPath: 'dist',
  jsPath: 'assets/js',
  assetsPath: 'assets',
  chunkVendors: ['axios', 'dayjs'],
  // Preview 掛在專案子路徑；正式環境固定由 /tag-service/ 提供資源。
  publicPath: config =>
    config.preview.status
      ? `/${config.preview.project}`
      : `${config.path.publicPath || '/'}tag-service/`
};
