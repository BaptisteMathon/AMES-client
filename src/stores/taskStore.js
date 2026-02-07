import { defineStore } from 'pinia';
import axios from 'axios';

// CORRECTION ICI : On pointe vers la racine de l'API, pas vers /tasks
const API_BASE_URL = 'https://ames-server.vercel.app//api';

export const useTaskStore = defineStore('taskStore', {
    state: () => ({
        tasks: [],
        loading: false,
        collapsedIds: [],
        currentProjectId: null,
        currentProject: null
    }),

    getters: {
        hasChildren: (state) => (taskId) => {
            return state.tasks.some(t => t.parent === taskId);
        },

        sortedTasks: (state) => {
            const result = [];

            const addNode = (parentId, depth = 0) => {
                if (state.collapsedIds.includes(parentId)) {
                    return;
                }

                const children = state.tasks.filter(t => t.parent === parentId);

                children.forEach(child => {
                    result.push({ ...child, depth });
                    addNode(child._id, depth + 1);
                });
            };

            const roots = state.tasks.filter(t => !t.parent);

            roots.forEach(root => {
                result.push({ ...root, depth: 0 });
                addNode(root._id, 1);
            });

            return result;
        }
    },

    actions: {
        setProjectId(id) {
            this.currentProjectId = id;
        },

        toggleCollapse(taskId) {
            if (this.collapsedIds.includes(taskId)) {
                this.collapsedIds = this.collapsedIds.filter(id => id !== taskId);
            } else {
                this.collapsedIds.push(taskId);
            }
        },

        async fetchTasks() {
            if (!this.currentProjectId) return;

            this.loading = true;
            try {
                // 1. On lance les deux requêtes en parallèle pour aller plus vite
                const [tasksRes, projectRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/projects/${this.currentProjectId}/tasks`),
                    axios.get(`${API_BASE_URL}/projects/${this.currentProjectId}`) // <--- NOUVEAU APPEL
                ]);

                // 2. On stocke les résultats
                this.tasks = tasksRes.data;
                this.currentProject = projectRes.data; // <--- On a maintenant le nom !

            } catch (err) {
                console.error("Erreur fetch", err);
            } finally {
                this.loading = false;
            }
        },

        async addTask(task) {
            // On s'assure que le projet est bien défini
            if (!this.currentProjectId) {
                console.error("Aucun projet sélectionné !");
                return;
            }

            const taskWithProject = { ...task, project: this.currentProjectId };

            try {
                // CORRECTION URL : On tape sur /tasks (défini dans taskRoutes.js)
                const res = await axios.post(`${API_BASE_URL}/tasks`, taskWithProject);
                this.tasks.push(res.data);
            } catch (err) {
                console.error("Erreur add", err);
            }
        },

        async updateTask(id, updates) {
            const index = this.tasks.findIndex(t => t._id === id);
            if (index !== -1) {
                this.tasks[index] = { ...this.tasks[index], ...updates };
            }
            try {
                // CORRECTION URL
                await axios.put(`${API_BASE_URL}/tasks/${id}`, updates);
            } catch (err) {
                console.error("Erreur update", err);
            }
        },

        async deleteTask(id) {
            this.tasks = this.tasks.filter(t => t._id !== id);
            try {
                // CORRECTION URL
                await axios.delete(`${API_BASE_URL}/tasks/${id}`);
            } catch (err) {
                console.error("Erreur delete", err);
            }
        }
    }
});