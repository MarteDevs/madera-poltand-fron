<template>
  <PageLayout title="Proveedores">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Proveedor
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
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
      <div class="col-6 col-md-3">
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
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(p.id)" title="Desactivar"><i class="bi bi-trash"></i></button>
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
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(p.id)" title="Reactivar este proveedor" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(p.id)" title="Eliminar definitivamente">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" id="modalProveedor" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Proveedor</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="mp-form-label">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del proveedor" />
            </div>
            <div v-if="error" class="alert alert-danger py-2" style="font-size:0.85rem;">{{ error }}</div>
          </div>
          <div class="modal-footer mp-modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn-mp-primary" @click="guardar" :disabled="guardando">
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import PageLayout from '../components/PageLayout.vue';
import api from '../api/axios';
import { useToastStore } from '../stores/toast.store';

const toastStore = useToastStore();

const tabActiva = ref('activos');
const proveedores = ref([]);
const proveedoresDesactivados = ref([]);
const cargando = ref(true);
const cargandoDesactivados = ref(false);
const busqueda = ref('');
const busquedaDesactivados = ref('');

const modalRef = ref(null);
let bsModal = null;

const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const error = ref('');
const form = ref({ nombre: '' });

const proveedoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim();
  if (!q) return proveedores.value;
  return proveedores.value.filter(p => p.nombre?.toLowerCase().includes(q));
});

const proveedoresDesactivadosFiltrados = computed(() => {
  const q = busquedaDesactivados.value.toLowerCase().trim();
  if (!q) return proveedoresDesactivados.value;
  return proveedoresDesactivados.value.filter(p => p.nombre?.toLowerCase().includes(q));
});

const cargar = async () => {
  cargando.value = true;
  cargandoDesactivados.value = true;
  try {
    const [resActivos, resDesact] = await Promise.all([
      api.get('/proveedores'),
      api.get('/proveedores?estado=0')
    ]);
    proveedores.value = resActivos.data || [];
    proveedoresDesactivados.value = resDesact.data || [];
  } catch (e) {
    console.error('Error cargando proveedores:', e);
  } finally {
    cargando.value = false;
    cargandoDesactivados.value = false;
  }
};

onMounted(async () => {
  await cargar();
  bsModal = new Modal(modalRef.value);
});

const abrirModal = (item = null) => {
  error.value = '';
  if (item) {
    editando.value = true;
    editandoId.value = item.id;
    form.value = { nombre: item.nombre };
  } else {
    editando.value = false;
    editandoId.value = null;
    form.value = { nombre: '' };
  }
  bsModal.show();
};

const guardar = async () => {
  error.value = '';
  if (!form.value.nombre) { error.value = 'El nombre es obligatorio.'; return; }
  guardando.value = true;
  try {
    if (editando.value) {
      await api.put(`/proveedores/${editandoId.value}`, form.value);
      toastStore.addToast('Proveedor actualizado exitosamente', 'success');
    } else {
      const res = await api.post('/proveedores', form.value);
      toastStore.addToast(res.data?.mensaje || 'Proveedor guardado exitosamente', 'success');
    }
    await cargar();
    bsModal.hide();
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este proveedor? Pasará a la pestaña de Desactivados.')) return;
  try {
    const res = await api.delete(`/proveedores/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Proveedor desactivado', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al desactivar', 'danger');
  }
};

const reactivar = async (id) => {
  if (!confirm('¿Desea reactivar este proveedor? Volverá al catálogo activo.')) return;
  try {
    await api.put(`/proveedores/${id}/reactivar`);
    toastStore.addToast('Proveedor reactivado exitosamente', 'success');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al reactivar proveedor', 'danger');
  }
};

const eliminarDefinitivo = async (id) => {
  if (!confirm('¿Desea eliminar definitivamente este proveedor? Si no tiene requerimientos o tarifas asociadas se borrará por completo.')) return;
  try {
    const res = await api.delete(`/proveedores/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Proveedor eliminado', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al eliminar proveedor', 'danger');
  }
};
</script>
