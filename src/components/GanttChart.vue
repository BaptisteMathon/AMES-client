<template>
  <div class="gantt-container">
    
    <div class="gantt-header-spacer">
      <div class="tabs-container">
        <span 
          class="tab-btn" 
          :class="{ active: activeTab === 'planning' }"
          @click="activeTab = 'planning'"
        >
          Planning Visuel
        </span>
        <span 
          class="tab-btn" 
          :class="{ active: activeTab === 'charge' }"
          @click="activeTab = 'charge'"
        >
          Charge
        </span>
      </div>

      <div class="filter-container" v-if="activeTab === 'charge'">
        <label for="user-filter">Afficher pour :</label>
        <select id="user-filter" v-model="selectedUserId" class="user-select">
          <option 
            v-for="user in assignableUsers" 
            :key="user._id" 
            :value="user._id"
          >
            {{ user.firstName }} {{ user.lastName.charAt(0) }}.
          </option>
        </select>
      </div>
    </div>

    <div v-if="activeTab === 'planning'" class="gantt-scroll-area">
      
      <div class="header-row" :style="{ width: totalWidth + 'px' }">
        <div 
          v-for="day in daysList" 
          :key="day.date" 
          class="header-day"
          :class="{ 'is-overloaded-header': globalOverloadedDays[day.date] }" >
          <div class="day-num">{{ day.num }}</div>
          <div class="day-name">{{ day.name }}</div>
        </div>
      </div>

      <div 
        v-if="todayPosition >= 0"
        class="today-line"
        :style="{ left: todayPosition + 'px' }"
        title="Aujourd'hui"
      ></div>

      <div class="grid-background" :style="{ width: totalWidth + 'px' }">
        <div 
          v-for="day in daysList" 
          :key="'bg-' + day.date" 
          class="grid-column"
          :class="{ 'is-overloaded-bg': globalOverloadedDays[day.date] }" ></div>
      </div>

      <div class="gantt-body">
        <div 
          v-for="task in taskStore.sortedTasks" 
          :key="task._id" 
          class="gantt-row"
          :style="{ width: totalWidth + 'px' }"
        >
          <div 
            class="task-bar"
            :style="getBarStyle(task)"
            :title="task.text + ' (' + task.duration + ' jours)'"
          > 
            <div class="progress-bar" :style="{ width: ((task.progress / task.duration) * 100) + '%' }"></div>
            <span v-if="task.duration > 2" style="position: relative; z-index: 2;">
              {{ task.text }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <div v-else-if="activeTab === 'charge'" class="gantt-scroll-area">
      
      <div class="header-row" :style="{ width: totalWidth + 'px' }">
        <div v-for="day in daysList" :key="'charge-hdr-'+day.date" class="header-day">
          <div class="day-num">{{ day.num }}</div>
          <div class="day-name">{{ day.name }}</div>
        </div>
      </div>

      <div class="gantt-body">
        <div 
          v-for="task in taskStore.sortedTasks" 
          :key="'charge-'+task._id" 
          class="gantt-row charge-row"
          :class="{ 'is-task-overcharged': isTaskOvercharged(task) }"
          :style="{ width: totalWidth + 'px' }"
        >
          <div 
            v-for="day in daysList" 
            :key="'cell-'+day.date" 
            class="charge-cell"
            :class="{ 
              'has-charge': getChargeValue(task, day.date) !== '' && getChargeValue(task, day.date) > 0,
              'is-overloaded': getChargeValue(task, day.date) !== '' && overloadedDays[day.date] 
            }"
          >
            <input 
              v-if="isDayInTask(task, day.date) && task.assignedTo?.some(a => a.user === selectedUserId)"
              type="number" 
              step="0.1" 
              min="0"
              class="charge-input"
              :value="getChargeValue(task, day.date)"
              @change="updateDailyCharge(task, day.date, $event.target.value)"
            />
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { generateWorkingDays } from '../utils/dateUtils'; 

const activeTab = ref('planning');
const selectedUserId = ref('');

dayjs.locale('fr');

const taskStore = useTaskStore();
const authStore = useAuthStore();
const COL_WIDTH = 40; 

// --- Calculs des dates globales ---

const startDateProject = computed(() => {
  if (taskStore.tasks.length === 0) return dayjs().startOf('week');
  const dates = taskStore.tasks.map(t => dayjs(t.start_date).valueOf());
  return dayjs(Math.min(...dates)).startOf('day').subtract(2, 'day');
});

const daysList = computed(() => {
  if (taskStore.tasks.length === 0) {
    const defaultEnd = dayjs().add(45, 'day'); 
    return generateWorkingDays(startDateProject.value, defaultEnd).map(dateStr => ({
       date: dateStr,
       num: dayjs(dateStr).format('DD'),
       name: dayjs(dateStr).format('dd')
    }));
  }

  const endDates = taskStore.tasks.map(t => dayjs(t.start_date).add(t.duration, 'day').valueOf());
  const maxDateTimestamp = Math.max(...endDates);
  const maxDate = dayjs(maxDateTimestamp).add(5, 'day'); 

  const workingDaysStrings = generateWorkingDays(startDateProject.value, maxDate); 

  return workingDaysStrings.map(dateStr => {
    const d = dayjs(dateStr);
    return {
      date: dateStr,
      num: d.format('DD'),
      name: d.format('dd')
    };
  });
});

const totalWidth = computed(() => daysList.value.length * COL_WIDTH); 

const todayPosition = computed(() => {
  const todayStr = dayjs().format('YYYY-MM-DD');
  const index = daysList.value.findIndex(d => d.date === todayStr); 
  
  if (index === -1) return -1; 
  return index * COL_WIDTH;
});

const assignableUsers = computed(() => {
  return authStore.allUsers.filter(u => u.role === 'admin' || u.role === 'user');
});

watch(assignableUsers, (users) => {
  if (users.length > 0 && !selectedUserId.value) {
    selectedUserId.value = users[0]._id;
  }
}, { immediate: true });

const getBarStyle = (task) => {
  const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
  
  let startIndex = daysList.value.findIndex(d => d.date === taskStartStr); 

  if (startIndex === -1) {
     const nextMonday = dayjs(task.start_date).add(1, 'day'); 
     if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
     if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
  }
  
  if (startIndex === -1) return { display: 'none' };

  const depthColors = ['#1b5e20', '#388e3c', '#4caf50', '#81c784', '#c8e6c9', '#e8f5e9'];
  const color = depthColors[task.depth] || depthColors[depthColors.length - 1];

  return {
    left: (startIndex * COL_WIDTH) + 'px', 
    width: (task.duration * COL_WIDTH) + 'px',
    backgroundColor: color,
    zIndex: 10 + task.depth, 
    cursor: 'default',
    opacity: task.depth === 0 ? 0.7 : 1,
    borderRadius: task.depth === 0 ? '0' : '4px'
  };
};

// --- CALCUL DE LA CHARGE PAR JOUR ---
// const getChargeValue = (task, dayDate) => {
//   if (!task.assignedTo || task.assignedTo.length === 0) return '';

//   // NOUVEAU : On filtre les assignations selon l'utilisateur sélectionné
//   let relevantAssignments = task.assignedTo;
//   if (selectedUserId.value !== '') {
//     relevantAssignments = task.assignedTo.filter(a => a.user === selectedUserId.value);
//   }
  
//   // Si l'utilisateur filtré n'est pas sur cette tâche, la case est vide
//   if (relevantAssignments.length === 0) return '';

//   // Le reste du calcul reste identique
//   const currentDayIndex = daysList.value.findIndex(d => d.date === dayDate);
//   const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
//   let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);

//   if (startIndex === -1) {
//      if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
//      if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
//   }

//   if (startIndex === -1) return ''; 

//   const endIndex = startIndex + task.duration - 1;

//   if (currentDayIndex >= startIndex && currentDayIndex <= endIndex) {
    
//     // On calcule le total SEULEMENT pour les assignations filtrées
//     const totalPercentage = relevantAssignments.reduce((sum, assign) => {
//       const pct = assign.percentage !== undefined ? assign.percentage : 100;
//       return sum + pct;
//     }, 0);
    
//     const charge = totalPercentage / 100;
//     return charge > 0 ? charge : '';
//   }

//   return ''; 
// };

const overloadedDays = computed(() => {
  const totals = {};
  if (!selectedUserId.value) return {};

  taskStore.tasks.forEach(task => {
    if (!task.assignedTo) return;
    const assignment = task.assignedTo.find(a => a.user === selectedUserId.value);
    if (!assignment) return;
    
    const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
    let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);
    if (startIndex === -1) {
       if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
       if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
    }
    
    if (startIndex !== -1) {
       const endIndex = startIndex + task.duration - 1;
       for (let i = startIndex; i <= endIndex; i++) {
         if (daysList.value[i]) {
           const dateStr = daysList.value[i].date;
           // NOUVEAU : On utilise la vraie charge lue
           const charge = getDailyChargeForUser(assignment, dateStr);
           totals[dateStr] = (totals[dateStr] || 0) + charge;
         }
       }
    }
  });

  const overloads = {};
  for (const date in totals) {
    // CORRECTION BUG : On arrondit à 2 décimales pour éviter le problème du (0.5+0.5 > 1)
    if (Math.round(totals[date] * 100) / 100 > 1) { 
      overloads[date] = true;
    }
  }
  return overloads;
});

const globalOverloadedDays = computed(() => {
  const totalsByDateAndUser = {};

  taskStore.tasks.forEach(task => {
    if (!task.assignedTo || task.assignedTo.length === 0) return;
    
    const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
    let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);
    if (startIndex === -1) {
       if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
       if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
    }
    
    if (startIndex !== -1) {
       const endIndex = startIndex + task.duration - 1;
       task.assignedTo.forEach(assignment => {
         const userId = assignment.user;
         for (let i = startIndex; i <= endIndex; i++) {
           if (daysList.value[i]) {
             const dateStr = daysList.value[i].date;
             const charge = getDailyChargeForUser(assignment, dateStr); // NOUVEAU
             if (!totalsByDateAndUser[dateStr]) totalsByDateAndUser[dateStr] = {};
             totalsByDateAndUser[dateStr][userId] = (totalsByDateAndUser[dateStr][userId] || 0) + charge;
           }
         }
       });
    }
  });

  const overloads = {};
  for (const date in totalsByDateAndUser) {
    for (const userId in totalsByDateAndUser[date]) {
      if (Math.round(totalsByDateAndUser[date][userId] * 100) / 100 > 1) { 
        overloads[date] = true;
        break; 
      }
    }
  }
  return overloads;
});

// const getChargeValue = (task, dayDate) => {
//   if (!task.assignedTo || !selectedUserId.value) return '';

//   const assignment = task.assignedTo.find(a => a.user === selectedUserId.value);
//   if (!assignment) return ''; // L'utilisateur n'est pas sur cette tâche

//   const currentDayIndex = daysList.value.findIndex(d => d.date === dayDate);
//   const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
//   let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);

//   if (startIndex === -1) {
//      if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
//      if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
//   }

//   if (startIndex === -1) return ''; 

//   const endIndex = startIndex + task.duration - 1;

//   if (currentDayIndex >= startIndex && currentDayIndex <= endIndex) {
//     const pct = assignment.percentage !== undefined ? assignment.percentage : 100;
//     const charge = pct / 100;
//     return charge > 0 ? charge : '';
//   }

//   return ''; 
// };

const getDailyChargeForUser = (assignment, dateStr) => {
  if (assignment.dailyCharges && assignment.dailyCharges[dateStr] !== undefined) {
    return parseFloat(assignment.dailyCharges[dateStr]);
  }
  const pct = assignment.percentage !== undefined ? assignment.percentage : 100;
  return pct / 100;
};

const isDayInTask = (task, dateStr) => {
  const currentDayIndex = daysList.value.findIndex(d => d.date === dateStr);
  const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
  let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);

  if (startIndex === -1) {
     if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
     if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
  }
  if (startIndex === -1) return false;
  
  const endIndex = startIndex + task.duration - 1;
  return currentDayIndex >= startIndex && currentDayIndex <= endIndex;
};

const getChargeValue = (task, dayDate) => {
  if (!task.assignedTo || !selectedUserId.value) return '';
  const assignment = task.assignedTo.find(a => a.user === selectedUserId.value);
  if (!assignment) return ''; 
  if (!isDayInTask(task, dayDate)) return '';

  return getDailyChargeForUser(assignment, dayDate);
};

const isTaskOvercharged = (task) => {
  if (!task.assignedTo || !selectedUserId.value) return false;
  const assignment = task.assignedTo.find(a => a.user === selectedUserId.value);
  if (!assignment) return false;

  const pct = assignment.percentage !== undefined ? assignment.percentage : 100;
  const defaultDailyCharge = pct / 100;
  const initialTotalCharge = task.duration * defaultDailyCharge;

  let currentTotalCharge = 0;
  
  const taskStartStr = dayjs(task.start_date).format('YYYY-MM-DD');
  let startIndex = daysList.value.findIndex(d => d.date === taskStartStr);
  if (startIndex === -1) {
     if (dayjs(task.start_date).day() === 6) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(2, 'day').format('YYYY-MM-DD'));
     if (dayjs(task.start_date).day() === 0) startIndex = daysList.value.findIndex(d => d.date === dayjs(task.start_date).add(1, 'day').format('YYYY-MM-DD'));
  }
  
  if (startIndex !== -1) {
     const endIndex = startIndex + task.duration - 1;
     for (let i = startIndex; i <= endIndex; i++) {
       if (daysList.value[i]) {
         currentTotalCharge += getDailyChargeForUser(assignment, daysList.value[i].date);
       } else {
         currentTotalCharge += defaultDailyCharge;
       }
     }
  }

  // Si le nouveau total est strictement supérieur au budget initial, on alerte !
  return Math.round(currentTotalCharge * 100) > Math.round(initialTotalCharge * 100);
};

const updateDailyCharge = (task, dateStr, newValue) => {
  const assignment = task.assignedTo.find(a => a.user === selectedUserId.value);
  if (!assignment) return;

  // On s'assure que l'objet existe
  if (!assignment.dailyCharges) assignment.dailyCharges = {};

  if (newValue === '') {
    // Si l'utilisateur vide la case, on supprime l'exception (retour au calcul par défaut)
    delete assignment.dailyCharges[dateStr];
  } else {
    // Sinon, on enregistre la nouvelle valeur tapée (ex: 0.5)
    assignment.dailyCharges[dateStr] = parseFloat(newValue);
  }

  // On sauvegarde en base de données !
  taskStore.updateTask(task._id, { assignedTo: task.assignedTo });
};
</script>

<style scoped>
/* Reset de sécurité */
* { box-sizing: border-box; }

.gantt-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-top: none;
  height: 100vh;
}

/* Header Spacer Bleu (Modifié pour les onglets) */
.gantt-header-spacer {
  height: 50px;
  background: #2e7d32;
  color: white;
  padding-left: 20px;
  font-weight: bold;
  flex-shrink: 0;
  
  /* Flexbox pour aligner les boutons horizontalement */
  display: flex;
  align-items: center;
  gap: 15px; 
}

/* Style des boutons onglets */
.tab-btn {
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: 0.6; /* Transparent par défaut */
  user-select: none;
}

.tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 0.9;
}

.tab-btn.active {
  opacity: 1; /* Pleinement visible si actif */
  background-color: rgba(255, 255, 255, 0.2); /* Fond blanc léger */
}

/* --- VUE CHARGE --- */
.charge-row {
  display: flex;
}

.charge-cell {
  width: 40px; /* Doit être exactement égal à COL_WIDTH */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f0f0f0; /* Ligne verticale de séparation */
  font-size: 11px;
  color: #555;
  box-sizing: border-box;
}

/* On met en valeur les cases qui contiennent de la charge */
.charge-cell.has-charge {
  background-color: #e8f5e9; /* Un fond vert très léger */
  font-weight: bold;
  color: #2e7d32;
}

.gantt-scroll-area {
  overflow: auto;
  flex: 1;
  position: relative;
}

/* En-tête Jours */
.header-row {
  display: flex;
  height: 40px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 50; 
}

.header-day {
  width: 40px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
}
.header-day .day-num { font-weight: bold; font-size: 12px; }

/* Lignes */
.gantt-row {
  height: 40px;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 10; 
  background: transparent;
}

.gantt-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Barres */
.task-bar {
  position: absolute;
  top: 8px;
  bottom: 8px;
  border-radius: 4px;
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  padding-left: 5px;
  white-space: nowrap;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.task-bar:hover {
  filter: brightness(1.1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 50%; 
  transform: translateY(-50%); 
  
  height: 65%; 
  background-color: #ff9800; 
  border-radius: 4px;
  z-index: 1; 
  transition: width 0.3s ease-in-out;
}

/* 1. LA GRILLE DE FOND */
.grid-background {
  display: flex;
  height: 100%;       
  position: absolute; 
  top: 0;
  left: 0;
  z-index: 0;         
  pointer-events: none; 
  padding-top: 40px;  
}

.grid-column {
  width: 40px; 
  height: 100%;
  border-right: 1px solid #f0f0f0; 
  box-sizing: border-box;
}

/* 2. LIGNE "AUJOURD'HUI" */
.today-line {
  position: absolute;
  top: 40px; 
  bottom: 0;
  width: 2px;
  background-color: #e74c3c; 
  z-index: 5; 
  pointer-events: none;
  box-shadow: 1px 0 4px rgba(0,0,0,0.2);
}

/* Header Spacer Bleu */
.gantt-header-spacer {
  height: 50px;
  background: #2e7d32;
  color: white;
  padding: 0 20px; /* Padding droite et gauche */
  font-weight: bold;
  flex-shrink: 0;
  
  display: flex;
  align-items: center;
  justify-content: space-between; /* Pousse les onglets à gauche et le filtre à droite */
}

.tabs-container {
  display: flex;
  gap: 15px;
}

/* --- Style du Filtre --- */
.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: normal;
}

.user-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background: white;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}

/* On met en valeur les cases qui contiennent de la charge (Normal) */
.charge-cell.has-charge {
  background-color: #e8f5e9; /* Vert léger */
  font-weight: bold;
  color: #2e7d32;
}

/* NOUVEAU : Alerte de surcharge (Rouge) */
.charge-cell.is-overloaded {
  background-color: #ffebee !important; /* Rouge très clair (écrase le vert) */
  color: #d32f2f !important; /* Texte rouge vif */
}

/* --- ALERTE SURCHARGE DIAGRAMME DE GANTT --- */

/* L'en-tête du jour passe en rouge */
.header-day.is-overloaded-header {
  background-color: #ffebee;
  color: #d32f2f;
}

/* La colonne de fond sur le Gantt devient légèrement rouge */
.grid-column.is-overloaded-bg {
  /* On utilise un fond très transparent (0.08) pour ne pas cacher les barres de tâches ! */
  background-color: rgba(211, 47, 47, 0.08); 
}

/* --- STYLE DE L'INPUT CHARGE --- */
.charge-input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 11px;
  color: inherit;
  font-weight: inherit;
  font-family: inherit;
  padding: 0;
  cursor: text;
}

/* Retire les petites flèches (spinners) des inputs number sur Chrome/Safari/Edge */
.charge-input::-webkit-outer-spin-button,
.charge-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.charge-input[type=number] {
  -moz-appearance: textfield; /* Firefox */
}

/* Petit effet au focus */
.charge-input:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.5);
}

/* --- NOUVEAU : Alerte si la charge manuelle globale de la tâche dépasse le budget initial --- */
.charge-row.is-task-overcharged {
  background-color: #fff3e0 !important; /* Un fond orange très léger pour toute la ligne */
}

/* On force les bordures des cases à se fondre dans ce style pour que ça soit joli */
.charge-row.is-task-overcharged .charge-cell {
  border-right: 1px solid #ffe0b2; 
}
.charge-row.is-task-overcharged .charge-cell.has-charge {
  background-color: #ffe0b2; /* L'intérieur des cases vertes devient orange */
  color: #e65100;
}
</style>