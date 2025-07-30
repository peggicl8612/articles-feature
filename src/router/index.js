/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHashHistory, START_LOCATION } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useAxios } from '@/composables/axios'
import { useUserStore } from '@/stores/user'
import i18n from '@/i18n'
import adminHome from '@/pages/home.vue'
import adminLayout from '@/layouts/adminLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts([
    ...routes, // 自动生成的路由
    {
      path: '/admin',
      component: adminLayout,
      children: [
        {
          path: '/home',
          name: 'Home',
          component: adminHome,
          meta: {
            layout: 'admin',
            login: true,
            admin: true,
            title: 'nav.admin',
          },
        },
      ],
    },
    {
      path: '/',
      redirect: '/home',
    },
  ]),
})

router.beforeEach(async (to, from, next) => {
  const { apiAuth } = useAxios()
  const user = useUserStore()

  if (from === START_LOCATION && user.isLoggedIn) {
    try {
      const { data } = await apiAuth.get('/user/profile')
      user.login(data.result)
    } catch (error) {
      console.log(error)
      user.logout()
      next('/home')
      return
    }
  }

  if (user.isLoggedIn && ['/login', '/register'].includes(to.path)) {
    next('/home')
  } else if (to.meta.login && !user.isLoggedIn) {
    next('/login')
  } else if (to.meta.admin && !user.isAdmin) {
    next('/home')
  } else {
    next()
  }
})

router.afterEach((to) => {
  document.title = i18n.global.t(to.meta.title) + ' | 咪凹屋'
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
