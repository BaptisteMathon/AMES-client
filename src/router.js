import { createRouter, createWebHistory } from 'vue-router';
import ProjectDashboard from './components/ProjectDashboard.vue';
import ProjectView from './components/ProjectView.vue';

const routes = [
    { path: '/projects', component: ProjectDashboard },
    { path: '/project/:id', component: ProjectView }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;