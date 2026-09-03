# /prototype-figma 已知陷阱清單

第 3～4 步（量測 computed style、token 對應）執行時比對；每次因臆測（未查資料）造成轉出錯誤，補一條，不重複。

| 陷阱 | 錯誤做法 | 正確做法 |
| --- | --- | --- |
| 元件變體選錯（如 Input Style=Outline/Plain） | 只看縮圖截圖肉眼判斷變體 | 查該變體實際 stroke／fill 綁定（`get_variable_defs`），比對量測值 |
| placeholder 顏色 | 沿用元件預設文字色（多為輸入值用的深色） | 另量 `getComputedStyle(el, '::placeholder')`，對應 `colorTextPlaceholder` 等專屬 token，不與元素本身 `color` 混用 |
