<template>
  <div class="app-layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar glass-panel">
      <div class="sidebar-header">
        <div class="logo-mini">MP</div>
        <h2 class="brand-text">Madera Poltand</h2>
      </div>

      <nav class="sidebar-nav">
        <!-- We use RouterLink for native Vue routing -->
        <router-link to="/requerimientos" class="nav-item" active-class="active">
          <span class="icon">📋</span> Requerimientos
        </router-link>
        
        <router-link to="/ingresos" class="nav-item" active-class="active">
          <span class="icon">📥</span> Ingreso Madera
        </router-link>

        <div class="nav-section-title">Maestros</div>
        
        <router-link to="/articulos" class="nav-item" active-class="active">
          <span class="icon">🪵</span> Artículos
        </router-link>
        
        <router-link to="/proveedores" class="nav-item" active-class="active">
           <span class="icon">🏢</span> Proveedores
        </router-link>
        
        <router-link to="/minas" class="nav-item" active-class="active">
           <span class="icon">⛰️</span> Minas
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ inicialUsuario }}</div>
          <span class="username">{{ authStore.usuario?.username || 'Usuario' }}</span>
        </div>
        <button @click="cerrarSesion" class="logout-btn" title="Cerrar Sesión">
          <span class="icon">🚪</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <header class="top-header glass-panel">
        <h1 class="page-title">{{ props.pageTitle }}</h1>
        <div class="header-actions">
           <!-- Tools, Notifications, etc could go here -->
           <span class="status-badge online">● En línea</span>
        </div>
      </header>
      
      <div class="content-wrapper scrollable">
        <!-- Render children here -->
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';

const props = defineProps({
    pageTitle: {
        type: String,
        default: 'Dashboard'
    }
});

const authStore = useAuthStore();
const router = useRouter();

const inicialUsuario = computed(() => {
    const user = authStore.usuario?.username || 'U';
    return user.charAt(0).toUpperCase();
});

const cerrarSesion = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  padding: 1rem;
  gap: 1rem;
}

/* SIDEBAR */
.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
}

.logo-mini {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), #6366f1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}

.brand-text {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
}

.nav-section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
  font-weight: 600;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: rgba(14, 165, 233, 0.15); /* Primary slightly transparent */
  color: var(--primary);
  border-color: var(--primary-glow);
}

.icon {
  font-size: 1.1rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 32px;
  height: 32px;
  background-color: var(--bg-gradient-2);
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--primary);
}

.username {
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius-md);
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--error-glow);
  color: var(--error);
}

/* MAIN CONTENT */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0; /* Important for flex-shrink */
}

.top-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.status-badge {
  font-size: 0.75rem;
  background: var(--success-glow);
  color: var(--success);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  position: relative;
  /* El slot se renderiza aquí */
}
</style>
