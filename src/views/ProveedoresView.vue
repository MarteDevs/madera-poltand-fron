<template>
  <PageLayout title="Proveedores">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Proveedor
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-6">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);">
            <i class="bi bi-truck"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ proveedores.length }}</div>
            <div class="mp-stat-label">Proveedores Activos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-6">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(239,68,68,0.08);color:var(--mp-danger);">
            <i class="bi bi-archive"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ proveedoresDesactivados.length }}</div>
            <div class="mp-stat-label">Proveedores Desactivados</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Activos / Desactivados -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'activos' }" @click="tabActiva = 'activos'">
          <i class="bi bi-truck me-1"></i> Proveedores Activos ({{ proveedores.length }})
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'desactivados' }" @click="tabActiva = 'desactivados'">
          <i class="bi bi-archive me-1"></i> Proveedores Desactivados ({{ proveedoresDesactivados.length }})
        </button>
      </li>
    </ul>

    <!-- TAB 1: PROVEEDORES ACTIVOS -->
    <div v-show="tabActiva === 'activos'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold">Proveedores Activos</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busqueda" placeholder="Buscar proveedor..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ proveedoresFiltrados.length }} resultados</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th style="width:50px;">#</th>
              <th>Nombre</th>
              <th>Fecha de Alta</th>
              <th class="text-center" style="width:100px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando proveedores...
              </td>
            </tr>
            <tr v-else-if="proveedoresFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-truck"></i>
                  <p>Sin proveedores</p>
                </div>
              </td>
            </tr>
            <tr v-for="(p, i) in proveedoresFiltrados" :key="p.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ p.id }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="mp-avatar-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);">
                    <i class="bi bi-truck"></i>
                  </div>
                  <span class="fw-semibold">{{ p.nombre }}</span>
                </div>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ p.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="mp-action-group">
                  <button class="mp-action-btn mp-action-edit" @click="abrirModal(p)" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(p.id, '¿Desactivar este proveedor? Pasará a la pestaña de Desactivados.')" title="Desactivar"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: PROVEEDORES DESACTIVADOS -->
    <div v-show="tabActiva === 'desactivados'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-semibold text-danger">
            <i class="bi bi-archive me-1"></i> Proveedores Desactivados
          </h6>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.75rem;">Histórico protegido</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busquedaDesactivados" placeholder="Buscar desactivado..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ proveedoresDesactivadosFiltrados.length }} resultados</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th style="width:50px;">#</th>
              <th>Nombre</th>
              <th>Fecha de Alta</th>
              <th class="text-center" style="width:180px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargandoDesactivados">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando proveedores desactivados...
              </td>
            </tr>
            <tr v-else-if="proveedoresDesactivadosFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-check2-circle text-success" style="font-size:2rem;"></i>
                  <p class="mt-2 text-muted">No hay proveedores desactivados</p>
                </div>
              </td>
            </tr>
            <tr v-for="p in proveedoresDesactivadosFiltrados" :key="p.id" class="mp-table-row">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ p.id }}</td>
              <td>
                <span class="text-decoration-line-through me-2 text-muted">{{ p.nombre }}</span>
                <span class="badge bg-danger-subtle text-danger" style="font-size:0.7rem;">Inactivo</span>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ p.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(p.id, '¿Desea reactivar este proveedor? Volverá al catálogo activo.')" title="Reactivar este proveedor" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(p.id, '¿Desea eliminar definitivamente este proveedor? Si no tiene requerimientos o tarifas asociadas se borrará por completo.')" title="Eliminar definitivamente">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panel de alta/edición -->
    <CrudDrawer
      :open="drawerOpen"
      :title="(editando ? 'Editar' : 'Nuevo') + ' proveedor'"
      :can-submit="isFormValid"
      :submitting="guardando"
      :progress-text="progressText"
      @close="drawerOpen = false"
      @submit="guardar"
    >
      <CrudField
        label="Nombre"
        required
        v-model="form.nombre"
        :error="displayError('nombre')"
        :touched="!!fieldTouched.nombre"
        hint="Mínimo 3 caracteres."
        placeholder="Nombre del proveedor"
        @touch="validarCampo('nombre')"
      />
      <div v-if="error" class="alert alert-danger py-2" style="font-size:0.85rem;">{{ error }}</div>
    </CrudDrawer>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import PageLayout from '../components/PageLayout.vue';
import CrudDrawer from '../components/CrudDrawer.vue';
import CrudField from '../components/CrudField.vue';
import { confirmarConSwal, notificarConSwal } from '../utils/confirmUi';
import { useCrudCatalogo } from '../composables/useCrudCatalogo';

const tabActiva = ref('activos');
const drawerOpen = ref(false);

const {
  items: proveedores,
  itemsDesactivados: proveedoresDesactivados,
  cargando,
  cargandoDesactivados,
  busqueda,
  busquedaDesactivados,
  filtrados: proveedoresFiltrados,
  desactivadosFiltrados: proveedoresDesactivadosFiltrados,
  editando,
  guardando,
  error,
  form,
  fieldErrors,
  fieldTouched,
  isFormValid,
  validarCampo,
  displayError,
  cargar,
  abrirModal: abrirModalBase,
  guardar: guardarBase,
  desactivar,
  reactivar,
  eliminarDefinitivo
} = useCrudCatalogo({
  resource: '/proveedores',
  validadores: {
    nombre: (v) => (!v || v.trim().length < 3) ? 'Mínimo 3 caracteres.' : null
  },
  onNotify: notificarConSwal,
  onConfirm: confirmarConSwal
});

const progressText = computed(() =>
  isFormValid.value ? '' : (fieldErrors.value.nombre || 'Completa los campos requeridos')
);

onMounted(() => {
  cargar();
});

const abrirModal = (item = null) => {
  abrirModalBase(item);
  drawerOpen.value = true;
};

const guardar = async () => {
  if (await guardarBase()) drawerOpen.value = false;
};
</script>
