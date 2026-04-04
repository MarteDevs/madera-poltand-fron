<template>
  <PageLayout title="Requerimientos">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModalCrear">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Requerimiento
      </button>
    </template>

    <!-- Tabla historial -->
    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 class="mb-0 fw-semibold">Historial de Requerimientos</h6>
        <span class="text-muted" style="font-size:0.8rem;">{{ store.historial.length }} registros</span>
      </div>

      <div class="table-responsive">
        <table class="table mb-0">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Mina</th>
              <th>Supervisor</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.cargando">
              <td colspan="6" class="text-center py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
              </td>
            </tr>
            <tr v-else-if="store.historial.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-4 d-block mb-2"></i>Sin requerimientos
              </td>
            </tr>
            <tr v-for="r in store.historial" :key="r.id">
              <td><span class="fw-medium text-primary">{{ r.codigo_req }}</span></td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.mina }}</td>
              <td>{{ r.supervisor }}</td>
              <td><span :class="badgeClass(r.estado)">{{ r.estado }}</span></td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" @click="verDetalles(r)" title="Ver detalles">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ====== MODAL CREAR ====== -->
    <div class="modal fade" id="modalCrear" tabindex="-1" ref="modalCrearRef">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">Nuevo Requerimiento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Cabecera del requerimiento -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Fecha</label>
                <input type="date" class="form-control" v-model="form.fecha" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Mina</label>
                <select class="form-select" v-model="form.mina_id" required>
                  <option value="" disabled>Selecciona una mina</option>
                  <option v-for="m in catStore.minas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Supervisor</label>
                <select class="form-select" v-model="form.supervisor_id">
                  <option value="">Sin asignar</option>
                  <option v-for="s in catStore.supervisores" :key="s.id" :value="s.id">{{ s.nombre }}</option>
                </select>
              </div>
            </div>

            <!-- Líneas de detalle -->
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-semibold mb-0">Artículos del pedido</h6>
              <button class="btn btn-sm btn-outline-primary" @click="agregarLinea">
                <i class="bi bi-plus-lg me-1"></i> Agregar artículo
              </button>
            </div>

            <div class="table-responsive mp-card p-0 overflow-hidden mb-2">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th style="width:110px;">Cantidad</th>
                    <th style="width:120px;">P. Proveedor</th>
                    <th style="width:120px;">P. Mina</th>
                    <th style="width:50px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="form.detalles.length === 0">
                    <td colspan="6" class="text-center text-muted py-3" style="font-size:0.85rem;">
                      Agrega al menos un artículo
                    </td>
                  </tr>
                  <tr v-for="(linea, i) in form.detalles" :key="i">
                    <td>
                      <select class="form-select form-select-sm" v-model="linea.articulo_id" @change="onArticuloChange(linea)">
                        <option value="" disabled>Seleccionar</option>
                        <option v-for="a in catStore.articulos" :key="a.id" :value="a.id">{{ a.nombre }}</option>
                      </select>
                    </td>
                    <td>
                      <select class="form-select form-select-sm" v-model="linea.proveedor_id">
                        <option value="" disabled>Seleccionar</option>
                        <option v-for="p in catStore.proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                      </select>
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm" v-model.number="linea.cantidad" min="1" />
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm" v-model.number="linea.precio_proveedor" min="0" step="0.01" />
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm" v-model.number="linea.precio_mina" min="0" step="0.01" />
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-danger" @click="quitarLinea(i)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="mensajeError" class="alert alert-danger py-2" style="font-size:0.85rem;">
              <i class="bi bi-exclamation-circle me-2"></i>{{ mensajeError }}
            </div>
            <div v-if="mensajeExito" class="alert alert-success py-2" style="font-size:0.85rem;">
              <i class="bi bi-check-circle me-2"></i>{{ mensajeExito }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardar" :disabled="guardando">
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              {{ guardando ? 'Guardando...' : 'Crear Requerimiento' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== MODAL DETALLES ====== -->
    <div class="modal fade" id="modalDetalles" tabindex="-1" ref="modalDetallesRef">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-semibold mb-0">{{ reqSeleccionado?.codigo_req }}</h5>
              <div class="text-muted" style="font-size:0.8rem;">
                {{ reqSeleccionado?.mina }} · {{ reqSeleccionado?.fecha }} · <span :class="badgeClass(reqSeleccionado?.estado)">{{ reqSeleccionado?.estado }}</span>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table mb-0">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th class="text-end">Pedido</th>
                    <th class="text-end">Entregado</th>
                    <th class="text-end">Faltante</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="cargandoDetalles">
                    <td colspan="5" class="text-center py-4 text-muted">
                      <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
                    </td>
                  </tr>
                  <tr v-for="d in detallesActuales" :key="d.id">
                    <td>{{ d.articulo }}</td>
                    <td>{{ d.proveedor }}</td>
                    <td class="text-end fw-medium">{{ d.pedido }}</td>
                    <td class="text-end text-success">{{ d.entregado }}</td>
                    <td class="text-end" :class="d.faltante > 0 ? 'text-danger fw-medium' : 'text-success'">
                      {{ d.faltante }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
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
import { useRequerimientosStore } from '../stores/requerimientos.store';
import { useCatalogosStore } from '../stores/catalogos.store';

const store = useRequerimientosStore();
const catStore = useCatalogosStore();

const modalCrearRef = ref(null);
const modalDetallesRef = ref(null);
let bsModalCrear = null;
let bsModalDetalles = null;

const guardando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');
const reqSeleccionado = ref(null);
const detallesActuales = ref([]);
const cargandoDetalles = ref(false);

const formVacio = () => ({
  fecha: new Date().toISOString().split('T')[0],
  mina_id: '',
  supervisor_id: '',
  detalles: []
});
const form = ref(formVacio());

onMounted(async () => {
  await Promise.all([store.cargarHistorial(), catStore.cargarCatalogos()]);
  bsModalCrear = new Modal(modalCrearRef.value);
  bsModalDetalles = new Modal(modalDetallesRef.value);
});

const abrirModalCrear = () => {
  form.value = formVacio();
  mensajeError.value = '';
  mensajeExito.value = '';
  bsModalCrear.show();
};

const agregarLinea = () => {
  form.value.detalles.push({
    articulo_id: '', proveedor_id: '',
    cantidad: 1, precio_proveedor: 0, precio_mina: 0
  });
};

const quitarLinea = (i) => form.value.detalles.splice(i, 1);

const onArticuloChange = (linea) => {
  const art = catStore.articulos.find(a => a.id === linea.articulo_id);
  if (art) {
    linea.precio_proveedor = art.precio_proveedor;
    linea.precio_mina = art.precio_mina;
  }
};

const guardar = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';
  if (!form.value.fecha || !form.value.mina_id) {
    mensajeError.value = 'Debes seleccionar fecha y mina.';
    return;
  }
  if (form.value.detalles.length === 0) {
    mensajeError.value = 'Agrega al menos un artículo al pedido.';
    return;
  }
  const invalido = form.value.detalles.some(d => !d.articulo_id || !d.proveedor_id || d.cantidad < 1);
  if (invalido) {
    mensajeError.value = 'Completa todos los campos de cada artículo.';
    return;
  }
  guardando.value = true;
  const result = await store.crearRequerimiento({
    fecha: form.value.fecha,
    mina_id: form.value.mina_id,
    supervisor_id: form.value.supervisor_id || null,
    detalles: form.value.detalles
  });
  guardando.value = false;
  if (result.success) {
    mensajeExito.value = `Requerimiento ${result.codigo} creado exitosamente.`;
    setTimeout(() => bsModalCrear.hide(), 1500);
  } else {
    mensajeError.value = result.mensaje;
  }
};

const verDetalles = async (r) => {
  reqSeleccionado.value = r;
  detallesActuales.value = [];
  cargandoDetalles.value = true;
  bsModalDetalles.show();
  detallesActuales.value = await store.getDetalles(r.id);
  cargandoDetalles.value = false;
};

const badgeClass = (estado) => {
  const map = { PENDIENTE: 'badge-pendiente', COMPLETADO: 'badge-completado', CANCELADO: 'badge-cancelado' };
  return map[estado] || 'badge-pendiente';
};
</script>