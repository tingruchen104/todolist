# /prototype — 產畫面指令

依本專案 UI 設計準則，產出一個或多個可在本機預覽的 prototype 畫面。使用者不熟悉程式與版本控管，Claude 負責環境確認、檔案產出與本機預覽。

> **執行位置**：本指令已隨 `prototype/base` 分支搬入工作目錄（由 `/prototype-init` 初始化，含工具鏈），就地執行，文件內路徑皆相對於此。改既有頁、或畫面需引用產品檔時，需另掛**來源** 104-f2e-tag-service（唯讀）；從零的新畫面不需要。
>
> **前置需求**：第 4 步參考外部頁、第 5 步預覽與樣式確認需 Claude 的 Chrome 擴充（`claude-in-chrome`）；每位使用者各自安裝、無法由 `.mcp.json` 共享，請先在本機安裝並登入。

## 使用方式

```text
/prototype <需求描述>
```

文字與附圖都是需求描述，一次可要求單一或多個畫面；可能是從零的新畫面，或修改本專案既有頁（判斷見第 4 步）。

## 全程規則

- `bash`／`js` 區塊為 Claude 自行執行的指令，不對使用者顯示；只有標示「回報使用者」「詢問使用者」的文字區塊才輸出給使用者。
- 對使用者一律平實用語，不出現 git、branch、commit、push、PR、lab、terminal、pnpm 等字眼，改說「整理本機狀態」「同步最新專案內容」「建立這次畫面的保存紀錄」等；失敗時說明問題與建議，不貼原始錯誤。
- 只在需要使用者判斷時停下詢問：名稱無法推導、有內容遺失風險、系統要求權限。
- 來源只讀不寫（fetch／checkout／pull 不算寫入）；所有寫入都在工作目錄。設計規範等文件讀工作目錄自己那份，不讀來源。

## 流程

### 第 1 步 — 確認畫面名稱

從需求與附圖推導：

- `<page-name>`：小寫英文、數字、連字號，短而能代表用途（「標籤列表頁」→ `tag-list`）。
- `<work-name>`：工作分支名稱（`prototype/<work-name>`），僅 repo 需要；單頁可等於 `<page-name>`，多頁時代表整組需求。
- 每頁的中文名稱。

推導得出時回報使用者：

```text
我會製作以下畫面：

| page-name | 路由 | 畫面名稱 |
| --- | --- | --- |
| <page-name> | #/<page-name> | <中文畫面名稱> |

接著我會先整理本機狀態，確保這次畫面從最新專案內容開始。
```

推導不出時詢問使用者（一次問齊）：

```text
請提供每個畫面的英文短名稱，例如 tag-list、tag-detail。名稱只使用小寫英文、數字與連字號。
```

### 第 2 步 — 整理工作目錄狀態

```bash
git rev-parse --is-inside-work-tree 2>/dev/null   # true = repo，否則純資料夾
```

**純資料夾**：無版本控管，跳過本步其餘操作，直接往第 3 步。

**repo**：

一次取得所有狀態，減少往返：

```bash
git fetch && {
  echo "== base ==";     git ls-remote --heads origin prototype/base   # 無輸出 = 尚未初始化
  echo "== changes ==";  git status --short
  echo "== branch ==";   git status -sb                                # 含目前分支、上游與領先落後
  echo "== unpushed =="; git log --oneline @{u}..HEAD 2>/dev/null
}
```

遠端沒有 `prototype/base` 時**停止**，回報：這個資料夾還沒準備好工作環境，請先執行 `/prototype-init`。

有未 commit 的變更、或目前分支有未 push 的 commit 時，詢問使用者；否則直接到「建立工作分支」：

```text
偵測到目前的畫面還沒整理完，或還沒建立可交付的連結。這次要如何處理？

1. 接續上次內容：保留目前狀態，直接繼續做。
2. 先保存再開始：把目前內容保存起來，讓之後仍找得到，再開始這次的新畫面。
3. 不保留、重新開始：放棄目前內容，從最新專案內容重新開始。
```

- 選 1：留在目前分支沿用現狀，跳過「建立工作分支」，但先做「同步 `prototype/base`」再繼續。
- 選 2：比照第 5.5 步 commit／push 並回報交付連結，再建立工作分支。
- 選 3：先向使用者確認下句，確認後執行 `git checkout -- . && git clean -fd`，再建立工作分支。

  ```text
  這會放棄目前尚未整理完的內容，而且無法復原。請確認是否要重新開始。
  ```

**建立工作分支**（選 1 以外都要做）：`prototype/base` 是已驗證、已 commit 的可執行環境，開出的分支直接能跑，不需重新搬移或安裝：

```bash
git checkout -b prototype/<work-name> origin/prototype/base
```

同名分支已存在改用 `git checkout prototype/<work-name>`，並接著做「同步 `prototype/base`」；既有內容與本次需求明顯不同時，先詢問要沿用或改名。

**同步 `prototype/base`**（選 1 接續、或沿用同名既有分支時做；新開分支不需要）：`prototype/base` 會隨每次交付累積頁面，先把最新 `prototype/base` 合併進來，本機預覽才帶得到其他已交付的頁面，衝突也能在動工前浮現。用合併、不用 rebase——工作分支已推送為交付連結，rebase 需強制覆蓋遠端，風險較高：

```bash
git fetch
git merge --no-edit origin/prototype/base
```

有衝突時 `git merge --abort` 恢復原狀，平實告知使用者這次的內容與其他已交付畫面改到同一處，詢問要先保存現狀再處理、或暫時不同步繼續做。

**`prototype/base` 過期提示（有掛來源時順帶做，未掛則跳過）**：

```bash
git show origin/prototype/base:.prototype-base-source
git -C <來源> fetch && git -C <來源> rev-parse origin/lab
```

兩者不同時提示使用者，依選擇進行、不強制更新：

```text
專案內容已有更新。要以最新內容為基礎製作畫面，可先執行 /prototype-init 更新工作環境；也可以直接沿用目前版本繼續。
```

### 第 3 步 — 確認設計規範

完整讀取 `docs/design-system.md` 並絕對遵守，不得只依記憶、摘要或片段判斷。

### 第 4 步 — 製作畫面

**判斷分流**

- 需求指到**產品既有頁**（網址路由能在 `<來源>/src/pages/tag-service/router/` 對應到頁面，或描述能在 `<來源>/src/pages/tag-service/views/` 找到對應 `.vue`）→ **A. 改既有頁**。
- 從零、或以外部畫面為參考 → **B. 從零新畫面**。
- 判斷不出時先問使用者。
- 走 A（或需引用產品檔）而來源未掛上時，先停下：

  ```text
  這個畫面需要參考正式專案的內容，請把 104-f2e-tag-service 專案也連結進來後再繼續。
  ```

**共通規則**

- 絕對遵守第 3 步的設計規範。
- 產出只寫進 `prototypes/views/<page-name>/*.vue`（`index.vue` 為入口，必須存在）；頁面引用到的產品檔一律由第 4.5 步解析器自動搬入，不手動搬。
- 需要拆小元件時，拆在本頁資料夾內、以相對路徑引用，不放入 `src/`（該處為正式共用元件庫）。

**A. 改既有頁**

- 從來源找出對應的正式頁 `.vue`，複製到 `prototypes/views/<page-name>/index.vue`。
- 沿用原頁做法（API 走 mock、store、router、子元件照舊，import 維持 `@/…` 不改），只改使用者要求的部分；`@/…` 依賴由第 4.5 步搬入。
- 原頁因 prototype 環境無法顯示時，做最小必要調整，同樣只改這份複製的 `.vue`。
- 狀態沿用原頁資料流（由 mock 回應驅動）；要讓 PM 切換預覽時，比照「狀態呈現」讀取注入值。

**B. 從零新畫面**

- 需求、附圖與參考網址只當設計依據，不複製其程式碼。
- 參考外部網址時：用 claude-in-chrome 開啟（沿用本機登入狀態），逐一確認每個功能與互動（含點選、hover 的行為與顯示），據此重新切版，不遺漏互動細節。
- 假資料與邏輯寫在本頁資料夾內；不串 API、不引用 store、不使用正式 router。
- 多種狀態時依「狀態呈現」實作。

**狀態呈現（畫面有多種狀態時才做）**

頁面讀取注入的初始狀態渲染，並以具名 `export const states` 宣告狀態，PrototypeIndex 據此列出該頁的預覽連結：

```vue
<script>
// 這支頁面的預覽狀態（給 PrototypeIndex 列連結）
export const states = [
  { value: 'normal', label: '正常' },
  { value: 'empty', label: '無資料' }
];
</script>

<script setup>
import { inject, ref } from 'vue';

const viewState = ref(inject('prototypeInitialState', 'normal'));
</script>
```

狀態值與標籤依畫面需求自訂；未宣告 `states` 沿用 PrototypeIndex 預設，宣告空陣列則不列連結。

### 第 4.5 步 — 搬入頁面引用的檔案

用解析器從**來源**逐引用遞迴，把每張產出頁實際 import 的產品檔搬進工作目錄。解析器行為：`.mock.js` 優先命中（真實版不搬）、bare 套件交給 pnpm、已存在不覆蓋、只寫 `src/`（不動 `prototypes/views/` 的產出頁）：

```bash
node .claude/commands/scripts/prototype-resolve-deps.mjs \
  --src <來源路徑> --dest . \
  prototypes/views/<page-name>/index.vue   # 多頁時每張都列上
```

解析器只跟靜態的 `@/`／`~/`／相對 import；`import.meta.glob` 與動態字串 import 跟不到。會印出新增檔案與無法解析的 import；遇到未解析項或預覽「找不到模組」時，確認 import 路徑、必要時回報工程，不自行臆造檔案。

本步需掛來源。從零新畫面（B）且未引用產品檔時可跳過（共用元件已在 `prototype/base` 內）；之後預覽若「找不到模組」，請使用者連結來源後補跑本步。

### 第 5 步 — 開啟預覽

```bash
bash .claude/commands/scripts/start-prototype-server.sh
```

script 會沿用已啟動的服務、不重複啟動，成功時印出網址。失敗時先補裝相依（`corepack enable pnpm && pnpm install`）再重試一次；仍失敗則平實回報環境問題、暫停後續步驟。

Claude 先逐一開啟每頁 `http://localhost:<port>/templates/prototypes/index.html#/<page-name>` 確認，有問題先修正再繼續：

- **符合需求**：每項需求、附圖與互動都已呈現，無遺漏或多做。
- **遵守設計規範**：由 `prototype-design-reviewer` subagent 審查，見下方「設計規範審查」。
- **樣式生效**：以實際畫面或元素 computed style 確認 utility 有套用（易被 `.ant-*` 覆蓋，見設計規範「確認樣式生效」）。
- **視覺品質**：間距、對齊、視覺層級得當；善用 primary 色階營造層次，避免整面白底加灰框（見設計規範「設計基調」）。
- **lint**：通過專案 lint，無錯誤與警告。

**設計規範審查（subagent）**：頁面能正常載入後，對本次新寫或有改動的頁面啟動 `prototype-design-reviewer`（定義於 `.claude/agents/`，隨 `prototype/base` 交付），傳入頁面資料夾路徑、本次需求摘要與各頁分流（A／B）。它以乾淨的上下文完整讀取 `docs/design-system.md`、`docs/components-purpose.json` 與本文件第 4 步的產出規範，靜態逐條審查產出碼（含設計規範與 prototype 規範兩者），與上列瀏覽器檢查**並行**執行以節省時間。回報的違規逐項確認後修正、重新整理預覽；規範明列的例外可說明後略過，「待確認」項自行查證規範原文再定。

**驗證深度分級**：上述完整驗證只做在本次新寫或有改動的頁面。頁面內容與先前已驗證交付的版本完全相同（例如只是同步 `prototype/base`、本次未動該頁）時，改做輕量檢查即可：頁面載入成功、console 無錯誤、截圖目視整體版面。

**減少瀏覽器往返**：互動測試以連續操作進行，只在需要斷言結果的節點取 snapshot，不每個動作都截取；截圖與暫存檔一律存到系統暫存目錄（scratchpad），不落在工作目錄或來源專案內。

確認完畢後，開啟列表頁 `http://localhost:<port>/templates/prototypes/index.html#/`（PrototypeIndex）給使用者，回報：

```text
畫面已開啟，可以檢視並提出需要調整的地方。
```

### 第 5.5 步 — 保存並提供交付連結

**純資料夾**：跳過本步，直接往第 6 步。

**repo**：

```bash
git add -A
if [ -n "$(git status --porcelain)" ]; then
  git commit -m "prototype: <work-name>"
fi
git push -u origin prototype/<work-name>
```

**合回 `prototype/base`**：讓之後從 `prototype/base` 開出的新分支直接帶著已交付的頁面。`prototype/base` 更新時不保留這些頁面（一律對齊最新來源），舊內容於封存分支可查。

工作分支從 `prototype/base` 開出，多數情況 `prototype/base` 沒有新交付、可直接 fast-forward，一行推送完成、不切分支：

```bash
git push origin prototype/<work-name>:prototype/base
```

被拒絕（非 fast-forward，代表 `prototype/base` 已有其他交付）時才退回合併流程：

```bash
git checkout prototype/base
git pull --ff-only origin prototype/base
git merge --no-edit prototype/<work-name>
git push origin prototype/base
git checkout prototype/<work-name>
```

各頁自有資料夾、重疊的產品檔內容通常相同，極少衝突；真有衝突時 `git merge --abort` 中止合併，照常交付工作分支連結，並平實回報使用者這次的畫面暫時沒併入共同的畫面環境、之後的新畫面不會自動帶到它。

組出交付連結（GitHub 慣例路徑；其他平台需調整）：

```bash
REMOTE_URL=$(git remote get-url origin)
BRANCH_URL=$(echo "$REMOTE_URL" | sed -E 's#^git@([^:]+):#https://\1/#; s#\.git$##')/tree/prototype/<work-name>
```

回報使用者（不開 PR，此連結即交付對象）：

```text
這次的畫面已經保存好，可以此交付工程：
<BRANCH_URL>
```

### 第 6 步 — 記錄本次 prototype（每頁一列）

更新 `prototypes/prototype-log.md`（`/prototype-init` 已建立），本次每頁加一列；「是否轉 Figma」先記「否」、原因留空，之後由 `/prototype-figma` 回填。

```markdown
# Prototype 清單

| 日期 | page-name | 畫面名稱 | 是否轉 Figma | 需調整 Figma 原因 |
| --- | --- | --- | --- | --- |
| <今天日期> | tag-list | 標籤列表 | 否 | — |
```

- 一頁一列；日期用今天，名稱沿用第 1 步。
- 同名 `page-name` 已在表中就更新該列日期，不重複新增。

**純資料夾**：直接讀寫檔案，不牽涉 git。

**repo**：清單只放主線、不進工作分支。用臨時 worktree 操作主線，目前分支與工作樹完全不動（不必來回切分支重建檔案，也不會讓預覽伺服器因檔案抽換而重新編譯）：

```bash
MAIN=$(git remote show origin | sed -n 's/.*HEAD branch: //p')
WT=$(mktemp -d)
git worktree add --detach "$WT" "origin/$MAIN"

for i in $(seq 1 5); do
  git -C "$WT" fetch origin "$MAIN"
  git -C "$WT" reset --hard "origin/$MAIN"   # 每次以主線最新內容重新開始
  # 讀取此刻 $WT/prototypes/prototype-log.md 最新內容，依上方規則寫入這次的列
  git -C "$WT" add prototypes/prototype-log.md
  git -C "$WT" commit -m "prototype: 記錄 <page-name>"
  git -C "$WT" push origin HEAD:"$MAIN" && break
  # push 失敗 = 有其他人先寫入，回圈重新 fetch 再寫一次
done

git worktree remove --force "$WT"
```

5 次重試仍失敗、或檔案讀寫失敗時，平實告知「這次沒能存到紀錄，可以稍後再試一次」，不中斷主流程（畫面已在第 5.5 步交付）、不貼原始錯誤。

### 後續調整

同一段對話中，後續描述視為調整已確認的頁面：指定某頁只改該頁，未指定依內容判斷影響哪些頁。仍遵守設計規範與第 4 步規則；新增 `@/`／相對 import 時重跑第 4.5 步，再重新整理對應頁面的預覽。調整完成、使用者確認無需再改時，重做第 5.5 步並回報最新交付連結。

`.vue` 已足以交付即完成；需換版面、探索設計方向，或要讓非工程的人自己看或在 Figma 上討論時，才用 `/prototype-figma` 轉出。
