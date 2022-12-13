import { createRouter, createWebHistory } from 'vue-router'
import postRoutes from '~pages'
import Home from '@/pages/home.md'
import NProgress from 'nprogress'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    ...postRoutes
  ]
})

router.beforeEach((_, __, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
