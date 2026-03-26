import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginView.vue'),
            meta: { requiresGuest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/viewa/RegisterView.vue'),
            meta: { requiresGuest: true }
        },
        {
            path: '/',
            component: () => import('@/components/layout/AppLayout.vue'),
            meta: { requiresAuth: true},
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/DashboardView.vue')
                },
                {
                    path: 'companies',
                    name: 'companies',
                    component: () => import('@/views/CompaniesView.vue')
                },
                {
                    path: 'applications',
                    name: 'applications',
                    component: () => import('@/views/ApplicationsView.vue')
                }
            ]
        }
    ]
});

// navigation guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else if (to.meta.requireGuest && authStore.isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
