import path from 'node:path';
import fs from 'node:fs';

/**
 * SPA build 完成後，將 workspace template 產物移至 dist/index.html。
 * 多頁 workspace 不套用此 plugin；搬移後同步清除空的 templates 目錄。
 */
const moveOutputHtml = ({ spa, pages, outputPath }) => {
  if (!spa) return null;

  return {
    name: 'move-output-html',
    writeBundle() {
      const [page] = pages;
      const workspace = process.cwd();
      const sourcePath = path.resolve(workspace, `${outputPath}/${page.template}`);
      const targetPath = path.resolve(workspace, 'dist/index.html');

      if (fs.existsSync(sourcePath)) {
        fs.renameSync(sourcePath, targetPath);
        fs.rmSync(path.dirname(path.dirname(sourcePath)), { recursive: true });
      }
    }
  };
};

export default moveOutputHtml;
