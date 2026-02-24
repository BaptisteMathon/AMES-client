import { defineStore } from 'pinia';
import axios from 'axios';
import dayjs from 'dayjs';
import { addBusinessDays, getBusinessDaysDiff } from '../utils/dateUtils';

// CORRECTION ICI : On pointe vers la racine de l'API, pas vers /tasks
const API_BASE_URL = 'https://ames-server.vercel.app/api';

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
                this.tasks = tasksRes.data.map(task => ({
                    ...task,
                    assignedTo: task.assignedTo || [] // Force un tableau vide si le champ n'existe pas
                }));
                this.currentProject = projectRes.data;

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
            try {
                // 1. Envoi au backend
                await axios.put(`${API_BASE_URL}/tasks/${id}`, updates);

                // 2. Mise à jour locale dans le state
                const index = this.tasks.findIndex(t => t._id === id);
                if (index !== -1) {
                    this.tasks[index] = { ...this.tasks[index], ...updates };

                    const updatedTask = this.tasks[index];

                    // --- VÉRIFICATION VERS LE HAUT (Parent) ---
                    if (updatedTask.parent) {
                        this.extendParentIfNeeded(updatedTask.parent);
                    }

                    // --- VÉRIFICATION VERS LE BAS (Enfants) ---
                    // On calcule la nouvelle date de fin de la tâche qu'on vient de modifier
                    const taskEnd = addBusinessDays(updatedTask.start_date, updatedTask.duration);
                    // On lance la fonction qui va raboter les enfants si besoin
                    this.shrinkChildrenIfNeeded(updatedTask._id, taskEnd);
                }
            } catch (err) {
                console.error("Erreur update", err);
            }
        },

        // NOUVELLE FONCTION
        async extendParentIfNeeded(parentId) {
            // On cherche le parent
            const parent = this.tasks.find(t => t._id === parentId);
            if (!parent) return;

            // On récupère TOUS les enfants directs de ce parent
            const children = this.tasks.filter(t => t.parent === parentId);
            if (children.length === 0) return;

            // On cherche la date de fin la plus lointaine parmi les enfants
            let maxChildEndDate = null;

            children.forEach(child => {
                const childEnd = addBusinessDays(child.start_date, child.duration);
                if (!maxChildEndDate || dayjs(childEnd).isAfter(dayjs(maxChildEndDate), 'day')) {
                    maxChildEndDate = childEnd;
                }
            });

            if (!maxChildEndDate) return;

            // On calcule la date de fin actuelle du parent
            const parentEnd = addBusinessDays(parent.start_date, parent.duration);

            // SI un enfant finit APRÈS le parent...
            if (dayjs(maxChildEndDate).isAfter(dayjs(parentEnd), 'day')) {
                // On calcule la nouvelle durée nécessaire
                const newDuration = getBusinessDaysDiff(parent.start_date, maxChildEndDate);

                // Mise à jour locale du parent
                parent.duration = newDuration;

                // Sauvegarde en BDD
                try {
                    await axios.put(`${API_BASE_URL}/tasks/${parent._id}`, { duration: newDuration });
                } catch (err) {
                    console.error("Erreur lors de l'extension du parent", err);
                }

                // Magie récursive : Si le parent a lui-même un parent, on remonte !
                if (parent.parent) {
                    this.extendParentIfNeeded(parent.parent);
                }
            }
        },

        // NOUVELLE FONCTION : Réduire les enfants si le parent rétrécit
        async shrinkChildrenIfNeeded(parentId, parentEndDate) {
            // On récupère tous les enfants directs
            const children = this.tasks.filter(t => t.parent === parentId);

            for (const child of children) {
                const childEnd = addBusinessDays(child.start_date, child.duration);

                // SI l'enfant finit APRÈS la nouvelle date de fin du parent
                if (dayjs(childEnd).isAfter(dayjs(parentEndDate), 'day')) {

                    let newDuration = getBusinessDaysDiff(child.start_date, parentEndDate);
                    let newStartDate = child.start_date;

                    // Sécurité extrême : si la date de DEBUT de l'enfant est maintenant APRES la fin du parent
                    // (ex: parent réduit à 2 jours, mais l'enfant commençait au 5ème jour)
                    if (dayjs(child.start_date).isAfter(dayjs(parentEndDate), 'day')) {
                        newStartDate = parentEndDate; // On recule le début de l'enfant
                        newDuration = 1;              // On lui donne la durée minimum (1 jour)
                    }

                    // 1. Mise à jour locale
                    child.duration = newDuration;
                    child.start_date = newStartDate;

                    // 2. Sauvegarde en Base de données
                    try {
                        await axios.put(`${API_BASE_URL}/tasks/${child._id}`, {
                            duration: newDuration,
                            start_date: newStartDate
                        });
                    } catch (err) {
                        console.error("Erreur lors de la réduction de l'enfant", err);
                    }

                    // 3. Magie récursive : Si cet enfant a LUI-MÊME des enfants (petits-enfants), on remonte la chaîne !
                    this.shrinkChildrenIfNeeded(child._id, parentEndDate);
                }
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