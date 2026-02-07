import { createRouter, createWebHistory } from 'vue-router';
import ProjectDashboard from './components/ProjectDashboard.vue';
import ProjectView from './components/ProjectView.vue';
import CareerPage from './components/CareerPage.vue';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import UserDashboard from './components/UserDashboard.vue';

const routes = [
    { path: '/', component: CareerPage },
    {
        path: '/projects',
        component: ProjectDashboard,
        meta: {
            requiresAuth: true,
            roles: ['admin', 'user']
        }
    },
    {
        path: '/project/:id',
        component: ProjectView,
        meta: {
            requiresAuth: true,
            roles: ['admin', 'user']
        }
    },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/dashboard', component: UserDashboard, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // 1. Si la route demande une auth et qu'on n'est pas connecté
    if (to.meta.requiresAuth && !token) {
        return next('/login');
    }

    // 2. Si la route demande des rôles spécifiques (ex: ['admin', 'user'])
    if (to.meta.roles && user) {
        // Si le rôle de l'utilisateur n'est PAS dans la liste autorisée
        if (!to.meta.roles.includes(user.role)) {
            // Redirection de sécurité (ex: vers le dashboard perso)
            return next('/dashboard');
        }
    }

    // 3. Tout est bon, on laisse passer
    next();
});

export default router;