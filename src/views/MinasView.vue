<template>
  <PageLayout title="Minas">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nueva Mina
      </button>
    </template>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-4">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(245,158,11,0.08);color:var(--mp-warning);">
            <i class="bi bi-geo-alt-fill"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ minas.length }}</div>
            <div class="mp-stat-label">Minas Activas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(239,68,68,0.08);color:var(--mp-danger);">
            <i class="bi bi-archive"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ minasDesactivadas.length }}</div>
            <div class="mp-stat-label">Minas Desactivadas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-4">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(16,185,129,0.08);color:var(--mp-success);">
            <i class="bi bi-building"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ conRuc }}</div>
            <div class="mp-stat-label">Con RUC</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Activas / Desactivadas -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'activos' }" @click="tabActiva = 'activos'">
          <i class="bi bi-geo-alt-fill me-1"></i> Minas Activas ({{ minas.length }})
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'desactivados' }" @click="tabActiva = 'desactivados'">
          <i class="bi bi-archive me-1"></i> Minas Desactivadas ({{ minasDesactivadas.length }})
        </button>
      </li>
    </ul>

    <!-- TAB 1: MINAS ACTIVAS -->
    <div v-show="tabActiva === 'activos'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold">Minas Registradas</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busqueda" placeholder="Buscar mina..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ minasFiltradas.length }} resultados</span>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Razón Social</th>
              <th>RUC</th>
              <th class="text-center" style="width:100px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando minas...
              </td>
            </tr>
            <tr v-else-if="minasFiltradas.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-geo-alt"></i>
                  <p>Sin minas registradas</p>
                </div>
              </td>
            </tr>
            <tr v-for="(m, i) in minasFiltradas" :key="m.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="mp-avatar-icon" style="background:rgba(245,158,11,0.1);color:var(--mp-warning);">
                    <i class="bi bi-geo-alt-fill"></i>
                  </div>
                  <span class="fw-semibold">{{ m.nombre }}</span>
                </div>
              </td>
              <td class="text-muted">{{ m.razon_social || '—' }}</td>
              <td><span class="mp-badge-code">{{ m.ruc || '—' }}</span></td>
              <td class="text-center">
                <div class="mp-action-group">
                  <button class="mp-action-btn mp-action-edit" @click="abrirModal(m)" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(m.id, '¿Desactivar esta mina? Pasará a la pestaña de Desactivadas.')" title="Desactivar"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: MINAS DESACTIVADAS -->
    <div v-show="tabActiva === 'desactivados'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-semibold text-danger">
            <i class="bi bi-archive me-1"></i> Minas Desactivadas
          </h6>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.75rem;">Histórico protegido</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busquedaDesactivados" placeholder="Buscar desactivada..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ minasDesactivadasFiltradas.length }} resultados</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Razón Social</th>
              <th>RUC</th>
              <th class="text-center" style="width:180px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargandoDesactivados">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando minas desactivadas...
              </td>
            </tr>
            <tr v-else-if="minasDesactivadasFiltradas.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-check2-circle text-success" style="font-size:2rem;"></i>
                  <p class="mt-2 text-muted">No hay minas desactivadas</p>
                </div>
              </td>
            </tr>
            <tr v-for="m in minasDesactivadasFiltradas" :key="m.id" class="mp-table-row">
              <td>
                <span class="text-decoration-line-through me-2 text-muted">{{ m.nombre }}</span>
                <span class="badge bg-danger-subtle text-danger" style="font-size:0.7rem;">Inactiva</span>
              </td>
              <td class="text-muted">{{ m.razon_social || '—' }}</td>
              <td><span class="mp-badge-code bg-light text-muted">{{ m.ruc || '—' }}</span></td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(m.id, '¿Desea reactivar esta mina? Volverá al catálogo activo.')" title="Reactivar esta mina" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(m.id, '¿Desea eliminar definitivamente esta mina? Si no tiene requerimientos o ingresos asociados se borrará por completo.')" title="Eliminar definitivamente">
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
      :title="(editando ? 'Editar' : 'Nueva') + ' mina'"
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
        placeholder="Nombre de la mina"
        @touch="validarCampo('nombre')"
      />
      <CrudField
        label="Razón social"
        v-model="form.razon_social"
        placeholder="Razón social"
      />
      <CrudField
        label="RUC"
        v-model="form.ruc"
        :error="displayError('ruc')"
        :touched="!!fieldTouched.ruc"
        hint="Si lo completas, debe tener 11 dígitos."
        placeholder="11 dígitos"
        maxlength="11"
        inputmode="numeric"
        :transform="soloDigitos"
        @touch="validarCampo('ruc')"
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
const soloDigitos = (v) => v.replace(/[^0-9]/g, '');

const {
  items: minas,
  itemsDesactivados: minasDesactivadas,
  cargando,
  cargandoDesactivados,
  busqueda,
  busquedaDesactivados,
  filtrados: minasFiltradas,
  desactivadosFiltrados: minasDesactivadasFiltradas,
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
  resource: '/minas',
  camposBusqueda: ['nombre', 'razon_social', 'ruc'],
  formInicial: () => ({ nombre: '', razon_social: '', ruc: '' }),
  validadores: {
    nombre: (v) => (!v || v.trim().length < 3) ? 'Mínimo 3 caracteres.' : null,
    ruc: (v) => (!v || /^\d{11}$/.test(v)) ? null : 'Debe tener 11 dígitos.'
  },
  onNotify: notificarConSwal,
  onConfirm: confirmarConSwal
});

const conRuc = computed(() => minas.value.filter(m => m.ruc).length);

const progressText = computed(() => {
  if (isFormValid.value) return '';
  return fieldErrors.value.nombre || fieldErrors.value.ruc || 'Completa los campos requeridos';
});

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
