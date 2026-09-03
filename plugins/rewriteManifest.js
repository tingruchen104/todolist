import fs from 'node:fs';
import path from 'node:path';
import uniq from 'lodash/uniq.js';
import keys from 'lodash/keys.js';
import merge from 'lodash/merge.js';
import stringify from 'json-stable-stringify';

// 同一 build process 會分別產生 legacy 與 modern bundle，暫存結果供後續階段合併。
let bundles;

/**
 * 將 Vite manifest 改寫成部署系統使用的 `{ chunkName: { modern, legacy } }` 格式。
 * 所有檔案路徑會補上 workspace CDN prefix，並以 stable JSON 順序輸出。
 */
const rewriteManifest = ({ pages, manifest, outputPath, name, env }) => ({
  name: 'rewriteManifest',
  async writeBundle(options, bundle) {
    if (typeof options.entryFileNames === 'string') {
      // Modern bundle：沿 manifest imports 遞迴收集各頁 entry JS 與相依 CSS。
      const originalManifest = JSON.parse(bundle[manifest].source);
      /** 收集指定 manifest entry 的檔案，visited 避免循環 imports 重複走訪。 */
      const getAllImports = (key, files = [], visited = new Set()) => {
        if (visited.has(key)) return files;
        visited.add(key);

        if (originalManifest[key].file && originalManifest[key].isEntry) {
          files.push(originalManifest[key].file);
        }

        if (!originalManifest[key].imports) {
          originalManifest[key].css && files.push(...originalManifest[key].css);
        } else {
          originalManifest[key].imports.forEach(item => {
            getAllImports(item, files, visited);
          });
          originalManifest[key].css && files.push(...originalManifest[key].css);
        }

        return files.map(item => `${env.VUE_APP_CDN_URL}${path.join(name, item)}`);
      };

      const templates = pages.map(page => page.template);
      const templatesToChunkname = pages.reduce((acc, cur) => {
        acc[cur.template] = cur.name;
        return acc;
      }, {});

      const newManifest = templates.reduce((acc, cur) => {
        const fileList = [...uniq(getAllImports(cur))];
        acc[templatesToChunkname[cur]] = { modern: fileList };
        return acc;
      }, {});

      const workspace = process.cwd();
      const filePath = path.resolve(workspace, outputPath, manifest);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      bundles = bundles ? merge(bundles, newManifest) : newManifest;
      fs.writeFileSync(filePath, stringify(bundles, { space: 2 }));
    } else {
      // Legacy bundle：每個頁面需包含 polyfills 與對應 legacy entry。
      const templatesName = pages.map(page => page.name);
      const entryBundle = keys(bundle).filter(
        key => bundle[key].isEntry && templatesName.includes(bundle[key].name)
      );
      const polyfillsEntry = keys(bundle).find(key => bundle[key].name === 'polyfills');

      const legacyBundle = entryBundle.reduce((acc, cur) => {
        const fileName = bundle[cur].name;
        const urlPath = `${env.VUE_APP_CDN_URL}${name}/`;
        acc[fileName] = {
          legacy: [polyfillsEntry, bundle[cur].fileName].map(file => `${urlPath}${file}`)
        };
        return acc;
      }, {});

      bundles = legacyBundle;
    }
  }
});

export default rewriteManifest;
