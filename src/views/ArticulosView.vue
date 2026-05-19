<template>
  <PageLayout title="Artículos">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Artículo
      </button>
    </template>

    <!-- Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);">
            <i class="bi bi-box-seam"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ articulos.length }}</div>
            <div class="mp-stat-label">Total Artículos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(16,185,129,0.08);color:var(--mp-success);">
            <i class="bi bi-currency-dollar"></i>
          </div>
          <div>
            <div class="mp-stat-value">S/ {{ promedioMina }}</div>
            <div class="mp-stat-label">Precio Prom. Mina</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header">
        <h6 class="mb-0 fw-semibold">Catálogo de Artículos</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busqueda" placeholder="Buscar artículo..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ articulosFiltrados.length }} resultados</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th class="text-end">P. Proveedor</th>
              <th class="text-end">P. Mina</th>
              <th class="text-center" style="width:100px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargando">
              <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando artículos...
              </td>
            </tr>
            <tr v-else-if="articulosFiltrados.length === 0">
              <td colspan="5" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-inbox"></i>
                  <p>Sin resultados</p>
                </div>
              </td>
            </tr>
            <tr v-for="(a, i) in articulosFiltrados" :key="a.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td><span class="mp-badge-code">{{ a.codigo || '—' }}</span></td>
              <td class="fw-medium">{{ a.nombre }}</td>
              <td class="text-end fw-medium" style="color:var(--mp-accent);">S/ {{ parseFloat(a.precio_proveedor).toFixed(2) }}</td>
              <td class="text-end fw-medium" style="color:var(--mp-success);">S/ {{ parseFloat(a.precio_mina).toFixed(2) }}</td>
              <td class="text-center">
                <div class="mp-action-group">
                  <button class="mp-action-btn mp-action-edit" @click="abrirModal(a)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(a.id)" title="Desactivar">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <div class="modal fade" id="modalArticulo" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Artículo</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="mp-form-label">Código</label>
              <input type="text" class="form-control mp-input" v-model="form.codigo" placeholder="Ej: A001" />
            </div>
            <div class="mb-3">
              <label class="mp-form-label">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del artículo" required />
            </div>
            <div class="row g-3">
              <div class="col-6">
                <label class="mp-form-label">Precio Proveedor <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">S/</span>
                  <input type="number" class="form-control mp-input" v-model.number="form.precio_proveedor" min="0" step="0.01" />
                </div>
              </div>
              <div class="col-6">
                <label class="mp-form-label">Precio Mina <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">S/</span>
                  <input type="number" class="form-control mp-input" v-model.number="form.precio_mina" min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div v-if="error" class="alert alert-danger mt-3 py-2" style="font-size:0.85rem;">{{ error }}</div>
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

const promedioMina = computed(() => {
  if (articulos.value.length === 0) return '0.00';
  const sum = articulos.value.reduce((s, a) => s + parseFloat(a.precio_mina || 0), 0);
  return (sum / articulos.value.length).toFixed(2);
});

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
