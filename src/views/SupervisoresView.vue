<template>
  <PageLayout title="Supervisores">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Supervisor
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-6">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(16,185,129,0.08);color:var(--mp-success);">
            <i class="bi bi-person-badge"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ supervisores.length }}</div>
            <div class="mp-stat-label">Supervisores Activos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-6">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(239,68,68,0.08);color:var(--mp-danger);">
            <i class="bi bi-archive"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ supervisoresDesactivados.length }}</div>
            <div class="mp-stat-label">Supervisores Desactivados</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Activos / Desactivados -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'activos' }" @click="tabActiva = 'activos'">
          <i class="bi bi-person-badge me-1"></i> Supervisores Activos ({{ supervisores.length }})
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'desactivados' }" @click="tabActiva = 'desactivados'">
          <i class="bi bi-archive me-1"></i> Supervisores Desactivados ({{ supervisoresDesactivados.length }})
        </button>
      </li>
    </ul>

    <!-- TAB 1: SUPERVISORES ACTIVOS -->
    <div v-show="tabActiva === 'activos'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold">Supervisores Activos</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busqueda" placeholder="Buscar supervisor..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ supervisoresFiltrados.length }} resultados</span>
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
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando supervisores...
              </td>
            </tr>
            <tr v-else-if="supervisoresFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-person-badge"></i>
                  <p>Sin supervisores</p>
                </div>
              </td>
            </tr>
            <tr v-for="(s, i) in supervisoresFiltrados" :key="s.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ s.id }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="mp-avatar-icon" style="background:rgba(16,185,129,0.08);color:var(--mp-success);">
                    <i class="bi bi-person-fill"></i>
                  </div>
                  <span class="fw-semibold">{{ s.nombre }}</span>
                </div>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ s.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="mp-action-group">
                  <button class="mp-action-btn mp-action-edit" @click="abrirModal(s)" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(s.id, '¿Desactivar este supervisor? Pasará a la pestaña de Desactivados.')" title="Desactivar"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: SUPERVISORES DESACTIVADOS -->
    <div v-show="tabActiva === 'desactivados'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-semibold text-danger">
            <i class="bi bi-archive me-1"></i> Supervisores Desactivados
          </h6>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.75rem;">Histórico protegido</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busquedaDesactivados" placeholder="Buscar desactivado..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ supervisoresDesactivadosFiltrados.length }} resultados</span>
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
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando supervisores desactivados...
              </td>
            </tr>
            <tr v-else-if="supervisoresDesactivadosFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-check2-circle text-success" style="font-size:2rem;"></i>
                  <p class="mt-2 text-muted">No hay supervisores desactivados</p>
                </div>
              </td>
            </tr>
            <tr v-for="s in supervisoresDesactivadosFiltrados" :key="s.id" class="mp-table-row">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ s.id }}</td>
              <td>
                <span class="text-decoration-line-through me-2 text-muted">{{ s.nombre }}</span>
                <span class="badge bg-danger-subtle text-danger" style="font-size:0.7rem;">Inactivo</span>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ s.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(s.id, '¿Desea reactivar este supervisor? Volverá al catálogo activo.')" title="Reactivar este supervisor" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(s.id, '¿Desea eliminar definitivamente este supervisor? Si no tiene requerimientos asociados se borrará por completo.')" title="Eliminar definitivamente">
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
      :title="(editando ? 'Editar' : 'Nuevo') + ' supervisor'"
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
        placeholder="Nombre del supervisor"
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
  items: supervisores,
  itemsDesactivados: supervisoresDesactivados,
  cargando,
  cargandoDesactivados,
  busqueda,
  busquedaDesactivados,
  filtrados: supervisoresFiltrados,
  desactivadosFiltrados: supervisoresDesactivadosFiltrados,
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
  resource: '/supervisores',
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
