<template>
  <PageLayout title="Viajes">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Viaje
      </button>
    </template>
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);"><i class="bi bi-signpost-2"></i></div>
          <div><div class="mp-stat-value">{{ viajes.length }}</div><div class="mp-stat-label">Viajes</div></div>
        </div>
      </div>
    </div>
    <div class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header">
        <h6 class="mb-0 fw-semibold">Viajes Activos</h6>
        <span class="text-muted" style="font-size:0.8rem;">{{ viajes.length }} registros</span>
      </div>
      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead><tr><th style="width:50px;">#</th><th>Nombre</th><th>Fecha de Alta</th><th class="text-center" style="width:100px;">Acciones</th></tr></thead>
          <tbody>
            <tr v-if="cargando"><td colspan="4" class="text-center py-5 text-muted"><div class="spinner-border spinner-border-sm me-2"></div>Cargando...</td></tr>
            <tr v-else-if="viajes.length === 0"><td colspan="4" class="text-center py-5"><div class="mp-empty-state"><i class="bi bi-signpost-2"></i><p>Sin viajes</p></div></td></tr>
            <tr v-for="(v, i) in viajes" :key="v.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ v.id }}</td>
              <td><div class="d-flex align-items-center gap-2"><div class="mp-avatar-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);"><i class="bi bi-signpost-2"></i></div><span class="fw-semibold">{{ v.nombre }}</span></div></td>
              <td class="text-muted" style="font-size:0.85rem;">{{ v.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center"><div class="mp-action-group"><button class="mp-action-btn mp-action-edit" @click="abrirModal(v)"><i class="bi bi-pencil"></i></button><button class="mp-action-btn mp-action-delete" @click="desactivar(v.id)"><i class="bi bi-trash"></i></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal fade" id="modalViaje" tabindex="-1" ref="modalRef">
      <div class="modal-dialog"><div class="modal-content mp-modal">
        <div class="modal-header mp-modal-header"><h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Viaje</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><div class="mb-3"><label class="mp-form-label">Nombre <span class="text-danger">*</span></label><input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del viaje" /></div><div v-if="error" class="alert alert-danger py-2" style="font-size:0.85rem;">{{ error }}</div></div>
        <div class="modal-footer mp-modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button class="btn-mp-primary" @click="guardar" :disabled="guardando"><span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>{{ guardando ? 'Guardando...' : 'Guardar' }}</button></div>
      </div></div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '../api/axios';
import PageLayout from '../components/PageLayout.vue';
import Swal from 'sweetalert2';

const viajes = ref([]);
const cargando = ref(false);
const modalRef = ref(null);
let modalInstance = null;

const form = ref({ id: null, nombre: '' });
const editando = ref(false);
const guardando = ref(false);
const error = ref('');

const cargarViajes = async () => {
  cargando.value = true;
  try {
    const { data } = await api.get('/viajes');
    viajes.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    cargando.value = false;
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
    } else {
      await api.post('/viajes', { nombre: form.value.nombre });
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
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    try {
      await api.delete(`/viajes/${id}`);
      cargarViajes();
    } catch (err) {
      Swal.fire('Error', 'No se pudo desactivar el viaje', 'error');
    }
  }
};
</script>
