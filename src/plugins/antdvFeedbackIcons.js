import { h } from 'vue';
import { message, notification, Modal } from 'ant-design-vue';

/**
 * 共用 Icon Map
 */
const iconMap = {
  success: () => h('i', { class: 'jb_icon_vote' }),
  error: () => h('i', { class: 'jb_icon_delete' }),
  info: () => h('i', { class: 'jb_Icon_waring' }),
  warning: () => h('i', { class: 'jb_icon_alert-line' })
};

/**
 * 幫 message 方法加上全域 class
 */
['success', 'error', 'info', 'warning'].forEach(type => {
  message[type] = (content, duration, onClose) => {
    const IconComp = iconMap[type];

    return message.open({
      type,
      content,
      duration,
      onClose,
      icon: h(IconComp, {
        class: `icon-${type} is-104icon`
      })
    });
  };
});

/**
 * 幫 notification 方法加上全域 class
 */
['success', 'error', 'info', 'warning'].forEach(type => {
  notification[type] = args => {
    const IconComp = iconMap[type];

    return notification.open({
      ...args,
      type,
      icon: h(IconComp, {
        class: `icon-${type} is-104icon`
      })
    });
  };
});

/**
 * 幫 Modal 方法加上全域 icon
 */
['success', 'error', 'info', 'warning', 'confirm'].forEach(type => {
  const origin = Modal[type] || Modal.confirm;
  Modal[type] = args => {
    const IconComp = iconMap[type] || iconMap.info;

    return origin({
      ...args,
      icon: h(IconComp, {
        class: `icon-${type} is-104icon`
      })
    });
  };
});

export { message, notification, Modal };
