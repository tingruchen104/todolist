# tag-edit — 標籤編輯

- 需求：標籤編輯頁。
- 分流：A（改自 `src/pages/tag-service/views/tags/index.vue`）；沿用正式共用元件 `TagForm`／`TagFormQuery`，`index.vue` 只做最小調整（見下）。
- 狀態：僅編輯模式一種（`#/tag-edit`），無其他 state。

## 版面結構（依 mock 資料 `chloe_test_filter_entity` 渲染）

- `section`（px-12 py-8）＞ `a-form`（flex flex-col gap-15）
  - **標籤設定** `SectionTitle`（含 hint「因資安相關設定，新增標籤後需等待至隔日方可於系統下載名單」）
    - 中文名稱 tag_name：`a-input`，值「Chloe測試用_entity」，disabled（灰底）
    - 英文名稱 tag：`a-input`，值「chloe_test_filter_entity」，disabled
    - 標籤敘述 description：`a-textarea`（4 行），空白
    - 更新設定 schedule：`Select`，值「每日更新」
    - 標籤分類 product：`CreatableSelect`，值「karena_test」
    - 標籤對象 site：`Select`，disabled，顯示「人（idno）」
    - 搜尋索引 index：`Select`，值「無（null）」
    - 同步設定 groups：`a-checkbox-group`，「V-Hub（v_hub）串接尚未完成」已勾選
  - **標籤規則** `TagFormQuery`
    - 規則類型 `a-radio-group`：SQL／匯入名單／**篩選器**（依 mock 資料選中篩選器）
    - 篩選器規則樹（標籤對象須符合「全部」規則）：
      - 區塊 1（事件資料，橘框）：時間區間「近 7 天內」＋發生「瀏覽職缺」＋事件參數（且須符合以下任一條件：職缺性質 包含「全職」「兼職」）＋總次數 大於等於 1
      - `AND`
      - 區塊 2（會員資料與標籤，橘框）：最高學歷 包含「碩士」「大學」
  - 操作列：`a-button`「取消」＋`a-button` type=primary「修改」（edit 模式送出文字，含二次確認 `a-modal`）

**Prototype 環境調整（僅這兩處，其餘與正式頁一致）**：

1. 路由沒有 `:tag` 參數，`tagId` 固定帶入範例值 `chloe_test_filter_entity`（正式頁從路由取得）。
2. `mode` 固定為 `FORM_MODE.EDIT`（正式頁依路由名稱 create／edit／clone 判斷）。

## 元件清單

| 元件 | 來源 | 用途與 variant |
| --- | --- | --- |
| TagForm | 共用（src/components/tag-service/form/TagForm.vue） | 標籤設定＋標籤規則整份表單，正式頁重用、prototype 未改 |
| TagFormQuery | 共用（src/components/tag-service/form/TagFormQuery.vue） | 標籤規則區：SQL／匯入名單／篩選器切換與篩選器規則樹 |
| SectionTitle | 共用（src/components/shared/title/SectionTitle.vue） | 區塊標題（含 hint） |
| Select／CreatableSelect | 共用（src/components/shared/select/） | 下拉選單；CreatableSelect 額外支援新增選項 |
| a-input／a-textarea | antd 原生 | 文字輸入；disabled 樣式用於 edit 模式鎖定欄位 |
| a-checkbox-group | antd 原生（v-variant=large） | 同步設定多選 |
| a-radio-group | antd 原生 | SQL／匯入名單／篩選器切換 |
| 篩選器規則樹元件（FilterLevel3、MixedMenu 等） | 共用（src/components/tag-service/filter/） | 事件與會員資料規則的巢狀條件編輯，正式頁重用 |
| a-button | antd 原生 | 取消：預設樣式；修改：type=primary |
| a-modal | antd 原生 | 送出二次確認（標題「修改「<標籤中文名稱>」」） |

## 互動流程

| 操作 | 結果畫面 | 建議 frame |
| --- | --- | --- |
| 進入頁面 | 依 mock 資料渲染編輯表單，如上版面結構 | tag-edit — 編輯 |
| 點「修改」（送出前驗證通過） | 彈出二次確認 `a-modal`（標題「修改「Chloe測試用_entity」」，內文含審核提醒） | tag-edit — 送出確認 |
| 確認送出 | `notification.success`「標籤修改成功」，重新抓取資料並捲動至頂部 | — |
| 點「取消」 | 依 `TagForm` 內建行為離開表單（正式頁邏輯，prototype 未改） | — |
| 切換規則類型（SQL／匯入名單／篩選器） | 顯示對應規則輸入區，隱藏其他 | tag-edit — SQL｜tag-edit — 匯入名單 |

Frame 串接：編輯 →（修改）→ 送出確認 →（確認）→ 編輯（回到頂部）。

## 顯示文字

- 標題「標籤設定」「標籤規則」；hint「因資安相關設定，新增標籤後需等待至隔日方可於系統下載名單」。
- 欄位標籤：中文名稱 tag_name、英文名稱 tag、標籤敘述 description、更新設定 schedule、標籤分類 product、標籤對象 site、搜尋索引 index、同步設定 groups。
- 篩選器文案：「標籤對象須符合」「全部」「規則：」「事件參數」「且須符合以下任一條件：」「+ 規則」；AND 連接詞。
- 按鈕「取消」「修改」；送出確認彈窗內文「修改標籤後，檔案使用完畢請重新通知相關人員進行審核。」「審核通過後，標籤方可進行運算。」
- 假資料（mock）：標籤中文名稱「Chloe測試用_entity」、英文名稱「chloe_test_filter_entity」、分類「karena_test」、更新頻率「每日更新」、同步 groups「V-Hub（v_hub）串接尚未完成」；篩選規則：近 7 天內瀏覽職缺（全職／兼職）次數 ≥1，且最高學歷為碩士或大學。
