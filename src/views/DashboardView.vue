<template>
  <PageLayout title="Dashboard">
    <!-- Stats row -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3" v-for="stat in stats" :key="stat.label">
        <div class="stat-card d-flex align-items-center gap-3">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <i :class="stat.icon" :style="{ color: stat.color }"></i>
          </div>
          <div>
            <div class="text-muted" style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
              {{ stat.label }}
            </div>
            <div class="fw-bold" style="font-size:1.4rem;line-height:1.3;">
              <span v-if="cargando" class="spinner-border spinner-border-sm text-muted"></span>
              <span v-else>{{ stat.valor }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimos requerimientos -->
    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">Últimos Requerimientos</h6>
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
              <td colspan="5" class="text-center py-4 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
              </td>
            </tr>
            <tr v-else-if="ultimos.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">Sin registros</td>
            </tr>
            <tr v-for="r in ultimos" :key="r.id">
              <td><span class="fw-medium text-primary">{{ r.codigo_req }}</span></td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.mina }}</td>
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
    color: '#2563eb'
  },
  {
    label: 'Pendientes',
    valor: pendientesCount.value,
    icon: 'bi bi-hourglass-split',
    bg: '#fffbeb',
    color: '#d97706'
  },
  {
    label: 'Artículos',
    valor: catStore.articulos.length,
    icon: 'bi bi-box-seam',
    bg: '#f0fdf4',
    color: '#16a34a'
  },
  {
    label: 'Items x Entregar',
    valor: ingStore.pendientes.length,
    icon: 'bi bi-truck',
    bg: '#fdf4ff',
    color: '#9333ea'
  }
]);

const badgeClass = (estado) => {
  const map = { PENDIENTE: 'badge-pendiente', COMPLETADO: 'badge-completado', CANCELADO: 'badge-cancelado' };
  return map[estado] || 'badge-pendiente';
};
</script>