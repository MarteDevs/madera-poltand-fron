<template>
  <!-- Overlay mobile -->
  <div class="mp-overlay" :class="{ show: menuOpen }" @click="toggleMenu"></div>

  <!-- Riel de navegación -->
  <aside class="mp-rail shadow-lg" :class="{ show: menuOpen }">
    <div class="rail-logo">
      <div class="rail-logo-icon"><i class="bi bi-tree-fill"></i></div>
      <span class="rail-logo-text">Madera Poltand</span>
    </div>

    <nav class="rail-nav">
      <RouterLink to="/dashboard" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Dashboard">
        <i class="bi bi-grid-1x2-fill"></i><span>Dashboard</span>
      </RouterLink>
      <RouterLink to="/requerimientos" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Requerimientos">
        <i class="bi bi-clipboard2-plus-fill"></i><span>Requerimientos</span>
      </RouterLink>
      <RouterLink to="/ingresos" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Ingresos">
        <i class="bi bi-truck-flatbed"></i><span>Ingresos</span>
      </RouterLink>
      <RouterLink to="/analisis" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Análisis">
        <i class="bi bi-bar-chart-fill"></i><span>Análisis</span>
      </RouterLink>

      <div class="rail-divider"></div>

      <RouterLink to="/articulos" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Artículos">
        <i class="bi bi-box-seam"></i><span>Artículos</span>
      </RouterLink>
      <RouterLink to="/minas" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Minas">
        <i class="bi bi-geo-alt-fill"></i><span>Minas</span>
      </RouterLink>
      <RouterLink to="/proveedores" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Proveedores">
        <i class="bi bi-person-badge-fill"></i><span>Proveedores</span>
      </RouterLink>
      <RouterLink to="/supervisores" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Supervisores">
        <i class="bi bi-people-fill"></i><span>Supervisores</span>
      </RouterLink>
      <RouterLink to="/viajes" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Viajes">
        <i class="bi bi-signpost-2-fill"></i><span>Viajes</span>
      </RouterLink>

      <template v-if="esAdmin">
        <div class="rail-divider"></div>
        <RouterLink to="/usuarios" class="rail-link" active-class="active" @click="closeOnMobile" aria-label="Usuarios">
          <i class="bi bi-shield-lock-fill"></i><span>Usuarios</span>
        </RouterLink>
      </template>
    </nav>

    <div class="rail-footer">
      <div class="rail-user">
        <div class="rail-avatar">{{ iniciales }}</div>
        <div class="rail-user-info">
          <span class="rail-user-name">{{ usuario?.nombre || 'Usuario' }}</span>
          <span class="rail-user-role">{{ rolNombre }}</span>
        </div>
      </div>
      <button @click="logout" class="rail-link rail-logout" aria-label="Cerrar sesión">
        <i class="bi bi-box-arrow-left"></i><span>Cerrar sesión</span>
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 14px;
  flex-shrink: 0;
}
.rail-logo-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.05rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59,130,246,0.35);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.rail-logo:hover .rail-logo-icon {
  transform: rotate(-8deg) scale(1.05);
}
.rail-logo-text {
  color: #f1f5f9;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
}

.rail-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  padding: 4px 12px;
  overflow-y: auto;
  overflow-x: hidden;
}

.rail-divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 8px 4px;
}

.rail-link {
  width: 100%; height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 500;
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.rail-link i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
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
  left: -12px; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 20px;
  background: var(--mp-accent);
  border-radius: 0 4px 4px 0;
}

.rail-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 18px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.rail-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
}

.rail-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}
.rail-user-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rail-user-role {
  color: #64748b;
  font-size: 0.72rem;
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
