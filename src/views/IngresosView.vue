<template>
  <PageLayout title="Ingresos de Madera">
    <template #actions>
      <button class="btn btn-primary btn-sm" @click="abrirModalIngreso">
        <i class="bi bi-plus-lg me-1"></i> Registrar Ingreso
      </button>
    </template>

    <!-- ===== TABS ===== -->
    <ul class="nav nav-tabs mb-4" id="ingresosTabs">
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tabActiva === 'pendientes' }"
          @click="tabActiva = 'pendientes'"
        >
          <i class="bi bi-hourglass-split me-2"></i>
          Pendientes de Entrega
          <span v-if="store.pendientes.length > 0" class="badge bg-warning text-dark ms-2">
            {{ store.pendientes.length }}
          </span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          :class="{ active: tabActiva === 'historial' }"
          @click="cambiarAHistorial"
        >
          <i class="bi bi-clock-history me-2"></i>
          Historial de Ingresos
          <span v-if="store.historial.length > 0" class="badge bg-secondary ms-2">
            {{ store.historial.length }}
          </span>
        </button>
      </li>
    </ul>

    <!-- ===== TAB: PENDIENTES ===== -->
    <div v-show="tabActiva === 'pendientes'">
      <div class="alert alert-info d-flex align-items-center gap-2 mb-4 py-2" style="font-size:0.85rem;">
        <i class="bi bi-info-circle-fill"></i>
        Aquí se muestran todos los ítems <strong>pendientes de entrega</strong>. Registra un ingreso para marcar cantidades recibidas.
      </div>

      <div class="mp-card p-0 overflow-hidden">
        <div class="px-4 py-3 border-bottom">
          <h6 class="mb-0 fw-semibold">
            Items Pendientes de Entrega
            <span class="badge bg-warning text-dark ms-2">{{ store.pendientes.length }}</span>
          </h6>
        </div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Código Req.</th>
                <th>Artículo</th>
                <th>Proveedor</th>
                <th class="text-end">Pedido</th>
                <th class="text-end">Entregado</th>
                <th class="text-end">Faltante</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.cargando">
                <td colspan="6" class="text-center py-5 text-muted">
                  <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
                </td>
              </tr>
              <tr v-else-if="store.pendientes.length === 0">
                <td colspan="6" class="text-center py-5 text-success">
                  <i class="bi bi-check-circle fs-4 d-block mb-2"></i>¡Todo entregado! No hay faltantes.
                </td>
              </tr>
              <tr v-for="item in store.pendientes" :key="item.requerimiento_detalle_id">
                <td><span class="fw-medium text-primary">{{ item.codigo_req }}</span></td>
                <td>{{ item.articulo }}</td>
                <td><span class="text-muted">{{ item.proveedor }}</span></td>
                <td class="text-end fw-medium">{{ item.pedido }}</td>
                <td class="text-end text-success">{{ item.entregado }}</td>
                <td class="text-end text-danger fw-semibold">{{ item.faltante }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== TAB: HISTORIAL ===== -->
    <div v-show="tabActiva === 'historial'">
      <div class="alert alert-secondary d-flex align-items-center gap-2 mb-4 py-2" style="font-size:0.85rem;">
        <i class="bi bi-clock-history"></i>
        Registro de todos los viajes/ingresos de material procesados en el sistema.
      </div>

      <div class="mp-card p-0 overflow-hidden">
        <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 class="mb-0 fw-semibold">Ingresos Registrados</h6>
          <button class="btn btn-sm btn-outline-secondary" @click="store.cargarHistorial()" :disabled="store.cargandoHistorial">
            <span v-if="store.cargandoHistorial" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-arrow-clockwise me-1"></i>
            Actualizar
          </button>
        </div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Código Ingreso</th>
                <th>Fecha</th>
                <th>N° Viaje</th>
                <th>Vale</th>
                <th class="text-center">Ítems</th>
                <th class="text-end">Total Entregado</th>
                <th>Observación</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.cargandoHistorial">
                <td colspan="8" class="text-center py-5 text-muted">
                  <span class="spinner-border spinner-border-sm me-2"></span>Cargando historial...
                </td>
              </tr>
              <tr v-else-if="store.historial.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-4 d-block mb-2"></i>No hay ingresos registrados aún.
                </td>
              </tr>
              <tr v-for="ing in store.historial" :key="ing.id">
                <td><span class="fw-medium text-primary" style="font-size:0.82rem;">{{ ing.codigo_ingreso }}</span></td>
                <td>{{ ing.fecha }}</td>
                <td>
                  <span v-if="ing.viaje" class="badge bg-light text-dark border">{{ ing.viaje }}</span>
                  <span v-else class="text-muted" style="font-size:0.8rem;">—</span>
                </td>
                <td>
                  <span v-if="ing.vale" class="fw-medium">{{ ing.vale }}</span>
                  <span v-else class="text-muted" style="font-size:0.8rem;">—</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-primary bg-opacity-10 text-primary fw-semibold">{{ ing.total_items }}</span>
                </td>
                <td class="text-end fw-semibold text-success">{{ Number(ing.total_entregado).toFixed(2) }}</td>
                <td>
                  <span v-if="ing.observacion" class="text-muted" style="font-size:0.82rem;">{{ ing.observacion }}</span>
                  <span v-else class="text-muted" style="font-size:0.8rem;">—</span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary" style="font-size:0.78rem;" @click="verDetalle(ing)">
                    <i class="bi bi-eye me-1"></i>Detalle
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ====== MODAL: REGISTRAR INGRESO ====== -->
    <div class="modal fade" id="modalIngreso" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">Registrar Ingreso (Viaje)</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Cabecera ingreso -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Fecha</label>
                <input
                  ref="refFecha"
                  type="date"
                  class="form-control"
                  v-model="form.fecha"
                  required
                  @keydown.enter.prevent="refViaje.focusOpen ? refViaje.focusOpen() : refViaje.focus()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">N° Viaje</label>
                <SearchableSelect
                  ref="refViaje"
                  v-model="form.viaje"
                  :options="opcionesViaje"
                  placeholder="— Seleccionar —"
                  @navigate="refVale.focus()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Vale</label>
                <input
                  ref="refVale"
                  type="text"
                  class="form-control"
                  v-model="form.vale"
                  placeholder="Ej: 2850"
                  @keydown.enter.prevent="refObservacion.focus()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Observación</label>
                <input
                  ref="refObservacion"
                  type="text"
                  class="form-control"
                  v-model="form.observacion"
                  placeholder="Opcional"
                  @keydown.enter.prevent="refBuscador.focus()"
                />
              </div>
            </div>

            <h6 class="fw-semibold mb-2">Selecciona los ítems entregados en este viaje</h6>
            <p class="text-muted mb-3" style="font-size:0.8rem;">
              Solo aparecen los ítems con faltante. Marca el checkbox e ingresa la cantidad entregada en este viaje.
            </p>

            <!-- Buscador -->
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="position-relative flex-grow-1" style="max-width:380px;">
                <i class="bi bi-search position-absolute text-muted" style="left:10px;top:50%;transform:translateY(-50%);font-size:0.85rem;"></i>
                <input
                  ref="refBuscador"
                  type="text"
                  class="form-control form-control-sm ps-4"
                  v-model="buscarReq"
                  placeholder="Filtrar por requerimiento o artículo..."
                  autocomplete="off"
                  style="border-radius:8px;"
                />
                <button
                  v-if="buscarReq"
                  class="btn btn-sm position-absolute p-0 border-0 text-muted"
                  style="right:8px;top:50%;transform:translateY(-50%);background:none;"
                  @click="buscarReq = ''"
                >
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              </div>
              <span v-if="itemsMarcados.length > 0" class="badge bg-success">
                <i class="bi bi-check2 me-1"></i>{{ itemsMarcados.length }} seleccionado{{ itemsMarcados.length > 1 ? 's' : '' }}
              </span>
            </div>

            <div class="table-responsive mp-card p-0 overflow-hidden">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th style="width:40px;"></th>
                    <th>Req.</th>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th class="text-end">Faltante</th>
                    <th style="width:140px;">Cant. Entregada</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- SECCIÓN: MARCADOS (siempre arriba) -->
                  <template v-if="itemsMarcados.length > 0">
                    <tr style="background:#f0fdf4;">
                      <td colspan="6" class="py-1 px-3" style="font-size:0.75rem;font-weight:600;color:#16a34a;letter-spacing:0.04em;border-bottom:2px solid #bbf7d0;">
                        <i class="bi bi-check2-circle me-1"></i>SELECCIONADOS PARA ESTE VIAJE
                      </td>
                    </tr>
                    <tr
                      v-for="item in itemsMarcados"
                      :key="'sel-' + item.requerimiento_detalle_id"
                      style="background:#f0fdf4;"
                    >
                      <td>
                        <input type="checkbox" class="form-check-input"
                          v-model="seleccionados[item.requerimiento_detalle_id]"
                          @change="onCheck(item)" />
                      </td>
                      <td><span class="text-primary fw-medium" style="font-size:0.8rem;">{{ item.codigo_req }}</span></td>
                      <td style="font-size:0.85rem;">{{ item.articulo }}</td>
                      <td class="text-muted" style="font-size:0.85rem;">{{ item.proveedor }}</td>
                      <td class="text-end text-danger fw-semibold">{{ item.faltante }}</td>
                      <td>
                        <input type="number" class="form-control form-control-sm"
                          v-model.number="cantidades[item.requerimiento_detalle_id]"
                          :min="0.01" :max="item.faltante" step="0.01" />
                      </td>
                    </tr>
                    <!-- Separador si hay resultados de búsqueda también -->
                    <tr v-if="itemsFiltradosNoMarcados.length > 0" style="background:#f8fafc;">
                      <td colspan="6" class="py-1 px-3" style="font-size:0.75rem;font-weight:600;color:#64748b;letter-spacing:0.04em;border-bottom:1px solid #e2e8f0;">
                        <i class="bi bi-list-ul me-1"></i>RESULTADOS DEL FILTRO
                      </td>
                    </tr>
                  </template>

                  <!-- SECCIÓN: FILTRADOS (no marcados) -->
                  <tr v-if="!buscarReq && itemsMarcados.length === 0 && store.pendientes.length === 0">
                    <td colspan="6" class="text-center py-5 text-success">
                      <i class="bi bi-check-circle fs-4 d-block mb-2"></i>¡Todo entregado!
                    </td>
                  </tr>
                  <tr
                    v-for="item in itemsFiltradosNoMarcados"
                    :key="'filt-' + item.requerimiento_detalle_id"
                  >
                    <td>
                      <input type="checkbox" class="form-check-input"
                        v-model="seleccionados[item.requerimiento_detalle_id]"
                        @change="onCheck(item)" />
                    </td>
                    <td><span class="text-primary" style="font-size:0.8rem;">{{ item.codigo_req }}</span></td>
                    <td style="font-size:0.85rem;">{{ item.articulo }}</td>
                    <td class="text-muted" style="font-size:0.85rem;">{{ item.proveedor }}</td>
                    <td class="text-end text-danger fw-semibold">{{ item.faltante }}</td>
                    <td>
                      <input type="number" class="form-control form-control-sm"
                        v-model.number="cantidades[item.requerimiento_detalle_id]"
                        :min="0.01" :max="item.faltante" step="0.01"
                        :disabled="!seleccionados[item.requerimiento_detalle_id]" />
                    </td>
                  </tr>
                  <!-- Sin resultados del filtro -->
                  <tr v-if="buscarReq && itemsFiltradosNoMarcados.length === 0 && itemsMarcados.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted" style="font-size:0.85rem;">
                      <i class="bi bi-search d-block fs-4 mb-2"></i>Sin resultados para "{{ buscarReq }}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="mensajeError" class="alert alert-danger mt-3 py-2" style="font-size:0.85rem;">
              <i class="bi bi-exclamation-circle me-2"></i>{{ mensajeError }}
            </div>
            <div v-if="mensajeExito" class="alert alert-success mt-3 py-2" style="font-size:0.85rem;">
              <i class="bi bi-check-circle me-2"></i>{{ mensajeExito }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardar" :disabled="guardando">
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              {{ guardando ? 'Registrando...' : 'Registrar Ingreso' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== MODAL: DETALLE DE INGRESO ====== -->
    <div class="modal fade" id="modalDetalleIngreso" tabindex="-1" ref="modalDetalleRef">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h5 class="modal-title fw-semibold mb-0">
                <i class="bi bi-truck me-2 text-primary"></i>{{ ingresoSeleccionado?.codigo_ingreso }}
              </h5>
              <div class="d-flex gap-3 mt-1" style="font-size:0.8rem;color:#64748b;">
                <span><i class="bi bi-calendar3 me-1"></i>{{ ingresoSeleccionado?.fecha }}</span>
                <span v-if="ingresoSeleccionado?.viaje"><i class="bi bi-signpost-2 me-1"></i>Viaje: {{ ingresoSeleccionado?.viaje }}</span>
                <span v-if="ingresoSeleccionado?.vale"><i class="bi bi-receipt me-1"></i>Vale: {{ ingresoSeleccionado?.vale }}</span>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p v-if="ingresoSeleccionado?.observacion" class="alert alert-light py-2 mb-3" style="font-size:0.85rem;">
              <i class="bi bi-chat-left-text me-2"></i>{{ ingresoSeleccionado.observacion }}
            </p>

            <div v-if="store.cargandoDetalle" class="text-center py-4 text-muted">
              <span class="spinner-border spinner-border-sm me-2"></span>Cargando detalle...
            </div>
            <div v-else-if="store.detalleActual.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-inbox d-block fs-4 mb-2"></i>Sin detalle disponible
            </div>
            <div v-else class="table-responsive mp-card p-0 overflow-hidden">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Req.</th>
                    <th>Artículo</th>
                    <th>Proveedor</th>
                    <th class="text-end" style="color:#2563eb;">P. Prov</th>
                    <th class="text-end" style="color:#16a34a;">P. Mina</th>
                    <th class="text-end">Pedido</th>
                    <th class="text-end" title="Entregado en este viaje específico">En Este Viaje</th>
                    <th class="text-end" title="Lo que falta o sobra entregar en total">Faltante</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in store.detalleActual" :key="d.id" class="align-middle">
                    <td><span class="text-primary fw-medium" style="font-size:0.82rem;">{{ d.codigo_req }}</span></td>
                    <td style="font-size:0.85rem;">{{ d.articulo }}</td>
                    <td class="text-muted" style="font-size:0.85rem;">{{ d.proveedor }}</td>
                    <td class="text-end" style="color:#2563eb;">{{ Number(d.precio_proveedor).toFixed(2) }}</td>
                    <td class="text-end" style="color:#16a34a;">{{ Number(d.precio_mina).toFixed(2) }}</td>
                    <td class="text-end fw-medium">{{ d.pedido }}</td>
                    <td class="text-end fw-bold text-success">{{ Number(d.cantidad_entregada).toFixed(2) }}</td>
                    <td class="text-end fw-semibold">
                      <span v-if="(d.pedido - d.entregado_total) === 0" class="text-success fw-bold">
                        <i class="bi bi-check-lg"></i> 0.00
                      </span>
                      <span v-else-if="(d.pedido - d.entregado_total) < 0" class="badge bg-primary bg-opacity-10 text-primary border border-primary px-2 py-1">
                        +{{ Math.abs(d.pedido - d.entregado_total).toFixed(2) }} (Exceso)
                      </span>
                      <span v-else class="text-danger fw-bold">
                        {{ (d.pedido - d.entregado_total).toFixed(2) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <td colspan="6" class="text-end fw-semibold" style="font-size:0.85rem;">Total items en este viaje:</td>
                    <td class="text-end fw-bold text-success">
                      {{ store.detalleActual.reduce((s, d) => s + Number(d.cantidad_entregada), 0).toFixed(2) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </PageLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { Modal } from 'bootstrap';
import PageLayout from '../components/PageLayout.vue';
import SearchableSelect from '../components/SearchableSelect.vue';
import { useIngresosStore } from '../stores/ingresos.store';

const store = useIngresosStore();
const modalRef = ref(null);
const modalDetalleRef = ref(null);
let bsModal = null;
let bsModalDetalle = null;

// Refs de navegación por Enter en el modal de registro
const refFecha = ref(null);
const refViaje = ref(null);
const refVale = ref(null);
const refObservacion = ref(null);
const refBuscador = ref(null);

// Opciones de viaje para el SearchableSelect
const opcionesViaje = [
  ...Array.from({ length: 13 }, (_, i) => ({ id: `${i + 1}-VIAJE`, nombre: `${i + 1}-VIAJE` })),
  { id: 'DEPOSITO', nombre: 'DEPOSITO' }
];

// Estado de tabs
const tabActiva = ref('pendientes');

// Estado del modal de registro
const guardando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');
const seleccionados = reactive({});
const cantidades = reactive({});
const form = ref({
  fecha: new Date().toISOString().split('T')[0],
  viaje: '',
  vale: '',
  observacion: ''
});

// Estado del modal de detalle
const ingresoSeleccionado = ref(null);

// Buscador del modal de ingreso
const buscarReq = ref('');

// Items ya marcados (siempre se muestran arriba, sin importar el filtro)
const itemsMarcados = computed(() =>
  store.pendientes.filter(item => seleccionados[item.requerimiento_detalle_id])
);

// Items que coinciden con búsqueda pero NO están marcados
const itemsFiltradosNoMarcados = computed(() => {
  const q = buscarReq.value.trim().toLowerCase();
  const noMarcados = store.pendientes.filter(item => !seleccionados[item.requerimiento_detalle_id]);
  if (!q) return noMarcados;
  return noMarcados.filter(item =>
    item.codigo_req.toLowerCase().includes(q) ||
    item.articulo.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  await store.cargarPendientes();
  bsModal = new Modal(modalRef.value);
  bsModalDetalle = new Modal(modalDetalleRef.value);
});

// ── Tab historial ──
const cambiarAHistorial = async () => {
  tabActiva.value = 'historial';
  if (store.historial.length === 0) {
    await store.cargarHistorial();
  }
};

// ── Modal registrar ingreso ──
const abrirModalIngreso = () => {
  form.value = { fecha: new Date().toISOString().split('T')[0], viaje: '', vale: '', observacion: '' };
  Object.keys(seleccionados).forEach(k => delete seleccionados[k]);
  Object.keys(cantidades).forEach(k => delete cantidades[k]);
  mensajeError.value = '';
  mensajeExito.value = '';
  buscarReq.value = '';
  bsModal.show();
  // Enfocar el primer campo al abrir el modal
  nextTick(() => {
    setTimeout(() => refFecha.value?.focus(), 300);
  });
};

const onCheck = (item) => {
  if (seleccionados[item.requerimiento_detalle_id]) {
    cantidades[item.requerimiento_detalle_id] = '';
  } else {
    delete cantidades[item.requerimiento_detalle_id];
  }
};

const guardar = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';

  const detalles = Object.entries(seleccionados)
    .filter(([, val]) => val)
    .map(([id]) => ({
      requerimiento_detalle_id: parseInt(id),
      cantidad_entregada: cantidades[id]
    }))
    .filter(d => d.cantidad_entregada > 0);

  if (detalles.length === 0) {
    mensajeError.value = 'Selecciona al menos un artículo e ingresa una cantidad.';
    return;
  }

  guardando.value = true;
  const result = await store.crearIngreso({
    fecha: form.value.fecha,
    viaje: form.value.viaje,
    vale: form.value.vale,
    observacion: form.value.observacion,
    detalles
  });
  guardando.value = false;

  if (result.success) {
    mensajeExito.value = `Ingreso ${result.codigo} registrado. Los estados se han actualizado.`;
    setTimeout(() => bsModal.hide(), 1800);
  } else {
    mensajeError.value = result.mensaje;
  }
};

// ── Modal detalle de ingreso ──
const verDetalle = async (ing) => {
  ingresoSeleccionado.value = ing;
  bsModalDetalle.show();
  await store.cargarDetalleIngreso(ing.id);
};
</script>