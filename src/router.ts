import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import postRoutes from '~pages'
import Home from '@/pages/home.md'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    ...postRoutes,
  ],
})

router.beforeEach((_, __, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
