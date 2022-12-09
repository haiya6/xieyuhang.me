import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Post from '@/components/Post.vue'

import './styles/main.scss'
import './styles/post.scss'

const app = createApp(App)
app.use(router)

app.component('Post', Post)

app.mount('#app')
