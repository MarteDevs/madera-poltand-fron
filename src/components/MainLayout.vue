<template>
  <!-- Overlay mobile -->
  <div class="mp-overlay" :class="{ show: menuOpen }" @click="toggleMenu"></div>

  <!-- Riel de navegación -->
  <aside class="mp-rail shadow-lg" :class="{ show: menuOpen }">
    <div class="rail-logo" title="Madera Poltand ERP">
      <i class="bi bi-tree-fill"></i>
    </div>

    <nav class="rail-nav">
      <RouterLink to="/dashboard" class="rail-link" active-class="active" @click="closeOnMobile" title="Dashboard" aria-label="Dashboard">
        <i class="bi bi-grid-1x2-fill"></i>
      </RouterLink>
      <RouterLink to="/requerimientos" class="rail-link" active-class="active" @click="closeOnMobile" title="Requerimientos" aria-label="Requerimientos">
        <i class="bi bi-clipboard2-plus-fill"></i>
      </RouterLink>
      <RouterLink to="/ingresos" class="rail-link" active-class="active" @click="closeOnMobile" title="Ingresos" aria-label="Ingresos">
        <i class="bi bi-truck-flatbed"></i>
      </RouterLink>
      <RouterLink to="/analisis" class="rail-link" active-class="active" @click="closeOnMobile" title="Análisis" aria-label="Análisis">
        <i class="bi bi-bar-chart-fill"></i>
      </RouterLink>

      <div class="rail-divider"></div>

      <RouterLink to="/articulos" class="rail-link" active-class="active" @click="closeOnMobile" title="Artículos" aria-label="Artículos">
        <i class="bi bi-box-seam"></i>
      </RouterLink>
      <RouterLink to="/minas" class="rail-link" active-class="active" @click="closeOnMobile" title="Minas" aria-label="Minas">
        <i class="bi bi-geo-alt-fill"></i>
      </RouterLink>
      <RouterLink to="/proveedores" class="rail-link" active-class="active" @click="closeOnMobile" title="Proveedores" aria-label="Proveedores">
        <i class="bi bi-person-badge-fill"></i>
      </RouterLink>
      <RouterLink to="/supervisores" class="rail-link" active-class="active" @click="closeOnMobile" title="Supervisores" aria-label="Supervisores">
        <i class="bi bi-people-fill"></i>
      </RouterLink>
      <RouterLink to="/viajes" class="rail-link" active-class="active" @click="closeOnMobile" title="Viajes" aria-label="Viajes">
        <i class="bi bi-signpost-2-fill"></i>
      </RouterLink>

      <template v-if="esAdmin">
        <div class="rail-divider"></div>
        <RouterLink to="/usuarios" class="rail-link" active-class="active" @click="closeOnMobile" title="Usuarios" aria-label="Usuarios">
          <i class="bi bi-shield-lock-fill"></i>
        </RouterLink>
      </template>
    </nav>

    <div class="rail-footer">
      <button @click="logout" class="rail-link rail-logout" title="Cerrar sesión" aria-label="Cerrar sesión">
        <i class="bi bi-box-arrow-left"></i>
      </button>
      <div class="rail-avatar" :title="`${usuario?.nombre || ''} — ${rolNombre}`">{{ iniciales }}</div>
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
const esAdmin = computed(() => authStore.esAdmin);

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

<style scoped>
.rail-logo {
  width: 40px; height: 40px;
  margin: 16px auto 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.15rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59,130,246,0.35);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rail-logo:hover {
  transform: rotate(-8deg) scale(1.05);
}

.rail-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  padding: 4px 0;
  overflow-y: auto;
}

.rail-divider {
  width: 28px;
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 8px 0;
}

.rail-link {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.rail-link:hover {
  color: #e2e8f0;
  background: rgba(255,255,255,0.08);
}

.rail-link.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.1) 100%);
}

.rail-link.active::before {
  content: '';
  position: absolute;
  left: -10px; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  background: var(--mp-accent);
  border-radius: 0 4px 4px 0;
}

.rail-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0 18px;
}

.rail-logout {
  color: #fca5a5;
}
.rail-logout:hover {
  color: #f87171;
  background: rgba(239,68,68,0.12);
}

.rail-avatar {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.72rem;
  flex-shrink: 0;
  cursor: default;
}
</style>
