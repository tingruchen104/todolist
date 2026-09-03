import { h } from 'vue';
import { Alert, message, notification, Modal } from 'ant-design-vue';

// Components
import ErrorCircleIcon from '@/components/shared/icon/ErrorCircleIcon';
import InfoCircleIcon from '@/components/shared/icon/InfoCircleIcon';
import SuccessCircleIcon from '@/components/shared/icon/SuccessCircleIcon';
import WarningTriangleIcon from '@/components/shared/icon/WarningTriangleIcon';

const FEEDBACK_ICONS = {
  success: SuccessCircleIcon,
  error: ErrorCircleIcon,
  info: InfoCircleIcon,
  warning: WarningTriangleIcon,
  confirm: WarningTriangleIcon
};

/** 建立統一的回饋 icon。 */
const createFeedbackIcon = type =>
  h(FEEDBACK_ICONS[type], type === 'confirm' ? { class: 'icon-confirm' } : undefined);

/** Alert 的 icon prop 預設值優先於 #icon slot；個別替換時須傳入 icon prop。 */
Alert.props.icon.default = props => createFeedbackIcon(props.type);

/* --------------------------------------------
   覆寫 Message feedback icon
--------------------------------------------- */
['success', 'error', 'info', 'warning'].forEach(type => {
  message[type] = (content, duration, onClose) => {
    return message.open({
      type,
      content,
      duration,
      onClose,
      icon: createFeedbackIcon(type)
    });
  };
});

/* --------------------------------------------
   覆寫 Notification feedback icon
--------------------------------------------- */
['success', 'error', 'info', 'warning'].forEach(type => {
  notification[type] = args => {
    return notification.open({
      ...args,
      type,
      icon: createFeedbackIcon(type)
    });
  };
});

/* --------------------------------------------
   覆寫 Modal feedback icon
--------------------------------------------- */
['success', 'error', 'info', 'warning', 'confirm'].forEach(type => {
  const origin = Modal[type] || Modal.confirm;
  Modal[type] = args => {
    return origin({
      ...args,
      icon: createFeedbackIcon(type)
    });
  };
});

export { message, notification, Modal };
