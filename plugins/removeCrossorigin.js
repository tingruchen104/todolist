/**
 * 移除 Vite 注入的 crossorigin attribute。
 * 部署環境會由 CDN 載入產物，需沿用既有不帶 CORS attribute 的 HTML 契約。
 */
const removeCrossorigin = () => ({
  name: 'remove-crossorigin',
  transformIndexHtml(html) {
    return html.replace('crossorigin', '');
  }
});

export default removeCrossorigin;
