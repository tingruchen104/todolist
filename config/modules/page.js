import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 建立 workspace page 的 entry、HTML template 與 chunk 設定。 */
export function createPage(entry, template, title, chunkName, options = {}) {
  const { appName = 'app' } = options;

  return {
    entry: path.resolve(__dirname, `../../../src/pages/${entry}`),
    template: `templates/${template}`,
    title: title || '',
    chunkName,
    name: chunkName,
    appName
  };
}

/** 開發與 build 共用的預設輸出路徑。 */
export const getDevelopSettings = () => ({
  publicPath: () => '/',
  assetsPath: 'assets',
  outputPath: 'dist',
  jsPath: 'assets/js',
  singleFile: false
});
