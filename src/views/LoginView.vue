<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo -->
      <div class="text-center mb-4">
        <div class="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary text-white fw-bold mb-3"
             style="width:52px;height:52px;font-size:1.2rem;">MP</div>
        <h1 class="h5 fw-bold text-dark mb-1">Madera Poltand ERP</h1>
        <p class="text-muted" style="font-size:0.85rem;">Ingresa tus credenciales para continuar</p>
      </div>

      <!-- Alerta de error -->
      <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center gap-2 py-2" style="font-size:0.85rem;">
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-medium text-dark" style="font-size:0.85rem;">Usuario</label>
          <input
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="Tu nombre de usuario"
            autocomplete="username"
            required
          />
        </div>

        <div class="mb-4">
          <label class="form-label fw-medium text-dark" style="font-size:0.85rem;">Contraseña</label>
          <div class="input-group">
            <input
              v-model="form.password"
              :type="mostrarPass ? 'text' : 'password'"
              class="form-control"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              required
            />
            <button type="button" class="btn btn-outline-secondary" @click="mostrarPass = !mostrarPass">
              <i :class="mostrarPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 fw-medium" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'Ingresando...' : 'Ingresar al sistema' }}
        </button>
      </form>
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