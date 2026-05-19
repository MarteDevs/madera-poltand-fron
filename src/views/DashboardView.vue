<template>
  <PageLayout title="Dashboard">
    <!-- Welcome banner -->
    <div class="welcome-banner mb-4">
      <div class="welcome-content">
        <div>
          <h2 class="welcome-title">
            <span class="welcome-wave">👋</span> ¡Bienvenido!
          </h2>
          <p class="welcome-sub">Resumen operativo del sistema Madera Poltand</p>
        </div>
        <div class="welcome-date">
          <i class="bi bi-calendar3 me-2"></i>
          {{ fechaHoy }}
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3" v-for="(stat, idx) in stats" :key="stat.label">
        <div class="stat-card d-flex align-items-center gap-3" :style="{ animationDelay: (idx * 0.08) + 's' }">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <i :class="stat.icon" :style="{ color: stat.color }"></i>
          </div>
          <div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">
              <span v-if="cargando" class="skeleton" style="width:40px;height:28px;display:inline-block;"></span>
              <span v-else>{{ stat.valor }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimos requerimientos -->
    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <div class="card-header-icon">
            <i class="bi bi-clipboard-data"></i>
          </div>
          <h6 class="mb-0 fw-semibold">Últimos Requerimientos</h6>
        </div>
        <RouterLink to="/requerimientos" class="btn btn-sm btn-outline-primary" style="font-size:0.8rem;">
          Ver todos <i class="bi bi-arrow-right ms-1"></i>
        </RouterLink>
      </div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Mina</th>
              <th>Supervisor</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="5" class="text-center py-5 text-muted">
                <div class="d-flex flex-column align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm"></span>
                  <span style="font-size:0.85rem;">Cargando datos...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="ultimos.length === 0">
              <td colspan="5" class="text-center py-5">
                <div class="empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>Sin registros</p>
                </div>
              </td>
            </tr>
            <tr v-for="r in ultimos" :key="r.id">
              <td><span class="fw-semibold text-primary">{{ r.codigo_req }}</span></td>
              <td>{{ r.fecha }}</td>
              <td><span class="badge bg-light text-dark border">{{ r.mina }}</span></td>
              <td>{{ r.supervisor }}</td>
              <td>
                <span :class="badgeClass(r.estado)">{{ r.estado }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PageLayout from '../components/PageLayout.vue';
import { useRequerimientosStore } from '../stores/requerimientos.store';
import { useCatalogosStore } from '../stores/catalogos.store';
import { useIngresosStore } from '../stores/ingresos.store';

const reqStore = useRequerimientosStore();
const catStore = useCatalogosStore();
const ingStore = useIngresosStore();
const cargando = ref(true);

const fechaHoy = computed(() => {
  const d = new Date();
  return d.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
});

onMounted(async () => {
  await Promise.all([
    reqStore.cargarHistorial(),
    catStore.cargarCatalogos(),
    ingStore.cargarPendientes()
  ]);
  cargando.value = false;
});

const ultimos = computed(() => reqStore.historial.slice(0, 8));

const pendientesCount = computed(() =>
  reqStore.historial.filter(r => r.estado === 'PENDIENTE').length
);

const stats = computed(() => [
  {
    label: 'Requerimientos',
    valor: reqStore.historial.length,
    icon: 'bi bi-clipboard-check',
    bg: '#eff6ff',
    color: '#3b82f6'
  },
  {
    label: 'Pendientes',
    valor: pendientesCount.value,
    icon: 'bi bi-hourglass-split',
    bg: '#fffbeb',
    color: '#f59e0b'
  },
  {
    label: 'Artículos',
    valor: catStore.articulos.length,
    icon: 'bi bi-box-seam',
    bg: '#f0fdf4',
    color: '#10b981'
  },
  {
    label: 'Items x Entregar',
    valor: ingStore.pendientes.length,
    icon: 'bi bi-truck',
    bg: '#fdf4ff',
    color: '#a855f7'
  }
]);

const badgeClass = (estado) => {
  const map = { PENDIENTE: 'badge-pendiente', COMPLETADO: 'badge-completado', CANCELADO: 'badge-cancelado' };
  return map[estado] || 'badge-pendiente';
};
</script>

<style scoped>
/* Welcome banner */
.welcome-banner {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 28px 32px;
  color: white;
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  position: relative;
  overflow: hidden;
}
.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%; right: -20%;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%);
}
.welcome-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.welcome-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 4px;
}
.welcome-wave {
  display: inline-block;
  animation: float 2s ease-in-out infinite;
}
.welcome-sub {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0;
}
.welcome-date {
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 500;
  text-transform: capitalize;
}

/* Stat cards */
.stat-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-family: 'Outfit', sans-serif;
}
.stat-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  line-height: 1.2;
  color: #0f172a;
}

/* Card header icon */
.card-header-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: rgba(59,130,246,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 0.95rem;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
}
.empty-state i {
  font-size: 2.5rem;
  opacity: 0.3;
}
.empty-state p {
  margin: 0;
  font-size: 0.85rem;
}

@media (max-width: 767.98px) {
  .welcome-content { flex-direction: column; align-items: flex-start; gap: 12px; }
  .welcome-banner { padding: 20px 24px; }
}
</style>