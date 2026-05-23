import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/journal' },
  {
    path: '/journal',
    component: () => import('@/views/TheJournal.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/entries',
    component: () => import('@/views/TheEntries.vue'),
    meta: { requiresAuth: true },
    redirect: '/entries/anchored',
    children: [
      { path: 'shared', component: () => import('@/views/SharedEntries.vue') },
      { path: 'anchored', component: () => import('@/views/AnchoredEntries.vue') },
    ],
  },
  { path: '/login', component: () => import('@/views/AuthLogin.vue') },
  { path: '/signup', component: () => import('@/views/AuthSignup.vue') },
  { path: '/forgot-password', component: () => import('@/views/AuthForgotPassword.vue') },
  { path: '/reset-password', component: () => import('@/views/AuthResetPassword.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password', '/reset-password'])

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (AUTH_ROUTES.has(to.path) && isAuthenticated.value && to.path !== '/reset-password') {
    return { path: '/journal' }
  }
  return true
})

export default router
