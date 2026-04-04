<template>
  <PageLayout title="Artículos">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Artículo
      </button>
    </template>

    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">Catálogo de Artículos</h6>
        <span class="text-muted" style="font-size:0.8rem;">{{ articulos.length }} artículos activos</span>
      </div>

      <!-- Buscador -->
      <div class="px-4 py-3 border-bottom">
        <input type="text" class="form-control form-control-sm" style="max-width:300px;"
               v-model="busqueda" placeholder="Buscar artículo..." />
      </div>

      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th class="text-end">P. Proveedor</th>
              <th class="text-end">P. Mina</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="5" class="text-center py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
              </td>
            </tr>
            <tr v-else-if="articulosFiltrados.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">Sin resultados</td>
            </tr>
            <tr v-for="a in articulosFiltrados" :key="a.id">
              <td><span class="badge bg-light text-dark border">{{ a.codigo || '—' }}</span></td>
              <td class="fw-medium">{{ a.nombre }}</td>
              <td class="text-end">S/ {{ parseFloat(a.precio_proveedor).toFixed(2) }}</td>
              <td class="text-end">S/ {{ parseFloat(a.precio_mina).toFixed(2) }}</td>
              <td class="text-end d-flex justify-content-end gap-1">
                <button class="btn btn-sm btn-outline-primary" @click="abrirModal(a)" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="desactivar(a.id)" title="Desactivar">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <div class="modal fade" id="modalArticulo" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Artículo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-medium" style="font-size:0.85rem;">Código</label>
              <input type="text" class="form-control" v-model="form.codigo" placeholder="Ej: A001" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-medium" style="font-size:0.85rem;">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control" v-model="form.nombre" placeholder="Nombre del artículo" required />
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Precio Proveedor <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">S/</span>
                  <input type="number" class="form-control" v-model.number="form.precio_proveedor" min="0" step="0.01" />
                </div>
              </div>
              <div class="col-6">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Precio Mina <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">S/</span>
                  <input type="number" class="form-control" v-model.number="form.precio_mina" min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div v-if="error" class="alert alert-danger mt-3 py-2" style="font-size:0.85rem;">{{ error }}</div>
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
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import PageLayout from '../components/PageLayout.vue';
import api from '../api/axios';

const articulos = ref([]);
const cargando = ref(true);
const busqueda = ref('');
const modalRef = ref(null);
let bsModal = null;

const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const error = ref('');
const form = ref({ codigo: '', nombre: '', precio_proveedor: 0, precio_mina: 0 });

const articulosFiltrados = computed(() =>
  articulos.value.filter(a => a.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
);

const cargar = async () => {
  cargando.value = true;
  try {
    const res = await api.get('/articulos');
    articulos.value = res.data;
  } finally {
    cargando.value = false;
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
    form.value = { codigo: item.codigo, nombre: item.nombre, precio_proveedor: item.precio_proveedor, precio_mina: item.precio_mina };
  } else {
    editando.value = false;
    editandoId.value = null;
    form.value = { codigo: '', nombre: '', precio_proveedor: 0, precio_mina: 0 };
  }
  bsModal.show();
};

const guardar = async () => {
  error.value = '';
  if (!form.value.nombre) { error.value = 'El nombre es obligatorio.'; return; }
  guardando.value = true;
  try {
    if (editando.value) {
      await api.put(`/articulos/${editandoId.value}`, form.value);
    } else {
      await api.post('/articulos', form.value);
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
  if (!confirm('¿Desactivar este artículo?')) return;
  await api.delete(`/articulos/${id}`);
  await cargar();
};
</script>
