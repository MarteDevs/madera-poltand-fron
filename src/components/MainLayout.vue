<template>
  <div class="mp-sidebar">
    <!-- Brand -->
    <div class="px-4 py-4 border-bottom border-secondary border-opacity-25">
      <div class="d-flex align-items-center gap-2">
        <div class="d-flex align-items-center justify-content-center rounded-2 bg-primary text-white fw-bold"
             style="width:36px;height:36px;font-size:0.85rem;">MP</div>
        <div>
          <div class="text-white fw-semibold" style="font-size:0.95rem;line-height:1.2;">Madera Poltand</div>
          <div style="font-size:0.7rem;color:#64748b;">Sistema ERP</div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-grow-1 py-3">
      <div class="nav-section">Operaciones</div>

      <RouterLink to="/dashboard" class="nav-link" active-class="active">
        <i class="bi bi-speedometer2"></i> Dashboard
      </RouterLink>

      <RouterLink to="/requerimientos" class="nav-link" active-class="active">
        <i class="bi bi-clipboard-check"></i> Requerimientos
      </RouterLink>

      <RouterLink to="/ingresos" class="nav-link" active-class="active">
        <i class="bi bi-truck"></i> Ingresos
      </RouterLink>

      <div class="nav-section">Maestros</div>

      <RouterLink to="/articulos" class="nav-link" active-class="active">
        <i class="bi bi-box-seam"></i> Artículos
      </RouterLink>

      <RouterLink to="/proveedores" class="nav-link" active-class="active">
        <i class="bi bi-building"></i> Proveedores
      </RouterLink>

      <RouterLink to="/minas" class="nav-link" active-class="active">
        <i class="bi bi-geo-alt"></i> Minas
      </RouterLink>

      <RouterLink to="/supervisores" class="nav-link" active-class="active">
        <i class="bi bi-person-badge"></i> Supervisores
      </RouterLink>

      <template v-if="authStore.usuario?.rol_id === 1 || authStore.usuario?.rol_id === 2">
        <div class="nav-section">Seguridad</div>
        <RouterLink to="/usuarios" class="nav-link" active-class="active">
          <i class="bi bi-people-fill"></i> Usuarios
        </RouterLink>
      </template>
    </nav>

    <!-- Footer usuario -->
    <div class="px-3 pb-4 pt-2 border-top border-secondary border-opacity-25">
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <div class="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-25 text-primary fw-bold"
               style="width:32px;height:32px;font-size:0.8rem;">
            {{ inicial }}
          </div>
          <div>
            <div class="text-white" style="font-size:0.8rem;font-weight:500;">{{ authStore.usuario?.username }}</div>
            <div style="font-size:0.7rem;color:#64748b;">{{ rolNombre }}</div>
          </div>
        </div>
        <button @click="logout" class="btn btn-sm p-1" style="color:#64748b;" title="Cerrar sesión">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const router = useRouter();

const inicial = computed(() => (authStore.usuario?.username || 'U').charAt(0).toUpperCase());
const rolNombre = computed(() => {
  const roles = { 1: 'Superadmin', 2: 'Administrador', 3: 'Operador' };
  return roles[authStore.usuario?.rol_id] || 'Usuario';
});

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
