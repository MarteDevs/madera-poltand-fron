<template>
  <div class="login-page">
    <!-- Animated particles background -->
    <div class="login-bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-card">
      <!-- Logo -->
      <div class="text-center mb-4">
        <div class="login-logo-wrapper mx-auto mb-3">
          <div class="login-logo">
            <i class="bi bi-tree-fill"></i>
          </div>
        </div>
        <h1 class="login-title">Madera Poltand</h1>
        <p class="login-subtitle">Sistema de Gestión ERP</p>
      </div>

      <!-- Alerta de error -->
      <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center gap-2 py-2" style="font-size:0.85rem;">
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Usuario</label>
          <div class="login-input-wrapper">
            <i class="bi bi-person-fill login-input-icon"></i>
            <input
              v-model="form.username"
              type="text"
              class="form-control login-input"
              placeholder="Tu nombre de usuario"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label">Contraseña</label>
          <div class="login-input-wrapper">
            <i class="bi bi-lock-fill login-input-icon"></i>
            <input
              v-model="form.password"
              :type="mostrarPass ? 'text' : 'password'"
              class="form-control login-input"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              required
            />
            <button type="button" class="login-eye-btn" @click="mostrarPass = !mostrarPass">
              <i :class="mostrarPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 login-btn" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-arrow-right-circle-fill me-2"></i>
          {{ cargando ? 'Ingresando...' : 'Ingresar al sistema' }}
        </button>
      </form>

      <div class="login-footer">
        <span>Madera Poltand ERP</span> · <span>v1.2</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({ username: '', password: '' });
const cargando = ref(false);
const errorMsg = ref('');
const mostrarPass = ref(false);

const handleLogin = async () => {
  cargando.value = true;
  errorMsg.value = '';
  const result = await authStore.login(form.value.username, form.value.password);
  cargando.value = false;
  if (result.success) {
    router.push('/dashboard');
  } else {
    errorMsg.value = result.mensaje;
  }
};
</script>

<style scoped>
/* Animated background shapes */
.login-bg-shapes {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  z-index: 0;
}
.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(80px);
}
.shape-1 {
  width: 500px; height: 500px;
  background: #3b82f6;
  top: -10%; left: -10%;
  animation: float 10s ease-in-out infinite;
}
.shape-2 {
  width: 400px; height: 400px;
  background: #8b5cf6;
  bottom: -15%; right: -10%;
  animation: float 12s ease-in-out infinite reverse;
}
.shape-3 {
  width: 300px; height: 300px;
  background: #06b6d4;
  top: 40%; right: 20%;
  animation: float 14s ease-in-out infinite 2s;
}

/* Logo */
.login-logo-wrapper {
  width: 72px; height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.35);
  animation: float 4s ease-in-out infinite;
}
.login-logo {
  color: white;
  font-size: 1.8rem;
}

.login-title {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 4px;
}

.login-subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 400;
  margin: 0;
}

/* Inputs */
.login-input-wrapper {
  position: relative;
}
.login-input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.95rem;
  transition: color 0.25s ease;
  z-index: 2;
}
.login-input {
  padding-left: 42px !important;
  padding-right: 42px !important;
  height: 48px;
  border-radius: 12px !important;
  border: 1.5px solid #e2e8f0 !important;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}
.login-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.15) !important;
}
.login-input:focus ~ .login-input-icon,
.login-input-wrapper:focus-within .login-input-icon {
  color: #3b82f6;
}
.login-eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px 6px;
  transition: color 0.2s ease;
  z-index: 2;
}
.login-eye-btn:hover { color: #3b82f6; }

/* Submit button */
.login-btn {
  height: 50px;
  border-radius: 12px !important;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4) !important;
}
.login-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}
</style>