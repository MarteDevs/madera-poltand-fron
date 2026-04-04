<template>
  <div class="login-container">
    <div class="login-box">
      <h2>SISTEMA MADERA POLTAND</h2>
      <p>Inicia sesión para continuar</p>

      <!-- Si hay un error, lo mostramos aquí -->
      <div v-if="authStore.error" class="error-msg">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="iniciarSesion">
        <div class="input-group">
          <label>Usuario:</label>
          <input type="text" v-model="username" required placeholder="Ej: superadmin">
        </div>

        <div class="input-group">
          <label>Contraseña:</label>
          <input type="password" v-model="password" required placeholder="Tu contraseña">
        </div>

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Conectando...' : 'Entrar' }}
        </button>
      </form>
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
    const exito = await authStore.login(username.value, password.value);
    
    if (exito) {
        router.push('/'); // Si entra, vamos a la pantalla principal
    }
    cargando.value = false;
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}
.input-group {
  margin-bottom: 1rem;
  text-align: left;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.input-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 0.75rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}
button:disabled {
  background-color: #95a5a6;
}
.error-msg {
  color: white;
  background-color: #e74c3c;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}
</style>