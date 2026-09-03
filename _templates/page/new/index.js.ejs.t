---
to: 'src/pages/<%=workspace%>/index.js'
---
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import cssVariablesPlugin from '@/plugins/cssVariables';
import antdvThemePlugin from '@/plugins/antdvTheme';
import App from './App.vue';
<% if (useRouter) { -%>
import router from './router';
<% } -%>
<% if (useStore) { -%>
import pinia from '@/stores/pinia';
<% } -%>
import '@/assets/styles/tailwind.css';
import { vVariant } from '@/directives/variant';

import '@/plugins/antdvSetup';
import '@/plugins/antdvFeedbackIcons';

const app = createApp(App);
app.use(Antd);
<% if (useRouter) { -%>
app.use(router);
<% } -%>
<% if (useStore) { -%>
app.use(pinia);
<% } -%>
app.use(cssVariablesPlugin);
app.use(antdvThemePlugin);

app.directive('variant', vVariant);

app.mount('#app');
