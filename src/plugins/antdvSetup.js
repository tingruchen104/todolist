import { Select, TreeSelect, Cascader, notification, message } from 'ant-design-vue';

/* --------------------------------------------
   Select 系列預設行為
--------------------------------------------- */
Select.props.showSearch.default = true;
Select.props.dropdownMatchSelectWidth.default = false;
TreeSelect.props.dropdownMatchSelectWidth.default = false;
Cascader.props.dropdownMatchSelectWidth.default = false;
Select.props.showArrow.default = true;
TreeSelect.props.showArrow.default = true;
Cascader.props.showArrow.default = true;
Select.props.maxTagCount.default = null;
TreeSelect.props.maxTagCount.default = null;
Cascader.props.maxTagCount.default = null;

/* --------------------------------------------
   Feedback 顯示時間
--------------------------------------------- */
message.config({ duration: 3 });
notification.config({ duration: 3 });
