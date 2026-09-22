<template>
  <PageLayout title="Viajes">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Viaje
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);">
            <i class="bi bi-signpost-2"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ viajes.length }}</div>
            <div class="mp-stat-label">Viajes Activos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(239,68,68,0.08);color:var(--mp-danger);">
            <i class="bi bi-archive"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ viajesDesactivados.length }}</div>
            <div class="mp-stat-label">Viajes Desactivados</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Activos / Desactivados -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'activos' }" @click="tabActiva = 'activos'">
          <i class="bi bi-signpost-2 me-1"></i> Viajes Activos ({{ viajes.length }})
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'desactivados' }" @click="tabActiva = 'desactivados'">
          <i class="bi bi-archive me-1"></i> Viajes Desactivados ({{ viajesDesactivados.length }})
        </button>
      </li>
    </ul>

    <!-- TAB 1: VIAJES ACTIVOS -->
    <div v-show="tabActiva === 'activos'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold">Viajes Activos</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busqueda" placeholder="Buscar viaje..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ viajesFiltrados.length }} resultados</span>
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
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando viajes...
              </td>
            </tr>
            <tr v-else-if="viajesFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-signpost-2"></i>
                  <p>Sin viajes</p>
                </div>
              </td>
            </tr>
            <tr v-for="(v, i) in viajesFiltrados" :key="v.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ v.id }}</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="mp-avatar-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);">
                    <i class="bi bi-signpost-2"></i>
                  </div>
                  <span class="fw-semibold">{{ v.nombre }}</span>
                </div>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ v.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="mp-action-group">
                  <button class="mp-action-btn mp-action-edit" @click="abrirModal(v)" title="Editar"><i class="bi bi-pencil"></i></button>
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(v.id)" title="Desactivar"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: VIAJES DESACTIVADOS -->
    <div v-show="tabActiva === 'desactivados'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-semibold text-danger">
            <i class="bi bi-archive me-1"></i> Viajes Desactivados
          </h6>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.75rem;">Histórico protegido</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busquedaDesactivados" placeholder="Buscar desactivado..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ viajesDesactivadosFiltrados.length }} resultados</span>
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
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando viajes desactivados...
              </td>
            </tr>
            <tr v-else-if="viajesDesactivadosFiltrados.length === 0">
              <td colspan="4" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-check2-circle text-success" style="font-size:2rem;"></i>
                  <p class="mt-2 text-muted">No hay viajes desactivados</p>
                </div>
              </td>
            </tr>
            <tr v-for="v in viajesDesactivadosFiltrados" :key="v.id" class="mp-table-row">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ v.id }}</td>
              <td>
                <span class="text-decoration-line-through me-2 text-muted">{{ v.nombre }}</span>
                <span class="badge bg-danger-subtle text-danger" style="font-size:0.7rem;">Inactivo</span>
              </td>
              <td class="text-muted" style="font-size:0.85rem;">{{ v.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(v.id)" title="Reactivar este viaje" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(v.id)" title="Eliminar definitivamente">
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
    <div class="modal fade" id="modalViaje" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Viaje</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="mp-form-label">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del viaje" />
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
import api from '../api/axios';
import PageLayout from '../components/PageLayout.vue';
import Swal from 'sweetalert2';

const tabActiva = ref('activos');
const viajes = ref([]);
const viajesDesactivados = ref([]);
const cargando = ref(false);
const cargandoDesactivados = ref(false);
const busqueda = ref('');
const busquedaDesactivados = ref('');

const modalRef = ref(null);
let modalInstance = null;

const form = ref({ id: null, nombre: '' });
const editando = ref(false);
const guardando = ref(false);
const error = ref('');

const viajesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase().trim();
  if (!q) return viajes.value;
  return viajes.value.filter(v => v.nombre?.toLowerCase().includes(q));
});

const viajesDesactivadosFiltrados = computed(() => {
  const q = busquedaDesactivados.value.toLowerCase().trim();
  if (!q) return viajesDesactivados.value;
  return viajesDesactivados.value.filter(v => v.nombre?.toLowerCase().includes(q));
});

const cargarViajes = async () => {
  cargando.value = true;
  cargandoDesactivados.value = true;
  try {
    const [resActivos, resDesact] = await Promise.all([
      api.get('/viajes'),
      api.get('/viajes?estado=0')
    ]);
    viajes.value = resActivos.data || [];
    viajesDesactivados.value = resDesact.data || [];
  } catch (err) {
    console.error('Error cargando viajes:', err);
  } finally {
    cargando.value = false;
    cargandoDesactivados.value = false;
  }
};

onMounted(() => {
  cargarViajes();
  modalInstance = new Modal(modalRef.value);
});

const abrirModal = (v = null) => {
  error.value = '';
  if (v) {
    editando.value = true;
    form.value = { ...v };
  } else {
    editando.value = false;
    form.value = { id: null, nombre: '' };
  }
  modalInstance.show();
};

const guardar = async () => {
  if (!form.value.nombre.trim()) {
    error.value = 'El nombre es obligatorio';
    return;
  }
  
  guardando.value = true;
  error.value = '';
  
  try {
    if (editando.value) {
      await api.put(`/viajes/${form.value.id}`, { nombre: form.value.nombre });
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Viaje actualizado exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      const res = await api.post('/viajes', { nombre: form.value.nombre });
      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: res.data?.mensaje || 'Viaje guardado exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
    }
    modalInstance.hide();
    cargarViajes();
  } catch (err) {
    error.value = err.response?.data?.mensaje || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (id) => {
  const result = await Swal.fire({
    title: '¿Desactivar viaje?',
    text: 'Pasará a la pestaña de Desactivados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    try {
      const res = await api.delete(`/viajes/${id}`);
      Swal.fire({
        icon: 'info',
        title: 'Desactivado',
        text: res.data?.mensaje || 'Viaje desactivado correctamente',
        timer: 1800,
        showConfirmButton: false
      });
      cargarViajes();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.mensaje || 'No se pudo desactivar el viaje', 'error');
    }
  }
};

const reactivar = async (id) => {
  const result = await Swal.fire({
    title: '¿Reactivar viaje?',
    text: 'Volverá al catálogo de viajes activos.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#198754',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, reactivar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await api.put(`/viajes/${id}/reactivar`);
      Swal.fire({
        icon: 'success',
        title: 'Reactivado',
        text: 'Viaje reactivado exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
      cargarViajes();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.mensaje || 'No se pudo reactivar el viaje', 'error');
    }
  }
};

const eliminarDefinitivo = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar definitivamente?',
    text: 'Si el viaje no tiene ingresos asociados, se eliminará permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await api.delete(`/viajes/${id}`);
      Swal.fire({
        icon: 'info',
        title: 'Eliminado',
        text: res.data?.mensaje || 'Viaje eliminado',
        timer: 1800,
        showConfirmButton: false
      });
      cargarViajes();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.mensaje || 'No se pudo eliminar el viaje', 'error');
    }
  }
};
</script>
