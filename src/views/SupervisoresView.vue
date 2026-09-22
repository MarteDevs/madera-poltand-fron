<template>
  <PageLayout title="Supervisores">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Supervisor
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
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
      <div class="col-6 col-md-3">
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
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(s.id)" title="Desactivar"><i class="bi bi-trash"></i></button>
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
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(s.id)" title="Reactivar este supervisor" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(s.id)" title="Eliminar definitivamente">
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
    <div class="modal fade" id="modalSupervisor" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Supervisor</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="mp-form-label">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del supervisor" />
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
const supervisores = ref([]);
const supervisoresDesactivados = ref([]);
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

const supervisoresFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim();
  if (!q) return supervisores.value;
  return supervisores.value.filter(s => s.nombre?.toLowerCase().includes(q));
});

const supervisoresDesactivadosFiltrados = computed(() => {
  const q = busquedaDesactivados.value.toLowerCase().trim();
  if (!q) return supervisoresDesactivados.value;
  return supervisoresDesactivados.value.filter(s => s.nombre?.toLowerCase().includes(q));
});

const cargar = async () => {
  cargando.value = true;
  cargandoDesactivados.value = true;
  try {
    const [resActivos, resDesact] = await Promise.all([
      api.get('/supervisores'),
      api.get('/supervisores?estado=0')
    ]);
    supervisores.value = resActivos.data || [];
    supervisoresDesactivados.value = resDesact.data || [];
  } catch (e) {
    console.error('Error cargando supervisores:', e);
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
      await api.put(`/supervisores/${editandoId.value}`, form.value);
      toastStore.addToast('Supervisor actualizado exitosamente', 'success');
    } else {
      const res = await api.post('/supervisores', form.value);
      toastStore.addToast(res.data?.mensaje || 'Supervisor guardado exitosamente', 'success');
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
  if (!confirm('¿Desactivar este supervisor? Pasará a la pestaña de Desactivados.')) return;
  try {
    const res = await api.delete(`/supervisores/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Supervisor desactivado', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al desactivar', 'danger');
  }
};

const reactivar = async (id) => {
  if (!confirm('¿Desea reactivar este supervisor? Volverá al catálogo activo.')) return;
  try {
    await api.put(`/supervisores/${id}/reactivar`);
    toastStore.addToast('Supervisor reactivado exitosamente', 'success');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al reactivar supervisor', 'danger');
  }
};

const eliminarDefinitivo = async (id) => {
  if (!confirm('¿Desea eliminar definitivamente este supervisor? Si no tiene requerimientos asociados se borrará por completo.')) return;
  try {
    const res = await api.delete(`/supervisores/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Supervisor eliminado', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al eliminar supervisor', 'danger');
  }
};
</script>
