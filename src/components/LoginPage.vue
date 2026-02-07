<template>
  <div class="auth-container">
    <div class="auth-card">
      
      <div class="logo-container">
        <img src="/AMES-Logo.png" alt="Logo AMES" class="auth-logo" />
      </div>

      <div class="card-header">
        <h2>Bon retour parmi nous 👋</h2>
        <p class="subtitle">Connectez-vous pour accéder à vos projets</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" required placeholder="exemple@mail.com" autofocus />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" v-model="form.password" required placeholder="Votre mot de passe" />
        </div>
        <div v-if="authStore.error" class="error-msg">
          ⚠️ {{ authStore.error }}
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>
      
      <div class="card-footer">
        <p>
          Pas encore de compte ? 
          <router-link to="/register" class="link-accent">Créer un compte</router-link>
        </p>
        <p>
          <router-link to="/" class="link-accent">Retour à l'accueil</router-link>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;
  await authStore.login(form);
  loading.value = false;
};
</script>

<style scoped>
/* --- MISE EN PAGE --- */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f8;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 400px;
  text-align: left;
}

/* --- NOUVEAU : STYLE DU LOGO --- */
.logo-container {
  text-align: center;
  margin-bottom: 20px; /* Espace sous le logo */
}

.auth-logo {
  height: 70px; /* Hauteur fixe pour que ça soit joli */
  width: auto;  /* Largeur automatique pour ne pas déformer */
  object-fit: contain;
}

/* --- TYPOGRAPHIE --- */
.card-header {
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #2e7d32;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

/* --- FORMULAIRE (Reste identique) --- */
.form-group { margin-bottom: 20px; }
label { display: block; font-size: 0.9rem; margin-bottom: 8px; color: #333; font-weight: 600; }
input { width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; box-sizing: border-box; transition: all 0.3s ease; background-color: #fcfcfc; }
input:focus { border-color: #2e7d32; background-color: #fff; outline: none; box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1); }
.btn-primary { width: 100%; padding: 14px; background: #2e7d32; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; margin-top: 10px; transition: background 0.3s, transform 0.2s; }
.btn-primary:hover { background: #1b5e20; transform: translateY(-1px); }
.btn-primary:disabled { background: #a5d6a7; cursor: not-allowed; transform: none; }
.error-msg { background-color: #ffebee; color: #c62828; padding: 10px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 20px; border: 1px solid #ffcdd2; text-align: center; }
.card-footer { margin-top: 25px; text-align: center; font-size: 0.9rem; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
.link-accent { color: #2e7d32; text-decoration: none; font-weight: bold; }
.link-accent:hover { text-decoration: underline; }
</style>