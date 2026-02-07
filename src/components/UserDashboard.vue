<template>
  <div class="dashboard-page">
    
    <header class="main-header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <div class="header-logo-container">
            <img src="/AMES-Logo.png" alt="Logo" class="app-logo" />
          </div>
          <span class="brand-name">Mon Espace</span>
        </router-link>
      </div>
      <nav class="main-nav">
        <router-link to="/projects" class="nav-link">📅 Planification</router-link>
        <button @click="handleLogout" class="nav-btn-logout">Déconnexion</button>
      </nav>
    </header>

    <main class="content-container">
      
      <div class="profile-card">
        <div class="card-header">
          <h2>Mon Profil</h2>
          <p>Gérez vos informations personnelles</p>
        </div>
        <form @submit.prevent="saveChanges" class="profile-form">
          <div class="form-row">
            <div class="form-group half">
              <label>Prénom</label>
              <input type="text" v-model="form.firstName" required />
            </div>
            <div class="form-group half">
              <label>Nom</label>
              <input type="text" v-model="form.lastName" required />
            </div>
          </div>
           <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="form.email" disabled class="input-disabled" />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <span class="role-badge">{{ authStore.user?.role || 'Guest' }}</span>
          </div>
          <div class="actions">
            <button type="submit" class="btn-save">Enregistrer les modifications</button>
          </div>
        </form>
      </div>

      <div v-if="authStore.isAdmin" class="admin-section">
        
        <div class="admin-header">
          <h3>👥 Gestion des Utilisateurs (Admin)</h3>
          <button @click="loadUsers" class="btn-refresh">🔄 Rafraîchir la liste</button>
        </div>

        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle Actuel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                <tr v-for="user in authStore.allUsers" :key="user._id">
                    <td>{{ user.firstName }} {{ user.lastName }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                        <span :class="['badge', getBadgeClass(user.role)]">
                        {{ user.role }}
                        </span>
                    </td>
                    <td class="actions-cell">
                        
                        <button 
                        v-if="user.role !== 'admin'"
                        @click="changeRole(user._id, 'admin')"
                        class="btn-action btn-make-admin"
                        title="Promouvoir Admin"
                        >
                        ⬆️ Admin
                        </button>

                        <button 
                        v-if="user.role !== 'user'"
                        @click="changeRole(user._id, 'user')"
                        class="btn-action btn-make-user"
                        title="Passer User Standard"
                        >
                        👤 User
                        </button>

                        <button 
                        v-if="user.role !== 'guest'"
                        @click="changeRole(user._id, 'guest')"
                        class="btn-action btn-make-guest"
                        title="Rétrograder Guest"
                        >
                        ⬇️ Guest
                        </button>

                    </td>
                </tr>
            </tbody>
          </table>
          
          <p v-if="authStore.allUsers.length === 0" class="empty-msg">
            Cliquez sur "Rafraîchir" pour voir les utilisateurs.
          </p>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive({
  firstName: '',
  lastName: '',
  email: ''
});

onMounted(() => {
  if (authStore.user) {
    form.firstName = authStore.user.firstName;
    form.lastName = authStore.user.lastName;
    form.email = authStore.user.email;
    
    // Si c'est un admin, on charge la liste tout de suite !
    if (authStore.isAdmin) {
      authStore.fetchAllUsers();
    }
  } else {
    router.push('/login');
  }
});

const saveChanges = () => {
  authStore.updateProfile(authStore.user._id, {
    firstName: form.firstName,
    lastName: form.lastName
  });
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// --- LOGIQUE ADMIN ---
const loadUsers = () => {
  authStore.fetchAllUsers();
};

const changeRole = (userId, newRole) => {
  if (confirm(`Voulez-vous vraiment passer cet utilisateur en ${newRole} ?`)) {
    authStore.updateUserRole(userId, newRole);
  }
};

const getBadgeClass = (role) => {
  switch(role) {
    case 'admin': return 'badge-admin';
    case 'user': return 'badge-user';
    default: return 'badge-guest';
  }
};
</script>

<style scoped>
/* Layout Global */
.dashboard-page {
  font-family: 'Segoe UI', sans-serif;
  background-color: #f4f6f8;
  min-height: 100vh;
}

/* Header (Repris de CareerPage) */
.main-header {
  background-image: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  height: 80px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: white;
}
.header-left { display: flex; align-items: center; }
.logo-link { text-decoration: none; display: flex; align-items: center; gap: 15px; color: white; }
.header-logo-container { background: white; padding: 5px; border-radius: 50%; height: 50px; width: 50px; display: flex; align-items: center; justify-content: center; }
.app-logo { height: 30px; width: auto; }
.brand-name { font-size: 1.4rem; font-weight: 700; }
.nav-link { color: rgba(255,255,255,0.9); text-decoration: none; font-weight: 500; margin-right: 20px; }
.nav-link:hover { color: white; text-decoration: underline; }

/* Bouton Déconnexion */
.nav-btn-logout {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.nav-btn-logout:hover { background: #c62828; border-color: #c62828; }

/* Carte Profil */
.content-container {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.profile-card {
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.card-header h2 { margin: 0 0 5px 0; color: #2e7d32; }
.card-header p { color: #666; margin-bottom: 30px; }

/* Formulaire */
.form-row { display: flex; gap: 20px; margin-bottom: 20px; }
.half { flex: 1; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 600; color: #333; font-size: 0.9rem; }

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box; /* Important */
}
input:focus { outline: none; border-color: #2e7d32; }

/* Input désactivé (Email) */
.input-disabled {
  background-color: #f0f0f0;
  color: #777;
  cursor: not-allowed;
  border-color: #eee;
}

.role-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.btn-save {
  width: 100%;
  padding: 14px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.3s;
}
.btn-save:hover { background: #1b5e20; }

.content-container {
  padding: 40px 20px;
  display: flex;
  flex-direction: column; /* Important pour empiler les cartes */
  align-items: center;
  gap: 30px;
}

/* --- STYLE SECTION ADMIN --- */
.admin-section {
  background: white;
  width: 100%;
  max-width: 800px; /* Un peu plus large pour le tableau */
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border-top: 5px solid #2e7d32; /* Petit accent vert */
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.admin-header h3 { margin: 0; color: #333; }

.btn-refresh {
  background: #f1f8e9;
  border: 1px solid #c5e1a5;
  color: #2e7d32;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-refresh:hover { background: #dcedc8; }

/* TABLEAU */
.users-table-container { overflow-x: auto; }
.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.users-table th {
  text-align: left;
  padding: 12px;
  background-color: #f9f9f9;
  border-bottom: 2px solid #eee;
  color: #555;
}

.users-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

/* BADGES DE ROLE */
.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
.badge-admin { background-color: #e3f2fd; color: #1565c0; } /* Bleu */
.badge-user { background-color: #f1f8e9; color: #2e7d32; } /* Vert */

/* BOUTONS ACTIONS */
.actions-cell { display: flex; gap: 10px; }
.btn-action {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: 0.2s;
}

.btn-make-admin {
  background-color: #e3f2fd;
  color: #1565c0;
}
.btn-make-admin:hover { background-color: #bbdefb; }

.btn-make-user {
  background-color: #fff3e0;
  color: #e65100;
}
.btn-make-user:hover { background-color: #ffe0b2; }

.empty-msg { text-align: center; color: #777; margin-top: 20px; }

/* Style pour le bouton Guest */
.btn-make-guest {
  background-color: #ffebee;
  color: #c62828;
}
.btn-make-guest:hover { background-color: #ffcdd2; }

/* Mise à jour des badges (Optionnel, pour faire joli) */
.badge-guest { background-color: #f5f5f5; color: #757575; border: 1px solid #ddd; }
</style>