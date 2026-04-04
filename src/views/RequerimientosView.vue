<template>
  <div style="padding: 2rem;">
    <h1>Panel Principal (Próximamente)</h1>
    <button @click="salir">Cerrar Sesión</button>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const salir = () => {
    authStore.logout();
    router.push('/login');
};
</script>