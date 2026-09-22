<template>
  <PageLayout title="Minas">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nueva Mina
      </button>
    </template>

    <!-- Stats -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
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
      <div class="col-6 col-md-3">
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
      <div class="col-6 col-md-3">
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
                  <button class="mp-action-btn mp-action-delete" @click="desactivar(m.id)" title="Desactivar"><i class="bi bi-trash"></i></button>
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
                  <button class="btn btn-sm btn-outline-success d-flex align-items-center gap-1 py-1 px-2" @click="reactivar(m.id)" title="Reactivar esta mina" style="font-size:0.78rem;">
                    <i class="bi bi-arrow-counterclockwise"></i> Reactivar
                  </button>
                  <button class="mp-action-btn mp-action-delete" @click="eliminarDefinitivo(m.id)" title="Eliminar definitivamente">
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
    <div class="modal fade" id="modalMina" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content mp-modal">
          <div class="modal-header mp-modal-header">
            <h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nueva' }} Mina</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="mp-form-label">Nombre <span class="text-danger">*</span></label>
              <input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre de la mina" />
            </div>
            <div class="mb-3">
              <label class="mp-form-label">Razón Social</label>
              <input type="text" class="form-control mp-input" v-model="form.razon_social" placeholder="Razón social" />
            </div>
            <div class="mb-3">
              <label class="mp-form-label">RUC</label>
              <input type="text" class="form-control mp-input" v-model="form.ruc" placeholder="RUC" />
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
const minas = ref([]);
const minasDesactivadas = ref([]);
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
const form = ref({ nombre: '', razon_social: '', ruc: '' });

const conRuc = computed(() => minas.value.filter(m => m.ruc).length);

const minasFiltradas = computed(() => {
  const q = busqueda.value.toLowerCase().trim();
  if (!q) return minas.value;
  return minas.value.filter(m =>
    m.nombre?.toLowerCase().includes(q) ||
    m.razon_social?.toLowerCase().includes(q) ||
    m.ruc?.toLowerCase().includes(q)
  );
});

const minasDesactivadasFiltradas = computed(() => {
  const q = busquedaDesactivados.value.toLowerCase().trim();
  if (!q) return minasDesactivadas.value;
  return minasDesactivadas.value.filter(m =>
    m.nombre?.toLowerCase().includes(q) ||
    m.razon_social?.toLowerCase().includes(q) ||
    m.ruc?.toLowerCase().includes(q)
  );
});

const cargar = async () => {
  cargando.value = true;
  cargandoDesactivados.value = true;
  try {
    const [resActivos, resDesact] = await Promise.all([
      api.get('/minas'),
      api.get('/minas?estado=0')
    ]);
    minas.value = resActivos.data || [];
    minasDesactivadas.value = resDesact.data || [];
  } catch (e) {
    console.error('Error cargando minas:', e);
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
    if (editando.value) {
      await api.put(`/minas/${editandoId.value}`, form.value);
      toastStore.addToast('Mina actualizada exitosamente', 'success');
    } else {
      const res = await api.post('/minas', form.value);
      toastStore.addToast(res.data?.mensaje || 'Mina guardada exitosamente', 'success');
    }
    await cargar();
    bsModal.hide();
  } catch (e) {
    error.value = e.response?.data?.mensaje || 'Error al guardar';
  } finally { guardando.value = false; }
};

const desactivar = async (id) => {
  if (!confirm('¿Desactivar esta mina? Pasará a la pestaña de Desactivadas.')) return;
  try {
    const res = await api.delete(`/minas/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Mina desactivada', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al desactivar', 'danger');
  }
};

const reactivar = async (id) => {
  if (!confirm('¿Desea reactivar esta mina? Volverá al catálogo activo.')) return;
  try {
    await api.put(`/minas/${id}/reactivar`);
    toastStore.addToast('Mina reactivada exitosamente', 'success');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al reactivar mina', 'danger');
  }
};

const eliminarDefinitivo = async (id) => {
  if (!confirm('¿Desea eliminar definitivamente esta mina? Si no tiene requerimientos o ingresos asociados se borrará por completo.')) return;
  try {
    const res = await api.delete(`/minas/${id}`);
    toastStore.addToast(res.data?.mensaje || 'Mina eliminada', 'info');
    await cargar();
  } catch (e) {
    toastStore.addToast(e.response?.data?.mensaje || 'Error al eliminar mina', 'danger');
  }
};
</script>
