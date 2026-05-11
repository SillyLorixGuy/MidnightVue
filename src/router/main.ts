import { createRouter, createWebHistory, useRoute } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
    routes: [{ path: '/', redirect: '/journal' }],
})

export default router
export function getView() {
        // Placeholder for view state logic
        return 'JOURNAL';
    }