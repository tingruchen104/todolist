# todo-list — 簡易待辦清單

- 需求：簡易 todolist，有新增、編輯、刪除功能。
- 分流：B 從零。
- 狀態：normal（預設，`#/todo-list`）、empty（無資料，`#/todo-list?state=empty`）。

## 版面結構

- `main`（mx-auto max-w-2xl p-6）
  - `SectionTitle`「簡易待辦清單」
  - 卡片 `div`（bg-background flex flex-col gap-4 rounded p-4 shadow）
    - 新增表單 `a-form`（橫排 flex items-start gap-2）
      - `a-form-item` title（flex-1）＞ `a-input`（placeholder「請輸入待辦事項」）
      - `a-form-item` date ＞ `a-date-picker`（placeholder「請選擇日期」、value-format YYYY-MM-DD）
      - `a-button` type=primary v-variant=primary「新增」（html-type=submit）
    - 空狀態 `a-empty`（僅 empty 或清單刪空時，description「暫無資料」）
    - 清單 `ul`（flex flex-col），每列 `li`（border-base flex items-center gap-3 border-b py-2 last:border-b-0）
      - 檢視列：`a-checkbox`（完成勾選）＋標題 `span`（min-w-0 flex-1 truncate、掛 title 供全域 tooltip；完成→ text-tertiary line-through，未完成→ text-heading）＋日期 `span`（shrink-0 text-sm；完成→ text-tertiary，未完成→ text-secondary）＋`a-button` size=small「編輯」＋`a-button` size=small v-variant=error「刪除」
      - 編輯列（一次僅一列）：`a-form`（flex-1，欄位與驗證同新增表單）＋`a-button` primary「儲存」（submit）＋`a-button`「取消」

## 元件清單

| 元件 | 來源 | 用途與 variant |
| --- | --- | --- |
| SectionTitle | 共用（src/components/shared/title/SectionTitle.vue） | 頁標題 |
| a-form／a-form-item | antd 原生 | 新增與編輯表單，欄位下方顯示錯誤訊息 |
| a-input | antd 原生 | 標題輸入；RULES.requiredText(「請輸入待辦事項」)＋RULES.maxLength(50) |
| a-date-picker | antd 原生 | 日期選擇；RULES.requiredSelect(「請選擇日期」) |
| a-button | antd 原生 | 新增／儲存：type=primary＋v-variant=primary；編輯：size=small 預設樣式；刪除：size=small＋v-variant=error；取消：預設樣式 |
| a-checkbox | antd 原生 | 完成狀態勾選 |
| a-empty | antd 原生 | 空狀態，「暫無資料」 |
| Modal.confirm | antd 原生 | 刪除二次確認（okText「刪除」danger、cancelText「取消」） |
| RULES | 共用（src/utils/form/validationRules） | 表單驗證規則 |

## 互動流程

| 操作 | 結果畫面 | 建議 frame |
| --- | --- | --- |
| 進入頁面 | 預設清單 3 筆（1 筆已完成劃線） | todo-list — 預設 |
| 進入 `?state=empty` | 空清單，顯示「暫無資料」 | todo-list — 無資料 |
| 送出新增（欄位空白） | 欄位下方紅字「請輸入待辦事項」「請選擇日期」 | — |
| 填妥後點「新增」 | 清單尾端新增一列，表單清空 | — |
| 勾選 checkbox | 該列標題劃線、文字轉淡 | — |
| 點某列「編輯」 | 該列切換為編輯表單，帶入原值 | todo-list — 編輯中 |
| 編輯後點「儲存」 | 該列更新並回到檢視狀態 | — |
| 點「取消」 | 放棄修改回到檢視狀態 | — |
| 點某列「刪除」 | Modal.confirm 彈窗二次確認 | todo-list — 刪除確認 |
| 彈窗點「刪除」 | 該列消失；全刪空時顯示「暫無資料」 | — |

Frame 串接：預設 →（編輯）→ 編輯中 →（儲存／取消）→ 預設；預設 →（刪除）→ 刪除確認 →（確認）→ 預設。

## 顯示文字

- 標題「簡易待辦清單」；按鈕「新增」「編輯」「刪除」「儲存」「取消」。
- 占位字「請輸入待辦事項」「請選擇日期」；空狀態「暫無資料」。
- 刪除彈窗：「確定要刪除這筆待辦事項嗎？」＋該筆標題、「刪除」「取消」。
- 假資料：回覆客戶信件（2026-07-21、未完成）、整理會議紀錄（2026-07-17、已完成）、預約下週部門會議（2026-07-24、未完成）。
