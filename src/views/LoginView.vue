<template>
  <div class="login-page">
    
    <!-- Animación dinámica de fondo con esferas borrosas para dar aspecto dinámico premium -->
    <div class="glow-sphere sphere-1"></div>
    <div class="glow-sphere sphere-2"></div>
    
    <div class="login-wrapper">
      <div class="glass-panel login-box">
        
        <div class="login-header">
          <div class="logo-placeholder">MP</div>
          <h2>MADERA POLTAND</h2>
          <p class="subtitle">Ingreso Seguro al ERP</p>
        </div>

        <transition name="fade">
          <div v-if="authStore.error" class="error-toast">
            <span class="icon">⚠️</span> {{ authStore.error }}
          </div>
        </transition>

        <form @submit.prevent="iniciarSesion" class="login-form">
          <div class="input-group">
            <label for="username">Usuario</label>
            <input 
              type="text" 
              id="username"
              class="premium-input"
              v-model="username" 
              required 
              placeholder="Ingrese su credencial"
              autocomplete="username"
            >
          </div>

          <div class="input-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              class="premium-input"
              v-model="password" 
              required 
              placeholder="••••••••"
              autocomplete="current-password"
            >
          </div>

          <button type="submit" class="premium-btn" :disabled="cargando">
            <span v-if="!cargando">Acceder al Sistema</span>
            <span v-else class="loading-state">
              <span class="spinner"></span> Autenticando...
            </span>
          </button>
        </form>
        
        <div class="login-footer">
          <small>&copy; 2026 Madera Poltand Logística</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const cargando = ref(false);

const iniciarSesion = async () => {
    cargando.value = true;
    const { success } = await authStore.login(username.value, password.value); // Modificado para desestructurar The response from the new pinia store return pattern
    
    if (success) {
        authStore.error = null; // Clear error on success
        router.push('/requerimientos'); // Si entra, vamos al dashboard
    }
    cargando.value = false;
};
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 1rem;
}

/* Background animated spheres */
.glow-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
}

.sphere-1 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  top: -100px;
  left: -100px;
}

.sphere-2 {
  width: 300px;
  height: 300px;
  background: #6366f1; /* Indigo tone complementing Cyan */
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(30px) scale(1.1); }
}

.login-wrapper {
  position: relative;
  z-index: 1; /* Above the spheres */
  width: 100%;
  max-width: 420px;
}

.login-box {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-header {
  text-align: center;
}

.logo-placeholder {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), #6366f1);
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 20px var(--primary-glow);
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  letter-spacing: -0.025em;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.error-toast {
  background-color: var(--error-glow);
  border: 1px solid var(--error);
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 1rem;
  color: var(--text-muted);
  opacity: 0.6;
}
</style>