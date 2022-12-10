import 'core-js/es/array/at'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { registerComponents } from './logic'

import 'nprogress/nprogress.css'
import './styles/main.scss'
import './styles/post.scss'

const app = createApp(App)
app.use(router)
app.use(registerComponents)

app.mount('#app')
