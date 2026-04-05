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
        <table class="table mb-0" style="font-size:0.85rem;">
          <thead>
            <tr>
              <th>Código</th>
              <th>Fecha</th>
              <th>Mina</th>
              <th>Supervisor</th>
              <th>Estado</th>
              <th class="text-end" style="color:#2563eb;">Total Prov.</th>
              <th class="text-end" style="color:#16a34a;">Total Mina</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.cargando">
              <td colspan="8" class="text-center py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
              </td>
            </tr>
            <tr v-else-if="store.historial.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-4 d-block mb-2"></i>Sin requerimientos
              </td>
            </tr>
            <tr v-for="r in store.historial" :key="r.id">
              <td><span class="fw-medium text-primary">{{ r.codigo_req }}</span></td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.mina }}</td>
              <td>{{ r.supervisor }}</td>
              <td><span :class="badgeClass(r.estado)">{{ r.estado }}</span></td>
              <td class="text-end fw-semibold" style="color:#2563eb;">
                S/ {{ Number(r.total_proveedor).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-end fw-semibold" style="color:#16a34a;">
                S/ {{ Number(r.total_mina).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-secondary" @click="verDetalles(r)" title="Ver detalles">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="store.historial.length > 0" class="table-light">
            <tr>
              <td colspan="5" class="text-end fw-bold" style="font-size:0.82rem;">TOTAL GENERAL:</td>
              <td class="text-end fw-bold" style="color:#2563eb;">
                S/ {{ store.historial.reduce((s, r) => s + Number(r.total_proveedor), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-end fw-bold" style="color:#16a34a;">
                S/ {{ store.historial.reduce((s, r) => s + Number(r.total_mina), 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ====== MODAL CREAR ====== -->
    <div class="modal fade" id="modalCrear" tabindex="-1" ref="modalCrearRef">
      <div class="modal-dialog modal-xl" style="max-width:1300px;">
        <div class="modal-content" style="height:88vh; display:flex; flex-direction:column;">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">Nuevo Requerimiento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" style="overflow-y:auto; flex:1; display:flex; flex-direction:column;">
            <!-- Cabecera del requerimiento -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Fecha</label>
                <input type="date" class="form-control" v-model="form.fecha" required />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Mina</label>
                <SearchableSelect
                  v-model="form.mina_id"
                  :options="catStore.minas"
                  placeholder="Selecciona una mina"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Proveedor</label>
                <SearchableSelect
                  v-model="form.proveedor_id"
                  :options="catStore.proveedores"
                  placeholder="Selecciona un proveedor"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Supervisor</label>
                <SearchableSelect
                  v-model="form.supervisor_id"
                  :options="catStore.supervisores"
                  placeholder="Sin asignar"
                  :allow-empty="true"
                  empty-label="Sin asignar"
                />
              </div>
            </div>

            <!-- Líneas de detalle -->
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-semibold mb-0">Artículos del pedido</h6>
              <button class="btn btn-sm btn-outline-primary" @click="agregarLinea">
                <i class="bi bi-plus-lg me-1"></i> Agregar artículo
              </button>
            </div>

            <div class="table-responsive mp-card p-0 overflow-auto mb-2" style="flex:1;">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th style="width:110px;">Cantidad</th>
                    <th style="width:120px;">P. Proveedor</th>
                    <th style="width:120px;">P. Mina</th>
                    <th style="width:50px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="form.detalles.length === 0">
                    <td colspan="5" class="text-center text-muted py-3" style="font-size:0.85rem;">
                      Agrega al menos un artículo
                    </td>
                  </tr>
                  <tr v-for="(linea, i) in form.detalles" :key="i">
                    <td style="min-width:240px;">
                      <SearchableSelect
                        v-model="linea.articulo_id"
                        :options="catStore.articulos"
                        placeholder="Seleccionar artículo"
                        @update:modelValue="onArticuloChange(linea)"
                      />
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
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-semibold mb-0">{{ reqSeleccionado?.codigo_req }}</h5>
              <div class="text-muted" style="font-size:0.8rem;">
                {{ reqSeleccionado?.mina }} · {{ reqSeleccionado?.supervisor }} · {{ reqSeleccionado?.fecha }} · <span :class="badgeClass(reqSeleccionado?.estado)">{{ reqSeleccionado?.estado }}</span>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="table-responsive">
              <table class="table mb-0" style="font-size:0.85rem;">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th class="text-end">Pedido</th>
                    <th class="text-end">Entregado</th>
                    <th class="text-end">Faltante</th>
                    <th class="text-end" style="color:#2563eb;">P. Prov.</th>
                    <th class="text-end" style="color:#2563eb;">Total Prov.</th>
                    <th class="text-end" style="color:#16a34a;">P. Mina</th>
                    <th class="text-end" style="color:#16a34a;">Total Mina</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="cargandoDetalles">
                    <td colspan="9" class="text-center py-4 text-muted">
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
                    <td class="text-end" style="color:#2563eb;">{{ Number(d.precio_proveedor).toFixed(2) }}</td>
                    <td class="text-end fw-semibold" style="color:#2563eb;">
                      {{ (Number(d.pedido) * Number(d.precio_proveedor)).toFixed(2) }}
                    </td>
                    <td class="text-end" style="color:#16a34a;">{{ Number(d.precio_mina).toFixed(2) }}</td>
                    <td class="text-end fw-semibold" style="color:#16a34a;">
                      {{ (Number(d.pedido) * Number(d.precio_mina)).toFixed(2) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="detallesActuales.length > 0" class="table-light">
                  <tr>
                    <td colspan="5" class="text-end fw-bold" style="font-size:0.82rem;">TOTALES:</td>
                    <td class="text-end"></td>
                    <td class="text-end fw-bold" style="color:#2563eb;">
                      S/ {{ detallesActuales.reduce((s, d) => s + Number(d.pedido) * Number(d.precio_proveedor), 0).toFixed(2) }}
                    </td>
                    <td class="text-end"></td>
                    <td class="text-end fw-bold" style="color:#16a34a;">
                      S/ {{ detallesActuales.reduce((s, d) => s + Number(d.pedido) * Number(d.precio_mina), 0).toFixed(2) }}
                    </td>
                  </tr>
                </tfoot>
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
import SearchableSelect from '../components/SearchableSelect.vue';
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
  proveedor_id: '',
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
    articulo_id: '',
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
  if (!form.value.proveedor_id) {
    mensajeError.value = 'Debes seleccionar un proveedor.';
    return;
  }
  if (form.value.detalles.length === 0) {
    mensajeError.value = 'Agrega al menos un artículo al pedido.';
    return;
  }
  const invalido = form.value.detalles.some(d => !d.articulo_id || d.cantidad < 1);
  if (invalido) {
    mensajeError.value = 'Selecciona el artículo e ingresa una cantidad válida en cada línea.';
    return;
  }
  guardando.value = true;
  // Propagamos el proveedor de la cabecera a cada línea de detalle
  const detallesConProveedor = form.value.detalles.map(d => ({
    ...d,
    proveedor_id: form.value.proveedor_id
  }));
  const result = await store.crearRequerimiento({
    fecha: form.value.fecha,
    mina_id: form.value.mina_id,
    supervisor_id: form.value.supervisor_id || null,
    detalles: detallesConProveedor
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