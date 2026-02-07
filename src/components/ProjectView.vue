<template>
  <div class="app-container">

    <div class="back-nav">
      <router-link to="/projects">← Retour aux projets</router-link>
      <span class="project-title">{{ currentProjectName }}</span>
    </div>

    <div class="workspace">
      <TaskSidebar />
      <GanttChart />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTaskStore } from '../stores/taskStore';
import TaskSidebar from './TaskSideBar.vue';
import GanttChart from './GanttChart.vue';
import axios from 'axios'; // Pour choper le nom du projet

const route = useRoute();
const taskStore = useTaskStore();
const currentProjectName = ref('');

onMounted(async () => {
  const projectId = route.params.id;
  
  // 1. On dit au store de charger les tâches DE CE PROJET
  taskStore.setProjectId(projectId);
  taskStore.fetchTasks();

  // 2. On récupère le nom du projet (Optionnel, juste pour l'affichage)
  // (Il faudrait idéalement une route API GET /api/projects/:id)
  // Pour l'instant on fait simple ou on laisse vide
});
</script>

<style scoped>
.app-container { display: flex; flex-direction: column; height: 100vh; }
.back-nav { height: 40px; background: #2e7d32; color: white; display: flex; align-items: center; padding: 0 20px; gap: 20px; }
.back-nav a { color: #fff; text-decoration: none; font-size: 14px; }
.back-nav a:hover { color: white; text-decoration: underline; }
.project-title { font-weight: bold; }
.workspace { display: flex; flex: 1; overflow: hidden; }
</style>