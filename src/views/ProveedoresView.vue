<template>
  <PageLayout title="Proveedores">
    <template #actions>
      <button class="btn-mp-primary" @click="abrirModal()">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Proveedor
      </button>
    </template>
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="mp-stat-card">
          <div class="mp-stat-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);"><i class="bi bi-truck"></i></div>
          <div><div class="mp-stat-value">{{ proveedores.length }}</div><div class="mp-stat-label">Proveedores</div></div>
        </div>
      </div>
    </div>
    <div class="mp-card p-0 overflow-hidden">
      <div class="mp-card-header">
        <h6 class="mb-0 fw-semibold">Proveedores Activos</h6>
        <span class="text-muted" style="font-size:0.8rem;">{{ proveedores.length }} registros</span>
      </div>
      <div class="table-responsive">
        <table class="table mp-table mb-0">
          <thead><tr><th style="width:50px;">#</th><th>Nombre</th><th>Fecha de Alta</th><th class="text-center" style="width:100px;">Acciones</th></tr></thead>
          <tbody>
            <tr v-if="cargando"><td colspan="4" class="text-center py-5 text-muted"><div class="spinner-border spinner-border-sm me-2"></div>Cargando...</td></tr>
            <tr v-else-if="proveedores.length === 0"><td colspan="4" class="text-center py-5"><div class="mp-empty-state"><i class="bi bi-truck"></i><p>Sin proveedores</p></div></td></tr>
            <tr v-for="(p, i) in proveedores" :key="p.id" class="mp-table-row" :style="{ animationDelay: `${i * 30}ms` }">
              <td class="text-muted fw-medium" style="font-size:0.8rem;">{{ p.id }}</td>
              <td><div class="d-flex align-items-center gap-2"><div class="mp-avatar-icon" style="background:var(--mp-accent-subtle);color:var(--mp-accent);"><i class="bi bi-truck"></i></div><span class="fw-semibold">{{ p.nombre }}</span></div></td>
              <td class="text-muted" style="font-size:0.85rem;">{{ p.created_at?.split('T')[0] || '—' }}</td>
              <td class="text-center"><div class="mp-action-group"><button class="mp-action-btn mp-action-edit" @click="abrirModal(p)"><i class="bi bi-pencil"></i></button><button class="mp-action-btn mp-action-delete" @click="desactivar(p.id)"><i class="bi bi-trash"></i></button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal fade" id="modalProveedor" tabindex="-1" ref="modalRef">
      <div class="modal-dialog"><div class="modal-content mp-modal">
        <div class="modal-header mp-modal-header"><h5 class="modal-title fw-semibold">{{ editando ? 'Editar' : 'Nuevo' }} Proveedor</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><div class="mb-3"><label class="mp-form-label">Nombre <span class="text-danger">*</span></label><input type="text" class="form-control mp-input" v-model="form.nombre" placeholder="Nombre del proveedor" /></div><div v-if="error" class="alert alert-danger py-2" style="font-size:0.85rem;">{{ error }}</div></div>
        <div class="modal-footer mp-modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button><button class="btn-mp-primary" @click="guardar" :disabled="guardando"><span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>{{ guardando ? 'Guardando...' : 'Guardar' }}</button></div>
      </div></div>
    </div>
  </PageLayout>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import PageLayout from '../components/PageLayout.vue';
import api from '../api/axios';
const proveedores = ref([]);const cargando = ref(true);const modalRef = ref(null);let bsModal = null;
const editando = ref(false);const editandoId = ref(null);const guardando = ref(false);const error = ref('');const form = ref({ nombre: '' });
const cargar = async () => { cargando.value = true; try { const res = await api.get('/proveedores'); proveedores.value = res.data; } finally { cargando.value = false; } };
onMounted(async () => { await cargar(); bsModal = new Modal(modalRef.value); });
const abrirModal = (item = null) => { error.value = ''; if (item) { editando.value = true; editandoId.value = item.id; form.value = { nombre: item.nombre }; } else { editando.value = false; editandoId.value = null; form.value = { nombre: '' }; } bsModal.show(); };
const guardar = async () => { error.value = ''; if (!form.value.nombre) { error.value = 'El nombre es obligatorio.'; return; } guardando.value = true; try { if (editando.value) await api.put(`/proveedores/${editandoId.value}`, form.value); else await api.post('/proveedores', form.value); await cargar(); bsModal.hide(); } catch (e) { error.value = e.response?.data?.mensaje || 'Error al guardar'; } finally { guardando.value = false; } };
const desactivar = async (id) => { if (!confirm('¿Desactivar este proveedor?')) return; await api.delete(`/proveedores/${id}`); await cargar(); };
</script>
