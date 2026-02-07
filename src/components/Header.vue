<template>
    <header class="main-header">
      <div class="header-left">
        <div class="header-logo-container" >
            <router-link to="/" class="nav-link">
                <img src="/AMES-Logo.png" alt="Logo" class="app-logo" />
            </router-link>
        </div>
        <span class="brand-name">Mon Parcours</span>
      </div>

      <nav class="main-nav" >
        <router-link to="/projects" class="nav-link" v-if="authStore.isAuthenticated">
            📅 Planification
        </router-link>

        <router-link to="/login" class="nav-link" v-else>
            📅 Planification
        </router-link>
        
        <div v-if="authStore.isAuthenticated">
            <router-link to="/dashboard" class="nav-btn-cta">
            👤 Mon Espace ({{ authStore.user?.firstName }})
            </router-link>
        </div>
        
        <div v-else>
            <router-link to="/login" class="nav-btn-cta">
            Espace Membre
            </router-link>
        </div>
    </nav>
    </header>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
</script>

<style scoped>

.main-header {
  background-image: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  height: 80px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  color: white;
}
.header-left { display: flex; align-items: center; gap: 15px; }
.header-logo-container { background: white; padding: 5px; border-radius: 50%; height: 50px; width: 50px; display: flex; align-items: center; justify-content: center; }
.app-logo { height: 30px; width: auto; }
.brand-name { font-size: 1.4rem; font-weight: 700; letter-spacing: 0.5px; }
.main-nav { display: flex; gap: 25px; align-items: center; }
.nav-link { text-decoration: none; color: rgba(255,255,255,0.9); font-weight: 500; }
.nav-btn-cta { padding: 10px 24px; background: white; color: black; border-radius: 6px; font-weight: 700; text-decoration: none; transition: 0.3s; }
.nav-btn-cta:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

</style>