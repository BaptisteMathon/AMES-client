<template>
  <div class="gantt-container">
    
    <div class="gantt-header-spacer">
      <span>Planning Visuel</span>
    </div>

    <div class="gantt-scroll-area">
      
      <div class="header-row" :style="{ width: totalWidth + 'px' }">
        <div 
          v-for="day in daysList" 
          :key="day.date" 
          class="header-day"
          :class="{ 'weekend-header': isWeekend(day.date) }"
        >
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
          :class="{ 'weekend-column': isWeekend(day.date) }"
        ></div>
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
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useTaskStore } from '../stores/taskStore';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const taskStore = useTaskStore();
const COL_WIDTH = 40; // 1 jour = 40px

// -----

const isWeekend = (dateString) => {
  const dayIndex = dayjs(dateString).day(); // 0 = Dimanche, 6 = Samedi
  return dayIndex === 0 || dayIndex === 6;
};

// 2. Calcul de la position de la ligne rouge "Aujourd'hui"
const todayPosition = computed(() => {
  const today = dayjs().startOf('day');
  const start = startDateProject.value;
  const diffDays = today.diff(start, 'day');
  
  // Si "Aujourd'hui" est hors du graphique (avant ou après), on retourne -1 pour le cacher
  if (diffDays < 0 || diffDays > totalDays.value) return -1;
  
  return diffDays * COL_WIDTH;
});

// --- Calculs des dates globales (Identique à avant) ---

const startDateProject = computed(() => {
  if (taskStore.tasks.length === 0) return dayjs().startOf('week');
  const dates = taskStore.tasks.map(t => dayjs(t.start_date).valueOf());
  return dayjs(Math.min(...dates)).startOf('day').subtract(2, 'day');
});

const totalDays = computed(() => {
  if (taskStore.tasks.length === 0) return 30;
  const endDates = taskStore.tasks.map(t => dayjs(t.start_date).add(t.duration, 'day').valueOf());
  const maxDate = dayjs(Math.max(...endDates)).add(5, 'day');
  return maxDate.diff(startDateProject.value, 'day');
});

const totalWidth = computed(() => totalDays.value * COL_WIDTH);

const daysList = computed(() => {
  const days = [];
  for (let i = 0; i < totalDays.value; i++) {
    const date = startDateProject.value.add(i, 'day');
    days.push({
      date: date.format('YYYY-MM-DD'),
      num: date.format('DD'),
      name: date.format('dd')
    });
  }
  return days;
});

const getBarStyle = (task) => {
  const taskStart = dayjs(task.start_date).startOf('day');
  const offsetDays = taskStart.diff(startDateProject.value, 'day');
  
  // --- PALETTE DE COULEURS PROGRESSIVE ---
  const depthColors = [
    '#1b5e20',
    '#388e3c',
    '#4caf50',
    '#81c784',
    '#c8e6c9',
    '#e8f5e9'
  ];

  // On sélectionne la couleur selon la profondeur.
  // Si la profondeur dépasse la taille du tableau, on prend la dernière couleur.
  const color = depthColors[task.depth] || depthColors[depthColors.length - 1];

  return {
    left: (offsetDays * COL_WIDTH) + 'px',
    width: (task.duration * COL_WIDTH) + 'px',
    backgroundColor: color,
    
    // Z-Index : Plus c'est foncé/profond, plus ça doit être au-dessus en cas de superposition
    zIndex: 10 + task.depth, 
    
    cursor: 'default',
    
    // Les parents (Racine) restent un peu transparents
    opacity: task.depth === 0 ? 0.7 : 1,
    borderRadius: task.depth === 0 ? '0' : '4px'
  };
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

/* Header Spacer Bleu */
.gantt-header-spacer {
  height: 50px;
  line-height: 50px;
  background: #2c3e50;
  border-bottom: 1px solid #ddd;
  color: white;
  padding-left: 20px;
  font-weight: bold;
  flex-shrink: 0;
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
  z-index: 50; /* Doit rester au dessus des barres */
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
  z-index: 10; /* Au-dessus de la grille */  
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
  /* Juste un petit effet visuel au survol, mais pas de curseur main */
  filter: brightness(1.1);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3); /* Un voile blanc ou noir transparent */
  border-radius: 4px; /* Même arrondi que le parent */
}

/* 1. LA GRILLE DE FOND */
.grid-background {
  display: flex;
  height: 100%;       /* Prend toute la hauteur */
  position: absolute; /* Se place "derrière" */
  top: 0;
  left: 0;
  z-index: 0;         /* Tout au fond */
  pointer-events: none; /* Laisse passer les clics */
  padding-top: 40px;  /* Pour ne pas dessiner sous le header */
}

.grid-column {
  width: 40px; /* = COL_WIDTH */
  height: 100%;
  border-right: 1px solid #f0f0f0; /* Lignes verticales fines */
  box-sizing: border-box;
}

/* Couleur des week-ends */
.weekend-column {
  background-color: #f1f2f6; /* Gris très léger */
}

.weekend-header {
  background-color: #e2e6ea; /* Header un peu plus foncé le week-end */
  color: #999;
}

/* 2. LIGNE "AUJOURD'HUI" */
.today-line {
  position: absolute;
  top: 40px; /* Juste sous le header */
  bottom: 0;
  width: 2px;
  background-color: #e74c3c; /* Rouge vif */
  z-index: 5; /* Au-dessus de la grille, mais en dessous des barres de tâches */
  pointer-events: none;
  box-shadow: 1px 0 4px rgba(0,0,0,0.2);
}

</style>