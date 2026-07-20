import { Select, TreeSelect, Cascader, notification, message } from 'ant-design-vue';

/* 預設 showSearch */
// =============================
// Select 系列
// =============================
Select.props.showSearch.default = true;

/* 預設 dropdownMatchSelectWidth */
// =============================
// Select 系列
// =============================
Select.props.dropdownMatchSelectWidth.default = false;
TreeSelect.props.dropdownMatchSelectWidth.default = false;
Cascader.props.dropdownMatchSelectWidth.default = false;
Select.props.showArrow.default = true;
TreeSelect.props.showArrow.default = true;
Cascader.props.showArrow.default = true;
Select.props.maxTagCount.default = null;
TreeSelect.props.maxTagCount.default = null;
Cascader.props.maxTagCount.default = null;

/* 預設 message / notification */
// =============================
// message / notification
// =============================
message.config({ duration: 3 });
notification.config({ duration: 3 });
