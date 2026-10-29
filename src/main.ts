import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './theme.css'
import { themeReady } from './theme'
import App from './App.vue'
import i18n from './language'

const app = createApp(App)
app.use(Antd)
app.use(i18n)
themeReady.then(() => app.mount('#app'))