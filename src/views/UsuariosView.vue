<template>
  <PageLayout title="Administración de Usuarios">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModal()">
        <i class="bi bi-person-plus-fill me-1"></i> Nuevo Usuario
      </button>
    </template>

    <div class="mp-card p-0 overflow-hidden">
      <div class="p-3 border-bottom d-flex gap-2 bg-light bg-opacity-50">
        <div class="position-relative" style="max-width: 300px; flex-grow: 1;">
          <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 12px; font-size: 0.9rem;"></i>
          <input 
            type="text" 
            class="form-control form-control-sm ps-4" 
            placeholder="Buscar por nombre o username..." 
            v-model="busqueda"
          >
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th>Nombre</th>
              <th>Username</th>
              <th>Rol</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.cargando">
              <td colspan="5" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>Cargando usuarios...
              </td>
            </tr>
            <tr v-else-if="usuariosFiltrados.length === 0">
              <td colspan="5" class="text-center py-4 text-muted">
                No se encontraron usuarios.
              </td>
            </tr>
            <tr v-for="user in usuariosFiltrados" :key="user.id" class="align-middle">
              <td class="text-muted fw-medium">{{ user.id }}</td>
              <td class="fw-semibold">{{ user.nombre }}</td>
              <td><span class="badge bg-light text-dark border">{{ user.username }}</span></td>
              <td>
                <span class="badge" :class="getRolColor(user.rol_id)">
                  {{ getRolNombre(user.rol_id) }}
                </span>
                <span v-if="authStore.usuario?.id === user.id" class="badge bg-success ms-2">Tú</span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" @click="abrirModal(user)" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmarEliminar(user)" :disabled="authStore.usuario?.id === user.id" title="Eliminar">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div class="modal fade" id="modalUsuario" tabindex="-1" ref="modalRef">
      <div class="modal-dialog">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold text-dark">
              {{ form.id ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardar">
              <div class="mb-3">
                <label class="form-label fw-medium text-secondary" style="font-size: 0.9rem;">Nombre Completo</label>
                <input type="text" class="form-control" v-model="form.nombre" required placeholder="Ej. Juan Pérez">
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium text-secondary" style="font-size: 0.9rem;">Usuario (Username)</label>
                <input type="text" class="form-control" v-model="form.username" required placeholder="Ej. jperez">
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium text-secondary" style="font-size: 0.9rem;">Rol en el Sistema</label>
                <select class="form-select" v-model="form.rol_id" required>
                  <option value="" disabled>Seleccione un rol...</option>
                  <option :value="1">Superadmin</option>
                  <option :value="2">Administrador</option>
                  <option :value="3">Operador</option>
                </select>
              </div>
              
              <div class="mb-2">
                <label class="form-label fw-medium text-secondary d-flex justify-content-between align-items-center" style="font-size: 0.9rem;">
                  Contraseña
                  <span v-if="form.id" class="badge bg-light text-muted border fw-normal" style="font-size: 0.7rem;">Opcional si no se requiere cambio</span>
                </label>
                <input type="password" class="form-control" v-model="form.password" :required="!form.id" placeholder="••••••••">
              </div>

              <!-- Mensajes de Error/Exito -->
              <div v-if="mensajeError" class="alert alert-danger mt-3 py-2" style="font-size: 0.9rem;">
                <i class="bi bi-exclamation-circle me-1"></i> {{ mensajeError }}
              </div>
              <div v-if="mensajeExito" class="alert alert-success mt-3 py-2" style="font-size: 0.9rem;">
                <i class="bi bi-check-circle me-1"></i> {{ mensajeExito }}
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal" :disabled="guardando">Cancelar</button>
                <button type="submit" class="btn btn-primary px-4" :disabled="guardando">
                  <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
                  {{ guardando ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </form>
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
import { useUsuariosStore } from '../stores/usuarios.store';
import { useAuthStore } from '../stores/auth.store';

const store = useUsuariosStore();
const authStore = useAuthStore();
const modalRef = ref(null);
let bsModal = null;

const busqueda = ref('');
const guardando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

const form = ref({
  id: null,
  nombre: '',
  username: '',
  password: '',
  rol_id: ''
});

onMounted(() => {
  store.fetchUsuarios();
  bsModal = new Modal(modalRef.value);
});

// Getter computed filter
const usuariosFiltrados = computed(() => {
  if (!busqueda.value) return store.usuarios;
  const q = busqueda.value.toLowerCase();
  return store.usuarios.filter(u => 
    u.nombre.toLowerCase().includes(q) || 
    u.username.toLowerCase().includes(q)
  );
});

const getRolNombre = (rol_id) => {
  const roles = { 1: 'Superadmin', 2: 'Administrador', 3: 'Operador' };
  return roles[rol_id] || 'Desconocido';
};

const getRolColor = (rol_id) => {
  const colores = { 1: 'bg-primary', 2: 'bg-info text-dark', 3: 'bg-secondary' };
  return colores[rol_id] || 'bg-dark';
};

const abrirModal = (user = null) => {
  mensajeError.value = '';
  mensajeExito.value = '';
  if (user) {
    form.value = { ...user, password: '' }; // No cargamos la contraseña antigua!
  } else {
    form.value = { id: null, nombre: '', username: '', password: '', rol_id: '' };
  }
  bsModal.show();
};

const guardar = async () => {
  guardando.value = true;
  mensajeError.value = '';
  mensajeExito.value = '';

  let res;
  if (form.value.id) {
    res = await store.actualizarUsuario(form.value.id, form.value);
  } else {
    res = await store.crearUsuario(form.value);
  }

  guardando.value = false;

  if (res.success) {
    mensajeExito.value = res.mensaje;
    setTimeout(() => bsModal.hide(), 1200);
  } else {
    mensajeError.value = res.mensaje;
  }
};

const confirmarEliminar = async (user) => {
  if (confirm(`¿Estás seguro de que deseas eliminar permanentemente (desactivar) al usuario "${user.username}"?\nNo podrá volver a iniciar sesión.`)) {
    const res = await store.eliminarUsuario(user.id);
    if (!res.success) {
      alert(res.mensaje);
    }
  }
};
</script>
