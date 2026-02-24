import { defineStore } from 'pinia';
import axios from 'axios';
import router from '../router';

const API_URL = "https://ames-server.vercel.app/api/projects";

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        error: null,
        allUsers: []
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'admin',
        fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
    },

    actions: {
        // --- INSCRIPTION ---
        async register(userData) {
            this.error = null;
            try {
                const res = await axios.post(`${API_URL}/register`, userData);
                this.setSession(res.data);

                router.push('/dashboard');
            } catch (err) {
                this.error = err.response?.data?.message || "Erreur lors de l'inscription";
            }
        },

        // --- CONNEXION ---
        async login(credentials) {
            this.error = null;
            try {
                const res = await axios.post(`${API_URL}/login`, credentials);
                this.setSession(res.data);
                router.push('/dashboard');
            } catch (err) {
                this.error = err.response?.data?.message || "Email ou mot de passe incorrect";
            }
        },

        // --- DECONNEXION ---
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            router.push('/login');
        },

        // --- C'EST ICI QU'IL MANQUAIT SUREMENT VOTRE FONCTION ---
        // 👇👇👇👇👇👇
        async updateProfile(userId, updates) {
            this.error = null;
            try {
                // On envoie le token actuel au back pour vérification (si nécessaire)
                // Note: Idéalement le token est géré par un intercepteur Axios, mais faisons simple ici
                const payload = { ...updates, token: this.token };

                // Attention: la route PUT doit bien exister côté serveur
                const res = await axios.put(`${API_URL}/${userId}`, payload);

                // On met à jour la session avec les nouvelles infos reçues du back
                this.setSession(res.data);

                alert("Profil mis à jour avec succès !");
            } catch (err) {
                this.error = err.response?.data?.message || "Erreur de mise à jour";
                console.error(err);
            }
        },

        // --- UTILITAIRE SESSION ---
        setSession(data) {
            this.user = {
                _id: data._id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role
            };
            this.token = data.token; // Ou data.token selon ce que renvoie ton back

            localStorage.setItem('user', JSON.stringify(this.user));
            if (this.token) localStorage.setItem('token', this.token);
        },

        async fetchAllUsers() {
            try {
                const res = await axios.get(`${API_URL}/all`);
                this.allUsers = res.data;
            } catch (err) {
                console.error("Erreur fetch users", err);
            }
        },

        // Changer le rôle d'un utilisateur
        async updateUserRole(userId, newRole) {
            try {
                await axios.put(`${API_URL}/role/${userId}`, { newRole });

                // On met à jour la liste localement pour voir le changement tout de suite
                const user = this.allUsers.find(u => u._id === userId);
                if (user) user.role = newRole;

                alert(`Rôle modifié en ${newRole} !`);
            } catch (err) {
                alert("Erreur lors du changement de rôle");
            }
        },
    }
});