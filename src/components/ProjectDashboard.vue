<template>

  <Header />

  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Mes Projets</h1>
      
      <div class="user-info" v-if="authStore.user">
        <span>Bonjour, <strong>{{ authStore.fullName }}</strong></span>
        <span class="role-badge">{{ authStore.user.role }}</span>
      </div>
    </div>
    
    <div class="create-box">
      <input 
        v-model="newProjectName" 
        placeholder="Nom du nouveau projet..." 
        @keyup.enter="createProject"
      >
      <button @click="createProject">Créer</button>
    </div>

    <div class="grid">
      <div 
        v-for="proj in projects" 
        :key="proj._id" 
        class="card" 
        @click="goToProject(proj._id)"
      >
        <div class="card-content">
          <h3>{{ proj.name }}</h3>
          <p>Créé le : {{ new Date(proj.created_at).toLocaleDateString() }}</p>
        </div>

        <button 
          class="delete-btn" 
          @click.stop="deleteProject(proj._id, proj.name)"
          title="Supprimer le projet"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Header from './Header.vue';
import { useAuthStore } from '../stores/authStore';

const projects = ref([]);
const newProjectName = ref('');
const router = useRouter();
const authStore = useAuthStore();

// URL de base (adapter si besoin)
const API_URL = 'https://ames-server.vercel.app//api/projects';

const fetchProjects = async () => {
  try {
    const res = await axios.get(API_URL);
    projects.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const createProject = async () => {
  if (!newProjectName.value) return;
  try {
    await axios.post(API_URL, { name: newProjectName.value });
    newProjectName.value = '';
    fetchProjects();
  } catch (err) {
    console.error(err);
  }
};

// --- LOGIQUE DE SUPPRESSION SÉCURISÉE ---
const deleteProject = async (id, name) => {
  // Confirmation 1
  if (!confirm(`Voulez-vous vraiment supprimer le projet "${name}" ?`)) {
    return;
  }

  // Confirmation 2 (Double Check)
  if (!confirm(`⚠️ ATTENTION : Cette action est irréversible !\n\nToutes les tâches associées à "${name}" seront définitivement effacées.\n\nÊtes-vous sûr de vouloir continuer ?`)) {
    return;
  }

  // Suppression réelle
  try {
    await axios.delete(`${API_URL}/${id}`);
    // On rafraîchit la liste localement pour éviter un rechargement de page
    projects.value = projects.value.filter(p => p._id !== id);
  } catch (err) {
    alert("Erreur lors de la suppression : " + err.message);
  }
};

const goToProject = (id) => {
  router.push(`/project/${id}`);
};

onMounted(fetchProjects);
</script>

<style scoped>
.dashboard { padding: 40px; background: #f4f6f8; min-height: 100vh; }

.create-box { margin-bottom: 30px; display: flex; gap: 10px; }
.create-box input { padding: 10px; font-size: 16px; width: 300px; border: 1px solid #ddd; border-radius: 4px; }
.create-box button { padding: 10px 20px; background: #2e7d32; color: white; border: none; cursor: pointer; border-radius: 4px; }
.create-box button:hover { background: #1b5e20; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }

.card { 
  background: white; 
  border-radius: 8px; 
  cursor: pointer; 
  transition: transform 0.2s, box-shadow 0.2s; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: relative; /* Pour positionner le bouton delete en absolu */
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card:hover { transform: translateY(-5px); border-bottom: 4px solid #42b983; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }

.card-content { padding: 20px; }
.card h3 { margin: 0 0 10px 0; color: #2c3e50; }
.card p { margin: 0; color: #7f8c8d; font-size: 0.9em; }

/* Style du bouton supprimer */
.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0; /* Caché par défaut */
  transition: opacity 0.2s;
  padding: 5px;
  border-radius: 4px;
}

.delete-btn:hover {
  background-color: #fee; /* Fond rouge très pâle au survol */
}

/* On affiche le bouton quand on survole la carte */
.card:hover .delete-btn {
  opacity: 1;
}


.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  font-size: 0.9rem;
}
.role-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: bold;
}
</style>