<template>
  <div class="sidebar">
    <div class="header">
      <h3>Liste des Tâches | {{ taskStore.currentProject?.name || 'Chargement...' }} </h3>
      <button @click="createNewTask" class="add-btn">+ Ajouter</button>
    </div>

    <div class="row header-row">
      <div class="col-name">Nom de la tâche</div>
      <div class="col-date">Début</div>
      <div class="col-dur">Jours</div>
      <div class="col-prog">Progression</div>
      <div class="col-assign">Assignés</div>
      <div class="col-action"></div>
    </div>

    <div v-if="taskStore.loading" class="loading">Chargement...</div>

    <div class="task-list">
        <div 
            v-for="task in taskStore.sortedTasks" 
            :key="task._id" 
            class="row task-row"
        >

            <div class="col-name" :style="{ paddingLeft: (task.depth * 20 + 5) + 'px' }">    
              <span 
                v-if="taskStore.hasChildren(task._id)"
                class="toggle-icon"
                @click="taskStore.toggleCollapse(task._id)"
              >
                {{ taskStore.collapsedIds.includes(task._id) ? '▶' : '▼' }}
              </span>
              
              <span v-else class="toggle-placeholder"></span>

              <input 
                  class="input-clean" 
                  v-model="task.text" 
                  @change="updateTask(task)" 
                  :style="{ fontWeight: task.depth === 0 ? 'bold' : 'normal' }"
                  placeholder="Nom de la tâche"
              />
            </div>

            <input 
              type="date" 
              class="col-date input-clean" 
              :value="formatDateForInput(task.start_date)"
              @input="updateDate($event, task)"
            />
              
            </input>

            <input 
              type="number" 
              min="1"
              class="col-dur input-clean" 
              v-model.number="task.duration" 
              @change="updateTask(task)"
            />

            <input
              type="number"
              min="0"
              :max=task.duration
              class="col-prog input-clean"
              v-model.number="task.progress" 
              @change="updateTask(task)"
            >

            <div class="col-assign relative-container">
  
              <div 
                class="custom-select-btn input-clean" 
                @click.stop="toggleDropdown(task._id)"
              >
                {{ getAssigneesText(task.assignedTo) }}
              </div>

              <div 
                class="custom-dropdown" 
                v-if="openDropdownId === task._id" 
                @click.stop
              >
                <div 
                  v-for="user in assignableUsers" 
                  :key="user._id" 
                  class="dropdown-item-container"
                >
                  <label class="dropdown-item">
                    <input 
                      type="checkbox" 
                      :checked="isAssigned(task, user._id)" 
                      @change="toggleAssign(task, user._id)"
                    />
                    {{ user.firstName }} {{ user.lastName.charAt(0) }}.
                  </label>

                  <div v-if="isAssigned(task, user._id)" class="pct-container">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      class="pct-input" 
                      :value="task.assignedTo.find(a => a.user === user._id)?.percentage" 
                      @change="updatePercentage(task, user._id, $event.target.value)" 
                    /> %
                  </div>

                </div>
              </div>
              
            </div>

            <div class="col-action">
                <button 
                  class="add-child-btn" 
                  @click="createChildTask(task)" 
                  title="Ajouter une sous-tâche"
                >
                  +
                </button>

                <button class="delete-btn" @click="deleteTask(task._id)">
                  &times;
                </button>
            </div>

        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useTaskStore } from '../stores/taskStore'; // On importe le store
import { useAuthStore } from '../stores/authStore';
import dayjs from 'dayjs';

const taskStore = useTaskStore();
const authStore = useAuthStore();

const openDropdownId = ref(null); // Mémorise quel menu est ouvert

const toggleDropdown = (id) => {
  // Ouvre ou ferme le menu de la tâche cliquée
  openDropdownId.value = openDropdownId.value === id ? null : id;
};

const closeDropdown = () => {
  openDropdownId.value = null; // Ferme tout si on clique ailleurs
};

// Filtre des utilisateurs
const assignableUsers = computed(() => {
  return authStore.allUsers.filter(u => u.role === 'admin' || u.role === 'user');
});

// Génère le texte du bouton ("Non assigné", "Jean D.", ou "2 assignés")
// const getAssigneesText = (assignedIds) => {
//   if (!assignedIds || assignedIds.length === 0) return "- Non assigné -";
//   if (assignedIds.length === 1) {
//     const user = assignableUsers.value.find(u => u._id === assignedIds[0]);
//     return user ? `${user.firstName} ${user.lastName.charAt(0)}.` : "1 assigné";
//   }
//   return `${assignedIds.length} assignés`;
// };

// --- GESTION DU MENU DÉROULANT ET POURCENTAGES ---

// 1. Affiche le texte sur le bouton
const getAssigneesText = (assignedTo) => {
  if (!assignedTo || assignedTo.length === 0) return "- Non assigné -";
  
  if (assignedTo.length === 1) {
    // Attention : on lit assignedTo[0].user maintenant !
    const userId = assignedTo[0].user; 
    const user = assignableUsers.value.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName.charAt(0)}.` : "1 assigné";
  }
  return `${assignedTo.length} assignés`;
};

// 2. Vérifie si un utilisateur est dans la liste
const isAssigned = (task, userId) => {
  if (!task.assignedTo) return false;
  return task.assignedTo.some(a => a.user === userId);
};

// 3. Coche/Décoche un utilisateur
const toggleAssign = (task, userId) => {
  if (!task.assignedTo) task.assignedTo = [];
  
  const index = task.assignedTo.findIndex(a => a.user === userId);
  
  if (index !== -1) {
    // Si déjà assigné, on l'enlève
    task.assignedTo.splice(index, 1); 
  } else {
    // Sinon, on l'ajoute
    task.assignedTo.push({ user: userId, percentage: 100 });
  }
  
  // ASTUCE UX : Répartition automatique équitable
  if (task.assignedTo.length > 0) {
    const equalShare = Math.round(100 / task.assignedTo.length);
    task.assignedTo.forEach(a => a.percentage = equalShare);
  }

  updateTask(task);
};

// 4. Modifie manuellement le pourcentage d'un utilisateur
const updatePercentage = (task, userId, newPct) => {
  const assignment = task.assignedTo.find(a => a.user === userId);
  if (assignment) {
    // On s'assure que c'est bien un nombre entre 0 et 100
    assignment.percentage = Math.min(100, Math.max(0, parseInt(newPct) || 0));
    updateTask(task);
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown); // Écoute les clics pour fermer le menu
  taskStore.fetchTasks();
  authStore.fetchAllUsers();
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown); // Nettoyage propre
});

// --- Fonctions Utilitaires ---

// Créer une tâche par défaut
const createNewTask = () => {
  taskStore.addTask({
    text: "Nouvelle tâche",
    start_date: new Date(),
    duration: 1,
    progress: 0,
    assignedTo: [] // <--- NOUVEAU : On prépare le terrain
  });
};

// Mettre à jour la tâche (déclenché quand on quitte un champ)
const updateTask = (task) => {
  // On envoie seulement les champs modifiés au backend
  taskStore.updateTask(task._id, {
    text: task.text,
    duration: task.duration,
    progress: task.progress,
    start_date: task.start_date,
    assignedTo: task.assignedTo || []
  });
};

// Gestion spécifique de la date (l'input date HTML est capricieux)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DD');
};

const updateDate = (event, task) => {
  const newDate = event.target.value;
  task.start_date = newDate; // Mise à jour locale
  updateTask(task); // Envoi au back
};

const deleteTask = (id) => {
  if(confirm("Supprimer cette tâche ?")) {
    taskStore.deleteTask(id);
  }
};

const createChildTask = (parentTask) => {
  taskStore.addTask({
    text: "Nouvelle sous-tâche",
    start_date: parentTask.start_date, 
    duration: 1,
    progress: 0,
    parent: parentTask._id, 
    assignedTo: [] 
  });
};
</script>

<style scoped>
/* Reset de base */
* { box-sizing: border-box; }

.sidebar {
  width: 550px;
  background: #f8f9fa;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
  font-size: 13px;
}

/* --- LE SECRET EST ICI : CSS GRID --- */
/* On définit une grille identique pour le Header ET les Lignes */
.row {
  height: 40px;       /* Hauteur Force brute */
  min-height: 40px;   /* Interdit de rétrécir */
  max-height: 40px;   /* Interdit de grandir */

  display: grid;
  /* Col 1 (Nom) : 1fr (prend toute la place dispo)
     Col 2 (Date) : 110px (fixe)
     Col 3 (Jours) : 50px (fixe)
     Col 4 (Action) : 30px (fixe)
  */
  grid-template-columns: 110px 110px 50px 60px 100px 60px;
  align-items: center; /* Centre verticalement */
  border-bottom: 1px solid #eee;
  padding: 0 10px; /* Marge interne gauche/droite */
  gap: 10px; /* Espace entre les colonnes */
  box-sizing: border-box; /* CRUCIAL pour inclure le border dans les 40px */
}

/* Header spécifique */
.header-row {
  background: #e9ecef;
  font-weight: bold;
  color: #555;
  text-transform: uppercase;
  font-size: 11px;
}

/* --- STYLE DES TEXTES ET INPUTS --- */

/* Pour les titres de colonnes, on centre ce qui doit l'être */
.header-row .col-date,
.header-row .col-dur,
.header-row .col-action,
.header-row .col-prog,
.header-row .col-assign {
  text-align: center;
}

.col-action {
  width: 100%; /* Laisse-la prendre toute la place de sa case grille (60px) */
  display: flex;       /* Pour aligner les boutons côte à côte */
  justify-content: center;
  gap: 5px;            /* Petit espace entre les boutons */
}

.col-prog.input-clean {
  text-align: center;
}

.add-child-btn {
  background: none;
  border: none;
  color: #27ae60;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  padding: 0;
  
  /* --- STABILISATION --- */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;  /* Largeur Fixe (un peu plus large pour être cliquable) */
  border-radius: 50%; /* Toujours rond */
  transition: background-color 0.2s; /* Transition douce */
}

.add-child-btn:hover {
  color: #2ecc71;
  background-color: #e8f8f5;
  /* On ne change PLUS la taille ici, juste la couleur */
}

/* Reset total des inputs pour qu'ils ne cassent pas la grille */
.input-clean {
  width: 100%; /* Prend 100% de sa case de grille */
  border: 1px solid transparent; /* Bordure invisible */
  background: transparent;
  color: #333;
  padding: 5px;
  font-family: inherit;
  font-size: 13px;
  border-radius: 3px;
}

/* Input Date : Centré */
.col-date.input-clean {
  text-align: center;
  font-family: monospace; /* Meilleur alignement des chiffres */
  font-size: 11px;
}

/* Input Durée : Centré */
.col-dur.input-clean {
  text-align: center;
}

/* États interactifs */
.input-clean:focus {
  background: white;
  border: 1px solid #42b983;
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.task-row:hover {
  background-color: #fff;
}

/* Bouton Supprimer */
.delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  justify-content: center; /* Centre la croix dans sa case */
}

/* Header général */
.header {
  height: 50px;       /* Hauteur Force brute */
  line-height: 50px;  /* Centre le texte verticalement */
  padding: 0 15px;    /* Zéro padding vertical ! */
  background: #2e7d32;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.add-btn {
  background: #42b983;
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* Pour aligner la flèche et l'input */
.col-name {
  display: flex; 
  align-items: center;
  /* padding-left est géré dynamiquement dans le HTML */
}

.toggle-icon {
  cursor: pointer;
  width: 20px;       /* Largeur fixe */
  text-align: center;
  font-size: 10px;   /* Petite flèche discrète */
  color: #555;
  user-select: none; /* Empêche de sélectionner le texte de la flèche */
  margin-right: 5px;
}

.toggle-icon:hover {
  color: #000;
  transform: scale(1.2); /* Petit effet zoom */
}

.toggle-placeholder {
  width: 20px;       /* Même largeur que l'icône pour que le texte soit aligné */
  margin-right: 5px;
}

.assign-select {
  height: 34px !important;
  font-size: 11px;
  overflow-y: auto; /* Permet de scroller s'il y a beaucoup d'utilisateurs */
  padding: 2px;
}
.assign-select option {
  padding: 2px 4px;
}

/* --- STYLE DU MENU DÉROULANT ASSIGNÉS --- */
.relative-container {
  position: relative; /* Indispensable pour que le menu flotte par rapport à cette case */
  width: 100%;
}

.custom-select-btn {
  cursor: pointer;
  text-align: center;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-select-btn:hover {
  background: white;
  border: 1px solid #42b983;
}

.custom-dropdown {
  position: absolute;
  top: 35px; /* S'affiche juste en dessous du bouton */
  left: 50%;
  transform: translateX(-50%); /* Pour le centrer parfaitement */
  width: 190px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  z-index: 9999; /* Toujours au premier plan */
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 5px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
  color: #333;
  transition: background 0.2s;
  gap: 8px; /* Espace entre la case et le nom */
}

.dropdown-item:hover {
  background-color: #f0fdf4; /* Petit fond vert au survol */
}

.dropdown-item input[type="checkbox"] {
  cursor: pointer;
}

/* --- NOUVEAUX STYLES POUR LE POURCENTAGE --- */
.dropdown-item-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
}

.dropdown-item-container:hover {
  background-color: #f0fdf4;
}

/* On réajuste le dropdown-item car son parent gère le hover maintenant */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  margin: 0;
  padding: 4px 0;
}
.dropdown-item:hover { background-color: transparent; } 

.pct-container {
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 2px;
}

.pct-input {
  width: 45px;
  padding: 2px;
  font-size: 11px;
  text-align: right;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.pct-input:focus {
  border-color: #42b983;
  outline: none;
}
</style>