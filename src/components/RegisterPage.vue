<template>
  <div class="auth-container">
    <div class="auth-card">
      
      <div class="logo-container">
        <img src="../assets/AMES-Logo.png" alt="Logo AMES" class="auth-logo" />
      </div>

      <div class="card-header">
        <h2>Créer un compte</h2>
      </div>
      
      <form @submit.prevent="handleRegister">
        
        <div class="row">
          <div class="form-group half">
            <label>Prénom *</label>
            <input type="text" v-model="form.firstName" required placeholder="Jean" />
          </div>
          <div class="form-group half">
            <label>Nom *</label>
            <input type="text" v-model="form.lastName" required placeholder="Dupont" />
          </div>
        </div>

        <div class="form-group">
          <label>Email *</label>
          <input type="email" v-model="form.email" required placeholder="jean.dupont@exemple.com" />
        </div>
        <div class="form-group">
          <label>Mot de passe *</label>
          <input type="password" v-model="form.password" required placeholder="********" minlength="6" />
        </div>
        <p v-if="authStore.error" class="error-msg">
          ⚠️ {{ authStore.error }}
        </p>
        <button type="submit" class="btn-primary">S'inscrire</button>
      </form>

      <div class="card-footer">
        <p>
          Déjà un compte ? <router-link to="/login" class="link-accent">Se connecter</router-link>
        </p>
        <p>
          <router-link to="/" class="link-accent">Retour à l'accueil</router-link>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: ''
});

const handleRegister = () => {
  authStore.register(form);
};
</script>

<style scoped>
/* --- MISE EN PAGE --- */
.auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f4f6f8; padding: 20px; }
.auth-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; max-width: 450px; text-align: left; }

/* --- NOUVEAU : STYLE DU LOGO --- */
.logo-container {
  text-align: center;
  margin-bottom: 20px;
}
.auth-logo {
  height: 70px;
  width: auto;
  object-fit: contain;
}

/* --- TYPOGRAPHIE --- */
.card-header {
  text-align: center; /* Titre centré sous le logo */
  margin-bottom: 25px;
}
h2 { color: #2e7d32; margin: 0; }

/* --- FORMULAIRE (Reste identique) --- */
.row { display: flex; gap: 15px; }
.half { flex: 1; }
.form-group { margin-bottom: 20px; text-align: left; }
label { display: block; font-size: 0.9rem; margin-bottom: 8px; color: #555; font-weight: 600; }
input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.3s; }
input:focus { border-color: #2e7d32; outline: none; }
.btn-primary { width: 100%; padding: 12px; background: #2e7d32; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; margin-top: 10px; transition: background 0.3s; }
.btn-primary:hover { background: #1b5e20; }
.error-msg { color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 4px; font-size: 0.9rem; margin-top: 15px; text-align: left; }
.card-footer { margin-top: 20px; text-align: center; font-size: 0.9rem; color: #666; }
.link-accent { color: #2e7d32; text-decoration: none; font-weight: bold; }
</style>