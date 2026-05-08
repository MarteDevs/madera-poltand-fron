<template>
  <!-- Overlay mobile -->
  <div class="mp-overlay" :class="{ show: menuOpen }" @click="toggleMenu"></div>

  <!-- Sidebar -->
  <aside class="mp-sidebar shadow-lg" :class="{ show: menuOpen }">
    <div class="p-4 d-flex align-items-center gap-3">
      <div class="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white fw-bold"
           style="width:38px;height:38px;font-size:0.9rem;flex-shrink:0;">MP</div>
      <div class="overflow-hidden">
        <h2 class="h6 fw-bold mb-0 text-white text-nowrap">Madera Poltand</h2>
        <p class="mb-0 text-muted" style="font-size:0.7rem;">Gestión ERP v1.2</p>
      </div>
    </div>

    <nav class="flex-grow-1 py-2">
      <div class="nav-section">Operaciones</div>
      <RouterLink to="/dashboard" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-grid-1x2-fill"></i> Dashboard
      </RouterLink>
      <RouterLink to="/requerimientos" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-clipboard2-plus-fill"></i> Requerimientos
      </RouterLink>
      <RouterLink to="/ingresos" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-truck-flatbed"></i> Ingresos
      </RouterLink>

      <div class="nav-section">Catálogos</div>
      <RouterLink to="/articulos" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-box-seam"></i> Artículos
      </RouterLink>
      <RouterLink to="/minas" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-geo-alt-fill"></i> Minas
      </RouterLink>
      <RouterLink to="/proveedores" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-person-badge-fill"></i> Proveedores
      </RouterLink>
      <RouterLink to="/supervisores" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-people-fill"></i> Supervisores
      </RouterLink>

      <div v-if="esAdmin" class="nav-section">Administración</div>
      <RouterLink v-if="esAdmin" to="/usuarios" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-shield-lock-fill"></i> Usuarios
      </RouterLink>
    </nav>

    <div class="p-3 border-top border-secondary border-opacity-25 mt-auto">
      <div class="d-flex align-items-center gap-3 p-2 bg-dark bg-opacity-25 rounded-3 mb-3">
        <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
             style="width:34px;height:34px;font-size:0.8rem;flex-shrink:0;">
          {{ iniciales }}
        </div>
        <div class="overflow-hidden">
          <div class="text-white fw-medium text-truncate" style="font-size:0.8rem;">{{ usuario?.nombre }}</div>
          <div class="text-muted text-truncate" style="font-size:0.7rem;">{{ rolNombre }}</div>
        </div>
      </div>
      <button @click="logout" class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
        <i class="bi bi-box-arrow-left"></i> Cerrar Sesión
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();
const usuario = computed(() => authStore.usuario);
const esAdmin = computed(() => authStore.rol_id === 1 || authStore.rol_id === 2);

const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeOnMobile = () => {
  if (window.innerWidth < 992) {
    menuOpen.value = false;
  }
};

// Escuchar evento personalizado para abrir el menú desde el topbar
const handleToggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

onMounted(() => {
  window.addEventListener('toggle-sidebar', handleToggleMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('toggle-sidebar', handleToggleMenu);
});

const rolNombre = computed(() => {
  const roles = { 1: 'Super Admin', 2: 'Administrador', 3: 'Operador' };
  return roles[authStore.rol_id] || 'Usuario';
});

const iniciales = computed(() => {
  if (!usuario.value?.nombre) return 'U';
  return usuario.value.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};

defineExpose({ toggleMenu });
</script>
