<template>
  <!-- Overlay mobile -->
  <div class="mp-overlay" :class="{ show: menuOpen }" @click="toggleMenu"></div>

  <!-- Sidebar -->
  <aside class="mp-sidebar shadow-lg" :class="{ show: menuOpen }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <i class="bi bi-tree-fill"></i>
      </div>
      <div class="overflow-hidden">
        <h2 class="sidebar-brand-title">Madera Poltand</h2>
        <p class="sidebar-brand-sub">ERP Industrial v1.2</p>
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
      <RouterLink to="/analisis" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-bar-chart-fill"></i> Análisis
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
      <RouterLink to="/viajes" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-signpost-2-fill"></i> Viajes
      </RouterLink>

      <div v-if="esAdmin" class="nav-section">Administración</div>
      <RouterLink v-if="esAdmin" to="/usuarios" class="nav-link" active-class="active" @click="closeOnMobile">
        <i class="bi bi-shield-lock-fill"></i> Usuarios
      </RouterLink>
    </nav>

    <!-- User footer -->
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar">{{ iniciales }}</div>
        <div class="overflow-hidden">
          <div class="sidebar-user-name">{{ usuario?.nombre }}</div>
          <div class="sidebar-user-role">{{ rolNombre }}</div>
        </div>
      </div>
      <button @click="logout" class="sidebar-logout-btn">
        <i class="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
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
.sidebar-brand {
  padding: 24px 20px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.sidebar-logo {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59,130,246,0.35);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.sidebar-brand:hover .sidebar-logo {
  transform: rotate(-8deg) scale(1.05);
}

.sidebar-brand-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  white-space: nowrap;
}

.sidebar-brand-sub {
  font-size: 0.68rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: auto;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.04);
}

.sidebar-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.sidebar-user-name {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 0.82rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user-role {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 500;
}

.sidebar-logout-btn {
  width: 100%;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.15);
  color: #fca5a5;
  border-radius: 10px;
  padding: 9px 0;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-logout-btn:hover {
  background: rgba(239,68,68,0.15);
  color: #f87171;
  transform: translateY(-1px);
}
</style>
