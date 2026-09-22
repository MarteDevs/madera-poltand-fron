<template>
  <PageLayout title="Artículos">
    <template #actions>
      <button class="btn btn-outline-primary me-2" @click="abrirModalClonar()">
        <i class="bi bi-copy me-1"></i> Clonar Tarifas
      </button>
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
            <div class="mp-stat-label">Artículos Activos</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:rgba(239,68,68,0.08);color:var(--mp-danger);">
            <i class="bi bi-archive"></i>
          </div>
          <div>
            <div class="mp-stat-value">{{ articulosDesactivados.length }}</div>
            <div class="mp-stat-label">Artículos Desactivados</div>
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
            <div class="mp-stat-label">Precio Prom. Mina ({{ proveedorSeleccionadoNombre }})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Activos / Desactivados -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'activos' }" @click="tabActiva = 'activos'">
          <i class="bi bi-box-seam me-1"></i> Artículos Activos ({{ articulos.length }})
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" :class="{ active: tabActiva === 'desactivados' }" @click="tabActiva = 'desactivados'">
          <i class="bi bi-archive me-1"></i> Artículos Desactivados ({{ articulosDesactivados.length }})
        </button>
      </li>
    </ul>

    <!-- TAB 1: ARTÍCULOS ACTIVOS -->
    <div v-show="tabActiva === 'activos'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h6 class="mb-0 fw-semibold">Catálogo de Artículos</h6>
          <!-- Selector Proveedor Tarifa -->
          <div class="d-flex align-items-center gap-2">
            <span class="text-muted fw-medium" style="font-size:0.85rem;">Proveedor Tarifa:</span>
            <select v-model="proveedorSeleccionadoId" class="form-select form-select-sm" style="width: auto; min-width: 170px;">
              <option v-for="p in catStore.proveedores" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>
        </div>

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
              <th @click="ordenarPor('codigo')" style="cursor: pointer; user-select: none;" title="Ordenar por código">
                Código
                <i v-if="columnaOrden === 'codigo'" :class="direccionOrden === 'asc' ? 'bi bi-sort-numeric-down text-primary' : 'bi bi-sort-numeric-up-alt text-primary'" class="ms-1"></i>
                <i v-else class="bi bi-arrow-down-up ms-1 text-muted" style="font-size:0.75rem;"></i>
              </th>
              <th @click="ordenarPor('nombre')" style="cursor: pointer; user-select: none;" title="Ordenar por nombre">
                Nombre
                <i v-if="columnaOrden === 'nombre'" :class="direccionOrden === 'asc' ? 'bi bi-sort-alpha-down text-primary' : 'bi bi-sort-alpha-up-alt text-primary'" class="ms-1"></i>
                <i v-else class="bi bi-arrow-down-up ms-1 text-muted" style="font-size:0.75rem;"></i>
              </th>
              <th class="text-end" @click="ordenarPor('precio_proveedor')" style="cursor: pointer; user-select: none;" title="Ordenar por precio proveedor">
                P. Proveedor ({{ proveedorSeleccionadoNombre }})
                <i v-if="columnaOrden === 'precio_proveedor'" :class="direccionOrden === 'asc' ? 'bi bi-sort-numeric-down text-primary' : 'bi bi-sort-numeric-up-alt text-primary'" class="ms-1"></i>
                <i v-else class="bi bi-arrow-down-up ms-1 text-muted" style="font-size:0.75rem;"></i>
              </th>
              <th class="text-end" @click="ordenarPor('precio_mina')" style="cursor: pointer; user-select: none;" title="Ordenar por precio mina">
                P. Mina ({{ proveedorSeleccionadoNombre }})
                <i v-if="columnaOrden === 'precio_mina'" :class="direccionOrden === 'asc' ? 'bi bi-sort-numeric-down text-primary' : 'bi bi-sort-numeric-up-alt text-primary'" class="ms-1"></i>
                <i v-else class="bi bi-arrow-down-up ms-1 text-muted" style="font-size:0.75rem;"></i>
              </th>
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
              <td class="text-end fw-medium" style="color:var(--mp-accent);">
                S/ {{ catStore.getPrecio(a.id, proveedorSeleccionadoId).precio_proveedor.toFixed(2) }}
              </td>
              <td class="text-end fw-medium" style="color:var(--mp-success);">
                S/ {{ catStore.getPrecio(a.id, proveedorSeleccionadoId).precio_mina.toFixed(2) }}
              </td>
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

    <!-- TAB 2: ARTÍCULOS DESACTIVADOS -->
    <div v-show="tabActiva === 'desactivados'" class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header flex-wrap gap-2">
        <div class="d-flex align-items-center gap-2">
          <h6 class="mb-0 fw-semibold text-danger">
            <i class="bi bi-archive me-1"></i> Artículos Desactivados
          </h6>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size:0.75rem;">Histórico protegido</span>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="mp-search-box">
            <i class="bi bi-search"></i>
            <input type="text" v-model="busquedaDesactivados" placeholder="Buscar desactivado..." />
          </div>
          <span class="text-muted" style="font-size:0.8rem;">{{ articulosDesactivadosFiltrados.length }} resultados</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th class="text-end">P. Proveedor Base</th>
              <th class="text-end">P. Mina Base</th>
              <th class="text-center" style="width:180px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="cargandoDesactivados">
              <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando artículos desactivados...
              </td>
            </tr>
            <tr v-else-if="articulosDesactivadosFiltrados.length === 0">
              <td colspan="5" class="text-center py-5">
                <div class="mp-empty-state">
                  <i class="bi bi-check2-circle text-success" style="font-size:2rem;"></i>
                  <p class="mt-2 text-muted">No hay artículos desactivados</p>
                </div>
              </td>
            </tr>
            <tr v-for="a in articulosDesactivadosFiltrados" :key="a.id" class="mp-table-row">
              <td><span class="mp-badge-code bg-light text-muted">{{ a.codigo || '—' }}</span></td>
              <td class="fw-medium text-muted">
                <span class="text-decoration-line-through me-2">{{ a.nombre }}</span>
                <span class="badge bg-danger-subtle text-danger" style="font-size:0.7rem;">Inactivo</span>
              </td>
              <td class="text-end text-muted">
                S/ {{ parseFloat(a.precio_proveedor || 0).toFixed(2) }}
              </td>
              <td class="text-end text-muted">
                S/ {{ parseFloat(a.precio_mina || 0).toFixed(2) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(a.id)" title="Reactivar este artículo" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(a.id)" title="Eliminar definitivamente">
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
            <div class="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2" style="font-size:0.83rem;">
              <i class="bi bi-info-circle-fill fs-6"></i>
              <span>Tarifas asociadas para: <strong>{{ proveedorSeleccionadoNombre }}</strong></span>
            </div>

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

    <!-- Modal Clonar Tarifas -->
    <div class="modal fade" id="modalClonar" tabindex="-1" ref="modalClonarRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">
              <i class="bi bi-copy me-2"></i>Clonar Tarifas de Proveedor
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted" style="font-size:0.85rem;">
              Copia todas las tarifas (precio proveedor y precio mina) de un proveedor origen a un proveedor destino.
            </p>

            <div class="mb-3">
              <label class="mp-form-label">Proveedor Origen <span class="text-danger">*</span></label>
              <select v-model="formClonar.origen_id" class="form-select mp-input">
                <option value="" disabled>Seleccione proveedor origen</option>
                <option v-for="p in catStore.proveedores" :key="p.id" :value="p.id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="mp-form-label">Proveedor Destino <span class="text-danger">*</span></label>
              <select v-model="formClonar.destino_id" class="form-select mp-input">
                <option value="" disabled>Seleccione proveedor destino</option>
                <option v-for="p in catStore.proveedores" :key="p.id" :value="p.id" :disabled="p.id === formClonar.origen_id">
                  {{ p.nombre }}
                </option>
              </select>
            </div>

            <div v-if="errorClonar" class="alert alert-danger mt-3 py-2" style="font-size:0.85rem;">{{ errorClonar }}</div>
          </div>
          <div class="modal-footer mp-modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn-mp-primary" @click="clonarTarifas" :disabled="clonando">
              <span v-if="clonando" class="spinner-border spinner-border-sm me-2"></span>
              {{ clonando ? 'Clonando...' : 'Clonar Tarifas' }}
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
import { useCatalogosStore } from '../stores/catalogos.store';
import { useToastStore } from '../stores/toast.store';

const catStore = useCatalogosStore();
const toastStore = useToastStore();

const tabActiva = ref('activos');
const articulos = ref([]);
const articulosDesactivados = ref([]);
const cargando = ref(true);
const cargandoDesactivados = ref(false);
const busqueda = ref('');
const busquedaDesactivados = ref('');
const proveedorSeleccionadoId = ref('');
const modalRef = ref(null);
const modalClonarRef = ref(null);
let bsModal = null;
let bsModalClonar = null;

const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const error = ref('');
const form = ref({ codigo: '', nombre: '', precio_proveedor: 0, precio_mina: 0 });

// Modal Clonar
const formClonar = ref({ origen_id: '', destino_id: '' });
const clonando = ref(false);
const errorClonar = ref('');

const proveedorSeleccionadoNombre = computed(() => {
  const p = catStore.proveedores.find(x => x.id === Number(proveedorSeleccionadoId.value));
  return p ? p.nombre : 'General';
});

const columnaOrden = ref('codigo');
const direccionOrden = ref('asc');

const ordenarPor = (columna) => {
  if (columnaOrden.value === columna) {
    direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc';
  } else {
    columnaOrden.value = columna;
    direccionOrden.value = 'asc';
  }
};

const articulosFiltrados = computed(() => {
  const query = busqueda.value.toLowerCase().trim();
  let list = articulos.value.filter(a =>
    a.nombre?.toLowerCase().includes(query) ||
    (a.codigo && a.codigo.toLowerCase().includes(query))
  );

  return [...list].sort((a, b) => {
    let result = 0;
    if (columnaOrden.value === 'codigo') {
      const numA = parseInt(a.codigo, 10);
      const numB = parseInt(b.codigo, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        result = numA - numB;
      } else {
        result = (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true });
      }
    } else if (columnaOrden.value === 'nombre') {
      result = (a.nombre || '').localeCompare(b.nombre || '');
    } else if (columnaOrden.value === 'precio_proveedor') {
      const pA = catStore.getPrecio(a.id, proveedorSeleccionadoId.value).precio_proveedor;
      const pB = catStore.getPrecio(b.id, proveedorSeleccionadoId.value).precio_proveedor;
      result = pA - pB;
    } else if (columnaOrden.value === 'precio_mina') {
      const pA = catStore.getPrecio(a.id, proveedorSeleccionadoId.value).precio_mina;
      const pB = catStore.getPrecio(b.id, proveedorSeleccionadoId.value).precio_mina;
      result = pA - pB;
    }
    return direccionOrden.value === 'asc' ? result : -result;
  });
});

const articulosDesactivadosFiltrados = computed(() => {
  const query = busquedaDesactivados.value.toLowerCase().trim();
  let list = articulosDesactivados.value.filter(a =>
    a.nombre?.toLowerCase().includes(query) ||
    (a.codigo && a.codigo.toLowerCase().includes(query))
  );

  return [...list].sort((a, b) => {
    const numA = parseInt(a.codigo, 10);
    const numB = parseInt(b.codigo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true });
  });
});

const promedioMina = computed(() => {
  if (articulos.value.length === 0) return '0.00';
  const sum = articulos.value.reduce((s, a) => {
    const p = catStore.getPrecio(a.id, proveedorSeleccionadoId.value);
    return s + parseFloat(p.precio_mina || 0);
  }, 0);
  return (sum / articulos.value.length).toFixed(2);
});

const cargar = async () => {
  cargando.value = true;
  cargandoDesactivados.value = true;
  try {
    await catStore.cargarCatalogos();
    articulos.value = catStore.articulos || [];
    if (articulos.value.length === 0) {
      try {
        const res = await api.get('/articulos');
        articulos.value = res.data || [];
      } catch (e) {
        console.error('Error cargando artículos directo:', e);
      }
    }
    // Cargar artículos desactivados
    try {
      const resDesact = await api.get('/articulos?estado=0');
      articulosDesactivados.value = resDesact.data || [];
    } catch (e) {
      console.error('Error cargando artículos desactivados:', e);
    }

    if (!proveedorSeleccionadoId.value && catStore.proveedores.length > 0) {
      const carvajal = catStore.proveedores.find(p => p.nombre?.toUpperCase().includes('CARBAJAL'));
      proveedorSeleccionadoId.value = carvajal ? carvajal.id : catStore.proveedores[0].id;
    }
  } finally {
    cargando.value = false;
    cargandoDesactivados.value = false;
  }
};

onMounted(async () => {
  await cargar();
  bsModal = new Modal(modalRef.value);
  bsModalClonar = new Modal(modalClonarRef.value);
});

const abrirModal = (item = null) => {
  error.value = '';
  if (item) {
    editando.value = true;
    editandoId.value = item.id;
    const precio = catStore.getPrecio(item.id, proveedorSeleccionadoId.value);
    form.value = {
      codigo: item.codigo || '',
      nombre: item.nombre || '',
      precio_proveedor: precio.precio_proveedor,
      precio_mina: precio.precio_mina
    };
  } else {
    editando.value = false;
    editandoId.value = null;
    form.value = {
      codigo: '',
      nombre: '',
      precio_proveedor: 0,
      precio_mina: 0
    };
  }
  bsModal.show();
};

const guardar = async () => {
  error.value = '';
  if (!form.value.nombre) { error.value = 'El nombre es obligatorio.'; return; }
  guardando.value = true;
  try {
    let artId = editandoId.value;
    if (editando.value) {
      await api.put(`/articulos/${editandoId.value}`, form.value);
    } else {
      const res = await api.post('/articulos', form.value);
      artId = res.data?.id;
    }

    if (proveedorSeleccionadoId.value && artId) {
      await catStore.guardarPrecioProveedor({
        articulo_id: artId,
        proveedor_id: proveedorSeleccionadoId.value,
        precio_proveedor: form.value.precio_proveedor,
        precio_mina: form.value.precio_mina
      });
    }

    await cargar();
    bsModal.hide();
    toastStore.addToast(`Artículo ${editando.value ? 'actualizado' : 'creado'} exitosamente`, 'success');
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este artículo? Pasará a la pestaña de Desactivados.')) return;
  try {
    const res = await api.delete(`/articulos/${id}`);
    await cargar();
    toastStore.addToast(res.data?.mensaje || 'Artículo desactivado', 'info');
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al desactivar', 'danger');
  }
};

const reactivar = async (id) => {
  if (!confirm('¿Desea reactivar este artículo? Volverá al catálogo activo.')) return;
  try {
    await api.put(`/articulos/${id}/reactivar`);
    toastStore.addToast('Artículo reactivado exitosamente', 'success');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al reactivar artículo', 'danger');
  }
};

const eliminarDefinitivo = async (id) => {
  if (!confirm('¿Desea eliminar definitivamente este artículo? Si no tiene requerimientos o ingresos asociados se borrará por completo.')) return;
  try {
    const res = await api.delete(`/articulos/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Artículo eliminado', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al eliminar artículo', 'danger');
  }
};

const abrirModalClonar = () => {
  errorClonar.value = '';
  const carvajal = catStore.proveedores.find(p => p.nombre?.toUpperCase().includes('CARBAJAL')) || catStore.proveedores[0];
  formClonar.value = {
    origen_id: carvajal ? carvajal.id : (proveedorSeleccionadoId.value || ''),
    destino_id: ''
  };
  bsModalClonar.show();
};

const clonarTarifas = async () => {
  errorClonar.value = '';
  if (!formClonar.value.origen_id || !formClonar.value.destino_id) {
    errorClonar.value = 'Debe seleccionar un proveedor de origen y uno de destino.';
    return;
  }
  if (Number(formClonar.value.origen_id) === Number(formClonar.value.destino_id)) {
    errorClonar.value = 'El proveedor origen y destino deben ser diferentes.';
    return;
  }
  clonando.value = true;
  try {
    await catStore.clonarPrecios({
      origen_proveedor_id: formClonar.value.origen_id,
      destino_proveedor_id: formClonar.value.destino_id
    });
    toastStore.addToast('Tarifas clonadas exitosamente', 'success');
    bsModalClonar.hide();
  } catch (e) {
    errorClonar.value = e.response?.data?.mensaje || 'Error al clonar tarifas';
  } finally {
    clonando.value = false;
  }
};
</script>
