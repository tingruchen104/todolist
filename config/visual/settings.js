import 'colors';
import Table from 'cli-table';

/** 將目前 workspace 的 output、assets 與 JS path 輸出至 build terminal。 */
export function printSettings({ workspace, config }) {
  const settingsTable = new Table({
    head: ['output'.green, 'assets'.green, 'jsPath'.green]
  });
  settingsTable.push([workspace.outputPath, workspace.assetsPath, workspace.jsPath]);
  const heading = `目前環境設定(${config.workspace.current})`.bgGreen.black;

  process.stdout.write(`${heading}\n${settingsTable.toString()}\n`);
}
