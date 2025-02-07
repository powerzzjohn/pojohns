import { createApp } from 'vue'
import App from './App.vue'
import { Button, Icon, Toast, Popup } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)

app.use(Button)
   .use(Icon)
   .use(Toast)
   .use(Popup)

app.mount('#app')