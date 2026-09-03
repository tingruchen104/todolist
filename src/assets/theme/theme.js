/*
 * 字串 token 對應 base.css 的 CSS variable 名稱，ConfigProvider 會在 mounted 後
 * 換成實際色值；數字 token 則直接交給 Ant Design Vue。
 */
const theme = {
  // 元件層級 token
  components: {
    Tooltip: {
      fontSize: 12,
      controlHeight: 24,
      borderRadius: 3,
      paddingXS: 6,
      paddingSM: 6
    },
    Menu: {
      radiusItem: 3,
      radiusSubMenuItem: 3,
      controlHeightLG: 36
    }
  },
  token: {
    // 語意色
    colorPrimary: '--color-primary',
    colorSuccess: '--color-success',
    colorError: '--color-error',
    colorWarning: '--color-warning',
    colorInfo: '--color-info',

    colorPrimaryText: '--color-primary-60',
    colorPrimaryTextHover: '--color-primary-50',
    colorPrimaryTextActive: '--color-primary-70',
    colorPrimaryHover: '--color-primary-50',
    colorPrimaryActive: '--color-primary-70',
    colorPrimaryBorder: '--color-primary-70',
    colorPrimaryBorderHover: '--color-primary-50',
    colorPrimaryBg: '--color-primary-10',
    colorPrimaryBgHover: '--color-primary-10',
    controlPrimaryOutline: '--color-primary-10',

    colorSuccessText: '--color-success-60',
    colorSuccessTextHover: '--color-success-50',
    colorSuccessTextActive: '--color-success-70',
    colorSuccessHover: '--color-success-50',
    colorSuccessActive: '--color-success-70',
    colorSuccessBorder: '--color-success-70',
    colorSuccessBorderHover: '--color-success-50',
    colorSuccessBg: '--color-success-10',
    colorSuccessBgHover: '--color-success-10',
    controlSuccessOutline: '--color-success-10',

    colorErrorText: '--color-error-60',
    colorErrorTextHover: '--color-error-50',
    colorErrorTextActive: '--color-error-70',
    colorErrorHover: '--color-error-50',
    colorErrorActive: '--color-error-70',
    colorErrorBorder: '--color-error-70',
    colorErrorBorderHover: '--color-error-50',
    colorErrorBg: '--color-error-10',
    colorErrorBgHover: '--color-error-10',
    controlErrorOutline: '--color-error-10',

    colorWarningText: '--color-warning-60',
    colorWarningTextHover: '--color-warning-50',
    colorWarningTextActive: '--color-warning-70',
    colorWarningHover: '--color-warning-50',
    colorWarningActive: '--color-warning-70',
    colorWarningBorder: '--color-warning-70',
    colorWarningBorderHover: '--color-warning-50',
    colorWarningBg: '--color-warning-10',
    colorWarningBgHover: '--color-warning-10',
    controlWarningOutline: '--color-warning-10',

    colorInfoText: '--color-info-60',
    colorInfoTextHover: '--color-info-50',
    colorInfoTextActive: '--color-info-70',
    colorInfoHover: '--color-info-50',
    colorInfoActive: '--color-info-70',
    colorInfoBorder: '--color-info-70',
    colorInfoBorderHover: '--color-info-50',
    colorInfoBg: '--color-info-10',
    colorInfoBgHover: '--color-info-10',
    controlInfoOutline: '--color-info-10',

    colorLink: '--color-info-60',
    colorLinkHover: '--color-info-50',
    colorLinkActive: '--color-info-70',

    // 文字色
    colorTextHeading: '--color-black-80',
    colorText: '--color-black-90',
    colorTextBase: '--color-black-90',
    colorTextLabel: '--color-black-60',
    colorTextSecondary: '--color-black-50',
    colorTextTertiary: '--color-black-40',
    colorTextQuaternary: '--color-black-30',
    colorTextPlaceholder: '--color-black-20',
    colorTextDisabled: '--color-black-10',

    // 背景與邊框
    colorPage: '--color-white-90',
    colorBgBase: '--color-white-100',
    colorBgTextHover: '--color-white-90',
    colorBgMask: '--color-opacity-50',
    colorBgSpotlight: '--color-opacity-90',
    colorBgContainerDisabled: '--color-white-80',

    colorBorder: '--color-white-60',
    colorBorderSecondary: '--color-white-70',

    // 互動控制
    controlTmpOutline: '--color-white-90',
    controlItemBgActive: '--color-primary-10',
    controlItemBgActiveHover: '--color-primary-10',
    controlItemBgHover: '--color-primary-10',
    controlOutline: '--color-primary-10',
    controlOutlineWidth: 0,
    controlInteractiveSize: 16,

    // 尺寸與字體
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 30,
    controlHeightXS: 24,
    borderRadius: 4,
    borderRadiusLG: 5,
    borderRadiusSM: 3,
    borderRadiusXS: 2,
    borderRadiusOuter: 6,

    fontFamily: '--font-sans',
    fontSize: 14,
    fontSizeHeading1: 48,
    fontSizeHeading2: 36,
    fontSizeHeading3: 30,
    fontSizeHeading4: 24,
    fontSizeHeading5: 20,
    fontSizeXL: 18,
    fontSizeLG: 16,
    fontSizeSM: 12,
    lineHeight: 1.5,
    lineHeightHeading1: 1.5,
    lineHeightHeading2: 1.5,
    lineHeightHeading3: 1.5,
    lineHeightHeading4: 1.5,
    lineHeightHeading5: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5,
    wireframe: true,

    // 動畫
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s'
  }
};

export default theme;
