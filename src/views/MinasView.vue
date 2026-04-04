<template>
  <PageLayout title="Minas">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nueva Mina
      </button>
    </template>

    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">Minas Registradas</h6>
        <span class="text-muted" style="font-size:0.8rem;">{{ minas.length }} minas activas</span>
      </div>
      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Razón Social</th>
              <th>RUC</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="4" class="text-center py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
              </td>
            </tr>
            <tr v-for="m in minas" :key="m.id">
              <td class="fw-medium">{{ m.nombre }}</td>
              <td class="text-muted">{{ m.razon_social || '—' }}</td>
              <td class="text-muted">{{ m.ruc || '—' }}</td>
              <td class="text-end d-flex justify-content-end gap-1">
                <button class="btn btn-sm btn-outline-primary" @click="abrirModal(m)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" @click="desactivar(m.id)"><i class="bi bi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal fade" id="modalMina" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nueva' }} Mina</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-medium" style="font-size:0.85rem;">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="form.nombre" placeholder="Nombre de la mina" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium" style="font-size:0.85rem;">Razón Social</label>
              <input type="text" class="form-control" v-model="form.razon_social" placeholder="Razón social" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium" style="font-size:0.85rem;">RUC</label>
              <input type="text" class="form-control" v-model="form.ruc" placeholder="RUC" />
            </div>
            <div v-if="error" class="alert alert-danger py-2" style="font-size:0.85rem;">{{ error }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardar" :disabled="guardando">
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
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import PageLayout from '../components/PageLayout.vue';
import api from '../api/axios';

const minas = ref([]);
const cargando = ref(true);
const modalRef = ref(null);
let bsModal = null;

const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const error = ref('');
const form = ref({ nombre: '', razon_social: '', ruc: '' });

const cargar = async () => {
  cargando.value = true;
  try { const res = await api.get('/minas'); minas.value = res.data; }
  finally { cargando.value = false; }
};

onMounted(async () => {
  await cargar();
  bsModal = new Modal(modalRef.value);
});

const abrirModal = (item = null) => {
  error.value = '';
  if (item) {
    editando.value = true; editandoId.value = item.id;
    form.value = { nombre: item.nombre, razon_social: item.razon_social || '', ruc: item.ruc || '' };
  } else {
    editando.value = false; editandoId.value = null;
    form.value = { nombre: '', razon_social: '', ruc: '' };
  }
  bsModal.show();
};

const guardar = async () => {
  error.value = '';
  if (!form.value.nombre) { error.value = 'El nombre es obligatorio.'; return; }
  guardando.value = true;
  try {
    if (editando.value) await api.put(`/minas/${editandoId.value}`, form.value);
    else await api.post('/minas', form.value);
    await cargar();
    bsModal.hide();
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al guardar';
  } finally { guardando.value = false; }
};

const desactivar = async (id) => {
  if (!confirm('¿Desactivar esta mina?')) return;
  await api.delete(`/minas/${id}`);
  await cargar();
};
</script>
