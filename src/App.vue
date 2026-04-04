<script setup>
// Aquí importaremos layouts si es necesario más adelante
</script>

<template>
  <!-- Usamos Transition global para animar todas las rutas -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
/* Los estilos globales están ahora centralizados y 
   manejados en src/style.css con variables modernas */
</style>