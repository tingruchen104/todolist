import { createApp } from 'vue';
import Antd from 'ant-design-vue';

import App from '@/pages/short-url/App.vue';
import router from '@/pages/short-url/router';
import pinia from '@/stores/pinia';

import cssVariablesPlugin from '@/plugins/cssVariables';
import antdvThemePlugin from '@/plugins/antdvTheme';
import { vVariant } from '@/directives/variant';

import '@/assets/styles/tailwind.css';
import '@/plugins/antdvSetup';
import '@/plugins/antdvFeedbackIcons';

const app = createApp(App);
app.use(Antd);
app.use(router);
app.use(pinia);
app.use(cssVariablesPlugin);
app.use(antdvThemePlugin);

app.directive('variant', vVariant);

app.mount('#app');
