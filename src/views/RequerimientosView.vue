<template>
  <PageLayout title="Requerimientos">
    <template #actions>
      <button class="btn btn-outline-info btn-sm me-2" @click="exportarExcelDetallado" :disabled="store.historial.length === 0" title="Exportar con todos los ítems">
        <i class="bi bi-file-earmark-spreadsheet me-1"></i> Excel Detallado
      </button>
      <button class="btn btn-outline-success btn-sm me-2" @click="exportarExcel" :disabled="store.historial.length === 0" title="Exportar resumen general">
        <i class="bi bi-file-earmark-excel me-1"></i> Excel General
      </button>
      <button class="btn btn-primary btn-sm" @click="abrirModalCrear">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Requerimiento
      </button>
    </template>

    <!-- Tabla historial -->
    <div class="mp-card p-0 overflow-hidden">
      <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h6 class="mb-0 fw-semibold">Historial de Requerimientos</h6>
        <div class="d-flex align-items-center gap-3">
          <div class="d-flex align-items-center gap-2" style="font-size:0.8rem;">
            <span class="text-muted">Mostrar</span>
            <select v-model="porPagina" class="form-select form-select-sm" style="width:70px;">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <span class="text-muted" style="font-size:0.8rem;">
            {{ historialFiltrado.length }} de {{ store.historial.length }} registros
          </span>
        </div>
      </div>

      <!-- Barra de filtros -->
      <div class="req-filter-bar">
        <div class="d-flex align-items-center flex-wrap gap-2 w-100">
          
          <!-- Filtro de Estado -->
          <div class="filter-badge">
            <i class="bi bi-funnel-fill text-primary me-1"></i>
            <select v-model="filtroEstado" class="filter-select-clean" style="width: 200px;">
              <option value="TODOS">Todos los estados ({{ countTodos }})</option>
              <option value="PENDIENTE">Pendientes ({{ countPendiente }})</option>
              <option value="PARCIAL">Parciales ({{ countParcial }})</option>
              <option value="COMPLETADO">Completados ({{ countCompletado }})</option>
              <option value="CANCELADO">Cancelados ({{ countCancelado }})</option>
            </select>
          </div>

          <!-- Filtro de Mes -->
          <div class="filter-badge">
            <i class="bi bi-calendar3 text-success me-1"></i>
            <select v-model="filtroMes" class="filter-select-clean" style="width: 155px;">
              <option v-for="m in mesesOpciones" :key="m.value" :value="m.value">
                {{ m.label }}
              </option>
            </select>
          </div>

          <!-- Filtro de Año -->
          <div class="filter-badge">
            <i class="bi bi-calendar-event text-warning me-1"></i>
            <select v-model="filtroAnio" class="filter-select-clean" style="width: 120px;">
              <option value="">Todos los años</option>
              <option v-for="a in aniosDisponibles" :key="a" :value="a">
                {{ a }}
              </option>
            </select>
          </div>

          <!-- Filtro de Proveedor -->
          <div class="filter-badge">
            <i class="bi bi-building text-info me-1"></i>
            <select v-model="filtroProveedor" class="filter-select-clean" style="width: 170px;">
              <option value="">Todos los Proveedores</option>
              <option v-for="p in catStore.proveedores" :key="p.id" :value="p.nombre">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Filtro de Destino (tipo_pago) -->
          <div class="filter-badge">
            <i class="bi bi-pin-map-fill text-warning me-1"></i>
            <select v-model="filtroTipoPago" class="filter-select-clean" style="width: 140px;">
              <option value="">Todo Destino</option>
              <option value="DEPOSITO">Depósito</option>
              <option value="DIRECTO">Directo</option>
            </select>
          </div>

          <!-- Limpiar -->
          <button class="btn btn-sm btn-outline-secondary" style="border-radius: 20px; padding: 5px 15px;"
            @click="limpiarFiltros"
            :disabled="filtroEstado === 'TODOS' && !buscarTexto && !filtroMes && !filtroAnio && !filtroProveedor && !filtroTipoPago"
            title="Limpiar filtros">
            <i class="bi bi-trash3 me-1"></i> Limpiar
          </button>

          <!-- Buscador -->
          <div class="req-search-box ms-auto">
            <i class="bi bi-search"></i>
            <input 
              type="text" 
              v-model="buscarTexto" 
              placeholder="Buscar por código, mina, sup..." 
            />
          </div>
        </div>
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
            <tr v-else-if="historialPaginado.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-4 d-block mb-2"></i>Sin requerimientos
              </td>
            </tr>
            <tr v-for="r in historialPaginado" :key="r.id">
              <td><span class="fw-medium text-primary">{{ r.codigo_req }}</span></td>
              <td>{{ r.fecha }}</td>
              <td>{{ r.mina }}</td>
              <td>{{ r.supervisor }}</td>
              <td>
                <span :class="badgeClass(r.estado)">{{ r.estado }}</span>
                <span v-if="r.tipo_pago && r.tipo_pago !== 'PROVEEDOR'" class="ms-1" :class="r.tipo_pago === 'DEPOSITO' ? 'badge bg-warning text-dark' : 'badge bg-info text-white'" style="font-size:0.65rem;">
                  {{ r.tipo_pago }}
                </span>
              </td>
              <td class="text-end fw-semibold" style="color:#2563eb;">
                S/ {{ Number(r.total_proveedor).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-end fw-semibold" style="color:#16a34a;">
                S/ {{ Number(r.total_mina).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-content-center gap-1">
                  <button class="btn btn-sm btn-outline-info" @click="verDetalles(r)" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-primary" @click="prepararEdicion(r)" title="Editar requerimiento">
                    <i class="bi bi-pencil-square"></i>
                  </button>
                  <button 
                    v-if="r.estado === 'PENDIENTE'" 
                    class="btn btn-sm btn-outline-danger" 
                    @click="confirmarEliminar(r)" 
                    title="Eliminar requerimiento"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="historialFiltrado.length > 0" class="table-light">
            <tr>
              <td colspan="5" class="text-end fw-bold" style="font-size:0.82rem;">{{ tituloTotal }}</td>
              <td class="text-end fw-bold" style="color:#2563eb;">
                S/ {{ totalProveedorFiltrado.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="text-end fw-bold" style="color:#16a34a;">
                S/ {{ totalMinaFiltrado.toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-3 bg-light bg-opacity-50">
        <div class="text-muted" style="font-size:0.8rem;">
          Mostrando {{ historialFiltrado.length > 0 ? (paginaActual - 1) * porPagina + 1 : 0 }} - {{ Math.min(paginaActual * porPagina, historialFiltrado.length) }} de {{ historialFiltrado.length }}
        </div>
        <nav aria-label="Paginación de requerimientos">
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link" @click="paginaActual--" aria-label="Anterior">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li 
              v-for="p in paginasVisibles" 
              :key="p" 
              class="page-item" 
              :class="{ active: p === paginaActual, disabled: p === '...' }"
            >
              <button class="page-link" @click="p !== '...' && (paginaActual = p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link" @click="paginaActual++" aria-label="Siguiente">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ====== MODAL CREAR / EDITAR ====== -->
    <div class="modal fade" id="modalCrear" tabindex="-1" ref="modalCrearRef">
      <div class="modal-dialog modal-xl" style="max-width:1300px;">
        <div class="modal-content" style="height:88vh; display:flex; flex-direction:column;">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">
              {{ modoEdicion ? `Editando Requerimiento ${form.codigo_req}` : `Nuevo Requerimiento ${siguienteCodigoReq ? '— ' + siguienteCodigoReq : ''}` }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" style="overflow-y:auto; flex:1; display:flex; flex-direction:column;">
            <!-- Cabecera del requerimiento -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Fecha</label>
                <input type="date" class="form-control" v-model="form.fecha" required
                  ref="fechaRef"
                  @keydown.enter.prevent="() => minaRef?.focusOpen()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Mina</label>
                <SearchableSelect
                  ref="minaRef"
                  v-model="form.mina_id"
                  :options="catStore.minas"
                  placeholder="Selecciona una mina"
                  @navigate="() => proveedorRef?.focusOpen()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Proveedor</label>
                <SearchableSelect
                  ref="proveedorRef"
                  v-model="form.proveedor_id"
                  :options="catStore.proveedores"
                  placeholder="Selecciona un proveedor"
                  @navigate="() => supervisorRef?.focusOpen()"
                />
              </div>
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Supervisor</label>
                <SearchableSelect
                  ref="supervisorRef"
                  v-model="form.supervisor_id"
                  :options="catStore.supervisores"
                  placeholder="Sin asignar"
                  :allow-empty="true"
                  empty-label="Sin asignar"
                  @navigate="onSupervisorNavigate"
                />
              </div>
              <!-- Tipo de Pago -->
              <div class="col-md-12 mt-2">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Tipo de Pago</label>
                <div class="d-flex gap-2">
                  <button type="button" class="btn btn-sm" 
                    :class="form.tipo_pago === 'DEPOSITO' ? 'btn-warning' : 'btn-outline-secondary'"
                    @click="form.tipo_pago = form.tipo_pago === 'DEPOSITO' ? null : 'DEPOSITO'">
                    <i class="bi bi-box-seam me-1"></i> DEPÓSITO
                  </button>
                  <button type="button" class="btn btn-sm" 
                    :class="form.tipo_pago === 'DIRECTO' ? 'btn-info text-white' : 'btn-outline-secondary'"
                    @click="form.tipo_pago = form.tipo_pago === 'DIRECTO' ? null : 'DIRECTO'">
                    <i class="bi bi-cash-coin me-1"></i> DIRECTO
                  </button>
                  <span v-if="!form.tipo_pago" class="text-muted align-self-center" style="font-size:0.78rem;">Normal (Proveedor)</span>
                </div>
              </div>
            </div>

            <!-- Líneas de detalle -->
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h6 class="fw-semibold mb-0">Artículos del pedido</h6>
              <button class="btn btn-sm btn-outline-primary" ref="agregarBtnRef"
                @click="agregarYFocus"
                @keydown.enter.prevent="agregarYFocus"
              >
                <i class="bi bi-plus-lg me-1"></i> Agregar artículo
              </button>
            </div>

            <div class="d-flex flex-column gap-3 mb-3 px-1" style="flex:1; overflow-y:auto;">
              <div v-if="form.detalles.length === 0" class="text-center text-muted py-5 border rounded-3 bg-light">
                <i class="bi bi-cart-plus fs-3 d-block mb-2"></i>
                Agrega al menos un artículo al pedido
              </div>
              <div v-for="(linea, i) in form.detalles" :key="i" class="card shadow-sm border-0 req-item-card">
                <div class="card-body p-2">
                  <div class="row g-2 align-items-end">
                    <div class="col-md-5">
                      <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Artículo</label>
                      <SearchableSelect
                        :ref="el => { if(el) articuloRefs[i] = el }"
                        v-model="linea.articulo_id"
                        :options="catStore.articulos"
                        placeholder="Seleccionar artículo"
                        size="sm"
                        @update:modelValue="onArticuloChange(linea)"
                        @navigate="() => nextTick(() => cantidadRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Cantidad</label>
                      <input type="number" class="form-control form-control-sm fw-bold border-2 border-primary bg-light-subtle"
                        :ref="el => { if(el) cantidadRefs[i] = el }"
                        v-model.number="linea.cantidad" min="1"
                        style="font-size: 0.8rem; height: 28px;"
                        @keydown.enter.prevent="() => nextTick(() => precioProvRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">P. Prov (S/.)</label>
                      <input type="number" class="form-control form-control-sm"
                        :ref="el => { if(el) precioProvRefs[i] = el }"
                        v-model.number="linea.precio_proveedor" min="0" step="0.01"
                        style="color:#2563eb; font-weight:600; font-size: 0.8rem; height: 28px;"
                        @keydown.enter.prevent="() => nextTick(() => precioMinaRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">P. Mina (S/.)</label>
                      <input type="number" class="form-control form-control-sm"
                        :ref="el => { if(el) precioMinaRefs[i] = el }"
                        v-model.number="linea.precio_mina" min="0" step="0.01"
                        style="color:#16a34a; font-weight:600; font-size: 0.8rem; height: 28px;"
                        @keydown.enter.prevent="agregarYFocus"
                      />
                    </div>
                    <div class="col-md-1 text-end">
                      <button 
                        class="btn btn-outline-danger border-0" 
                        @click="quitarLinea(i)"
                        :disabled="linea.entregado > 0"
                        :title="linea.entregado > 0 ? 'No se puede quitar porque ya tiene entregas' : 'Quitar línea'"
                      >
                        <i class="bi bi-trash fs-5"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="mensajeError" class="alert alert-danger py-2" style="font-size:0.85rem;">
              <i class="bi bi-exclamation-circle me-2"></i>{{ mensajeError }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button class="btn btn-primary" @click="guardar" :disabled="guardando">
              <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
              {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Requerimiento' : 'Crear Requerimiento') }}
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
                    <td class="text-end">
                      <span v-if="Number(d.faltante) > 0" class="text-danger fw-medium">{{ d.faltante }}</span>
                      <span v-else-if="Number(d.faltante) < 0" class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                        +{{ Math.abs(Number(d.faltante)).toFixed(2) }} (Exceso)
                      </span>
                      <span v-else class="text-success fw-medium"><i class="bi bi-check2 me-1"></i>0.00</span>
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
          <div class="modal-footer d-flex justify-content-between">
            <button 
              v-if="reqSeleccionado?.estado === 'PENDIENTE' || reqSeleccionado?.estado === 'PARCIAL'" 
              class="btn btn-outline-success fw-medium" 
              @click="confirmarForzarCierre"
              title="Cancelar los saldos pendientes y dar por finalizado"
            >
              <i class="bi bi-check-circle me-1"></i> Dar por Completado
            </button>
            <div v-else></div>
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import { Modal } from 'bootstrap';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import PageLayout from '../components/PageLayout.vue';
import SearchableSelect from '../components/SearchableSelect.vue';
import { useRequerimientosStore } from '../stores/requerimientos.store';
import { useCatalogosStore } from '../stores/catalogos.store';
import { useToastStore } from '../stores/toast.store';

const store = useRequerimientosStore();
const catStore = useCatalogosStore();
const toastStore = useToastStore();

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
const siguienteCodigoReq = ref('');

// ---- Estado de Edición ----
const modoEdicion = ref(false);
const idRequerimientoEditar = ref(null);

// ---- Filtros y Búsqueda ----
const filtroEstado = ref('TODOS');
const buscarTexto = ref('');
const filtroMes = ref('');
const filtroAnio = ref('');
const filtroProveedor = ref('');
const filtroTipoPago = ref('');

const mesesOpciones = [
  { value: '', label: 'Todos los meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

const aniosDisponibles = computed(() => {
  const anios = store.historial
    .map(r => {
      if (!r.fecha) return null;
      return r.fecha.substring(0, 4);
    })
    .filter(Boolean);
  return [...new Set(anios)].sort((a, b) => b - a);
});

const countTodos = computed(() => {
  return store.historial.filter(r => {
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipo = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;
    return matchMes && matchAnio && matchProv && matchTipo;
  }).length;
});
const countPendiente = computed(() => {
  return store.historial.filter(r => {
    if (r.estado !== 'PENDIENTE') return false;
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipo = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;
    return matchMes && matchAnio && matchProv && matchTipo;
  }).length;
});
const countParcial = computed(() => {
  return store.historial.filter(r => {
    if (r.estado !== 'PARCIAL') return false;
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipo = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;
    return matchMes && matchAnio && matchProv && matchTipo;
  }).length;
});
const countCompletado = computed(() => {
  return store.historial.filter(r => {
    if (r.estado !== 'COMPLETADO') return false;
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipo = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;
    return matchMes && matchAnio && matchProv && matchTipo;
  }).length;
});
const countCancelado = computed(() => {
  return store.historial.filter(r => {
    if (r.estado !== 'CANCELADO') return false;
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipo = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;
    return matchMes && matchAnio && matchProv && matchTipo;
  }).length;
});

const limpiarFiltros = () => {
  filtroEstado.value = 'TODOS';
  buscarTexto.value = '';
  filtroMes.value = '';
  filtroAnio.value = '';
  filtroProveedor.value = '';
  filtroTipoPago.value = '';
};

const historialFiltrado = computed(() => {
  return store.historial.filter(r => {
    const matchEstado = filtroEstado.value === 'TODOS' || r.estado === filtroEstado.value;
    
    const text = buscarTexto.value.toLowerCase().trim();
    const matchTexto = !text || 
      r.codigo_req.toLowerCase().includes(text) ||
      r.mina.toLowerCase().includes(text) ||
      (r.supervisor && r.supervisor.toLowerCase().includes(text));
      
    const matchMes = !filtroMes.value || (r.fecha && r.fecha.substring(5, 7) === filtroMes.value);
    const matchAnio = !filtroAnio.value || (r.fecha && r.fecha.substring(0, 4) === filtroAnio.value);
    const matchProv = !filtroProveedor.value || (r.proveedores || '').includes(filtroProveedor.value);
    const matchTipoPago = !filtroTipoPago.value || r.tipo_pago === filtroTipoPago.value;

    return matchEstado && matchTexto && matchMes && matchAnio && matchProv && matchTipoPago;
  });
});

const totalProveedorFiltrado = computed(() => {
  return historialFiltrado.value.reduce((s, r) => s + (r.tipo_pago === 'DIRECTO' ? 0 : Number(r.total_proveedor || 0)), 0);
});

const totalMinaFiltrado = computed(() => {
  return historialFiltrado.value.reduce((s, r) => s + (r.tipo_pago === 'DIRECTO' ? 0 : Number(r.total_mina || 0)), 0);
});

const tituloTotal = computed(() => {
  return (filtroEstado.value !== 'TODOS' || buscarTexto.value.trim() !== '' || filtroMes.value !== '' || filtroAnio.value !== '' || filtroProveedor.value !== '') ? 'TOTAL FILTRADO:' : 'TOTAL GENERAL:';
});

// ---- Paginación ----
const paginaActual = ref(1);
const porPagina = ref(25);

const totalPaginas = computed(() => Math.ceil(historialFiltrado.value.length / porPagina.value));

const historialPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value;
  return historialFiltrado.value.slice(inicio, inicio + porPagina.value);
});

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
  if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
});

// Resetear página al cambiar filtros, historial o tamaño de página
watch([filtroEstado, buscarTexto, porPagina, filtroMes, filtroAnio, filtroProveedor], () => { paginaActual.value = 1; });
watch(() => store.historial.length, () => { paginaActual.value = 1; });

// ---- Refs para navegación por teclado ----
const fechaRef      = ref(null);
const minaRef       = ref(null);
const proveedorRef  = ref(null);
const supervisorRef = ref(null);
const agregarBtnRef = ref(null);
const articuloRefs   = [];
const cantidadRefs   = [];
const precioProvRefs = [];
const precioMinaRefs = [];

const formVacio = () => ({
  codigo_req: '',
  fecha: new Date().toISOString().split('T')[0],
  mina_id: '',
  proveedor_id: '',
  supervisor_id: '',
  tipo_pago: null,
  detalles: []
});
const form = ref(formVacio());

onMounted(async () => {
  await Promise.all([store.cargarHistorial(), catStore.cargarCatalogos()]);
  bsModalCrear = new Modal(modalCrearRef.value);
  bsModalDetalles = new Modal(modalDetallesRef.value);
});

const abrirModalCrear = async () => {
  modoEdicion.value = false;
  idRequerimientoEditar.value = null;
  form.value = formVacio();
  mensajeError.value = '';
  mensajeExito.value = '';
  siguienteCodigoReq.value = 'Calculando...';
  bsModalCrear.show();
  
  const codigo = await store.getSiguienteCodigo(form.value.fecha);
  siguienteCodigoReq.value = codigo || 'Desconocido (Guarde para generar)';
};

// Actualizar código en vivo si cambia la fecha mientras se crea uno nuevo
watch(() => form.value.fecha, async (nuevaFecha) => {
  if (!modoEdicion.value && nuevaFecha) {
    siguienteCodigoReq.value = 'Calculando...';
    const codigo = await store.getSiguienteCodigo(nuevaFecha);
    siguienteCodigoReq.value = codigo || 'Desconocido (Guarde para generar)';
  }
});

const prepararEdicion = async (r) => {
  modoEdicion.value = true;
  idRequerimientoEditar.value = r.id;
  mensajeError.value = '';
  mensajeExito.value = '';

  // Buscamos los datos actuales para llenar el form
  const rawDetalles = await store.getDetalles(r.id);
  
  // Encontramos el proveedor_id de la cabecera
  const minaObj = catStore.minas.find(m => m.nombre === r.mina);
  
  // Cargamos el form
  form.value = {
    codigo_req: r.codigo_req,
    fecha: r.fecha, 
    mina_id: minaObj?.id || '',
    proveedor_id: rawDetalles[0]?.proveedor_id || '',
    supervisor_id: catStore.supervisores.find(s => s.nombre === r.supervisor)?.id || '',
    tipo_pago: r.tipo_pago || null,
    detalles: rawDetalles.map(d => ({
      id: d.id,
      articulo_id: d.articulo_id,
      proveedor_id: d.proveedor_id,
      cantidad: Number(d.pedido),
      precio_proveedor: Number(d.precio_proveedor),
      precio_mina: Number(d.precio_mina),
      entregado: Number(d.entregado)
    }))
  };

  bsModalCrear.show();
};

const confirmarEliminar = async (r) => {
  const result = await Swal.fire({
    title: '<span class="fw-bold">¿Eliminar requerimiento?</span>',
    html: `Se eliminará el registro <strong>${r.codigo_req}</strong>.<br><br><span class="text-danger fw-bold">Esta acción no se puede deshacer.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '<i class="bi bi-trash me-1"></i> Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-4 border-0 shadow',
      confirmButton: 'rounded-pill px-4',
      cancelButton: 'rounded-pill px-4'
    }
  });

  if (result.isConfirmed) {
    toastStore.addToast('Eliminando...', 'info');
    const res = await store.eliminarRequerimiento(r.id);
    if (res.success) {
      toastStore.addToast(`Requerimiento ${r.codigo_req} eliminado`, 'success');
    } else {
      toastStore.addToast(res.mensaje, 'danger');
    }
  }
};

// ── Helpers comunes de estilo Excel ──
const XL_COLORS = {
  headerBg: 'FF1B3A5C',
  headerFont: 'FFFFFFFF',
  titleColor: 'FF0D47A1',
  subtitleFont: 'FF5A6A7E',
  altRow: 'FFF2F7FC',
  totalBg: 'FF2D3748',
  totalFont: 'FFFFFFFF',
  green: 'FF16A34A',
  blue: 'FF2563EB',
  red: 'FFDC2626',
  borderColor: 'FFD1D5DB'
};

const xlBorder = {
  top: { style: 'thin', color: { argb: XL_COLORS.borderColor } },
  left: { style: 'thin', color: { argb: XL_COLORS.borderColor } },
  bottom: { style: 'thin', color: { argb: XL_COLORS.borderColor } },
  right: { style: 'thin', color: { argb: XL_COLORS.borderColor } }
};

const xlTitleBlock = (ws, subtitulo, totalCols) => {
  const hoy = new Date();
  const fechaStr = `${String(hoy.getDate()).padStart(2,'0')}/${String(hoy.getMonth()+1).padStart(2,'0')}/${hoy.getFullYear()}`;
  const lastCol = String.fromCharCode(64 + Math.min(totalCols, 26));

  ws.mergeCells(`A1:${lastCol}1`);
  const r1 = ws.getCell('A1');
  r1.value = 'MADERA POLTAND';
  r1.font = { name: 'Calibri', size: 16, bold: true, color: { argb: XL_COLORS.titleColor } };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  ws.mergeCells(`A2:${lastCol}2`);
  const r2 = ws.getCell('A2');
  r2.value = subtitulo;
  r2.font = { name: 'Calibri', size: 12, color: { argb: XL_COLORS.subtitleFont } };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  ws.mergeCells(`A3:${lastCol}3`);
  const r3 = ws.getCell('A3');
  r3.value = `Generado: ${fechaStr}`;
  r3.font = { name: 'Calibri', size: 10, italic: true, color: { argb: XL_COLORS.subtitleFont } };
  r3.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(3).height = 18;

  ws.getRow(4).height = 8;
};

const xlStyleHeader = (ws, rowNum, totalCols) => {
  const row = ws.getRow(rowNum);
  row.height = 28;
  row.eachCell({ includeEmpty: true }, (cell, col) => {
    if (col <= totalCols) {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: XL_COLORS.headerFont } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_COLORS.headerBg } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = xlBorder;
    }
  });
};

const xlStyleDataRow = (ws, rowNum, totalCols, isAlt) => {
  const row = ws.getRow(rowNum);
  row.height = 20;
  row.eachCell({ includeEmpty: true }, (cell, col) => {
    if (col <= totalCols) {
      cell.font = cell.font || { name: 'Calibri', size: 10 };
      cell.border = xlBorder;
      if (isAlt) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_COLORS.altRow } };
      }
    }
  });
};

const xlFormatDate = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
};

// ── Excel General (Resumen por requerimiento) ──
const exportarExcel = async () => {
  if (store.historial.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Madera Poltand ERP';
  const ws = workbook.addWorksheet('Requerimientos');
  const COLS = 7;

  xlTitleBlock(ws, 'Requerimientos — Resumen General', COLS);

  const headers = ['Código', 'Fecha', 'Mina', 'Supervisor', 'Estado', 'Total Prov.', 'Total Mina'];
  const widths = [15, 12, 18, 20, 12, 14, 14];
  headers.forEach((h, i) => {
    ws.getColumn(i + 1).width = widths[i];
    ws.getCell(5, i + 1).value = h;
  });
  xlStyleHeader(ws, 5, COLS);

  const startRow = 6;
  store.historial.forEach((r, idx) => {
    const rowNum = startRow + idx;
    const row = ws.getRow(rowNum);
    row.getCell(1).value = r.codigo_req;
    row.getCell(2).value = r.fecha;
    row.getCell(3).value = r.mina;
    row.getCell(4).value = r.supervisor || 'Sin asignar';
    row.getCell(5).value = r.estado;
    row.getCell(6).value = Number(r.total_proveedor);
    row.getCell(7).value = Number(r.total_mina);

    // Formato S/
    row.getCell(6).numFmt = '"S/" #,##0.00';
    row.getCell(6).alignment = { horizontal: 'right' };
    row.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.blue } };
    row.getCell(7).numFmt = '"S/" #,##0.00';
    row.getCell(7).alignment = { horizontal: 'right' };
    row.getCell(7).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.green } };

    [1,2,3,4,5].forEach(c => { row.getCell(c).alignment = { horizontal: 'left', vertical: 'middle' }; });

    xlStyleDataRow(ws, rowNum, COLS, idx % 2 === 1);
  });

  // Fila de totales
  const totalRow = startRow + store.historial.length;
  const lastData = totalRow - 1;
  ws.mergeCells(`A${totalRow}:E${totalRow}`);
  ws.getCell(`A${totalRow}`).value = 'TOTALES';
  ws.getCell(`A${totalRow}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: XL_COLORS.totalFont } };
  ws.getCell(`A${totalRow}`).alignment = { horizontal: 'right', vertical: 'middle' };

  ws.getCell(`F${totalRow}`).value = { formula: `SUM(F${startRow}:F${lastData})` };
  ws.getCell(`G${totalRow}`).value = { formula: `SUM(G${startRow}:G${lastData})` };

  const tRow = ws.getRow(totalRow);
  tRow.height = 26;
  tRow.eachCell({ includeEmpty: true }, (cell, col) => {
    if (col <= COLS) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_COLORS.totalBg } };
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: XL_COLORS.totalFont } };
      cell.border = xlBorder;
      if (col >= 6) { cell.numFmt = '"S/" #,##0.00'; cell.alignment = { horizontal: 'right', vertical: 'middle' }; }
    }
  });

  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } };
  ws.views = [{ state: 'frozen', ySplit: 5 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `MP_Requerimientos_${xlFormatDate()}.xlsx`);
};

// ── Excel Detallado (con ítems de cada requerimiento) ──
const exportarExcelDetallado = async () => {
  if (store.historial.length === 0) return;

  const detalles = await store.getHistorialDetallado();
  if (!detalles || detalles.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Madera Poltand ERP';
  const ws = workbook.addWorksheet('Req. Detalle');
  const COLS = 14;

  xlTitleBlock(ws, 'Requerimientos — Detalle por Artículo', COLS);

  const headers = [
    'Código', 'Fecha', 'Mina', 'Supervisor', 'Estado',
    'Artículo', 'Proveedor', 'Pedido', 'Entregado', 'Faltante',
    'P.Prov', 'P.Mina', 'T.Prov', 'T.Mina'
  ];
  const widths = [13, 10, 14, 16, 10, 22, 14, 9, 9, 9, 9, 9, 10, 10];
  headers.forEach((h, i) => {
    ws.getColumn(i + 1).width = widths[i];
    ws.getCell(5, i + 1).value = h;
  });
  xlStyleHeader(ws, 5, COLS);

  const startRow = 6;
  const numCols = [8, 9, 10, 11, 12, 13, 14];

  detalles.forEach((r, idx) => {
    const rowNum = startRow + idx;
    const row = ws.getRow(rowNum);
    row.getCell(1).value = r.codigo_req;
    row.getCell(2).value = r.fecha;
    row.getCell(3).value = r.mina;
    row.getCell(4).value = r.supervisor || 'Sin asignar';
    row.getCell(5).value = r.estado;
    row.getCell(6).value = r.articulo;
    row.getCell(7).value = r.proveedor;
    row.getCell(8).value = Number(r.pedido);
    row.getCell(9).value = Number(r.entregado);
    row.getCell(10).value = Number(r.faltante);
    row.getCell(11).value = Number(r.precio_proveedor);
    row.getCell(12).value = Number(r.precio_mina);
    row.getCell(13).value = Number(r.total_proveedor_linea);
    row.getCell(14).value = Number(r.total_mina_linea);

    numCols.forEach(c => {
      row.getCell(c).numFmt = '#,##0.00';
      row.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
    });
    // S/ format para precios/totales
    [11, 12, 13, 14].forEach(c => { row.getCell(c).numFmt = '"S/" #,##0.00'; });

    for (let c = 1; c <= 7; c++) { row.getCell(c).alignment = { horizontal: 'left', vertical: 'middle' }; }

    // Color faltante
    const falt = Number(r.faltante);
    if (falt > 0) row.getCell(10).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.red } };
    else if (falt < 0) row.getCell(10).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.blue } };
    else row.getCell(10).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.green } };

    // Color totales
    row.getCell(13).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.blue } };
    row.getCell(14).font = { name: 'Calibri', size: 10, bold: true, color: { argb: XL_COLORS.green } };

    xlStyleDataRow(ws, rowNum, COLS, idx % 2 === 1);
  });

  // Fila de totales — solo T.Prov y T.Mina
  const totalRow = startRow + detalles.length;
  const lastData = totalRow - 1;
  ws.mergeCells(`A${totalRow}:L${totalRow}`);
  ws.getCell(`A${totalRow}`).value = 'TOTALES';
  ws.getCell(`A${totalRow}`).font = { name: 'Calibri', size: 11, bold: true, color: { argb: XL_COLORS.totalFont } };
  ws.getCell(`A${totalRow}`).alignment = { horizontal: 'right', vertical: 'middle' };

  ['M', 'N'].forEach(col => {
    ws.getCell(`${col}${totalRow}`).value = { formula: `SUM(${col}${startRow}:${col}${lastData})` };
  });

  const tRow = ws.getRow(totalRow);
  tRow.height = 26;
  tRow.eachCell({ includeEmpty: true }, (cell, col) => {
    if (col <= COLS) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_COLORS.totalBg } };
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: XL_COLORS.totalFont } };
      cell.border = xlBorder;
      if (col >= 13) { cell.numFmt = '"S/" #,##0.00'; cell.alignment = { horizontal: 'right', vertical: 'middle' }; }
    }
  });

  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
    margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } };
  ws.views = [{ state: 'frozen', ySplit: 5 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `MP_Req_Detallado_${xlFormatDate()}.xlsx`);
};

const agregarLinea = () => {
  form.value.detalles.push({
    articulo_id: '',
    cantidad: '', precio_proveedor: 0, precio_mina: 0, entregado: 0
  });
};

const agregarYFocus = () => {
  agregarLinea();
  const idx = form.value.detalles.length - 1;
  nextTick(() => articuloRefs[idx]?.focusOpen());
};

const onSupervisorNavigate = () => nextTick(() => agregarBtnRef.value?.focus());

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

  let result;
  if (modoEdicion.value) {
    result = await store.actualizarRequerimiento(idRequerimientoEditar.value, {
      fecha: form.value.fecha,
      mina_id: form.value.mina_id,
      supervisor_id: form.value.supervisor_id || null,
      tipo_pago: form.value.tipo_pago || null,
      detalles: detallesConProveedor
    });
  } else {
    result = await store.crearRequerimiento({
      fecha: form.value.fecha,
      mina_id: form.value.mina_id,
      supervisor_id: form.value.supervisor_id || null,
      tipo_pago: form.value.tipo_pago || null,
      detalles: detallesConProveedor
    });
  }

  guardando.value = false;
  if (result.success) {
    const msg = modoEdicion.value ? 'Requerimiento actualizado' : `Requerimiento ${result.codigo} creado`;
    toastStore.addToast(`${msg} exitosamente.`, 'success');
    setTimeout(() => bsModalCrear.hide(), 1000);
  } else {
    mensajeError.value = result.mensaje;
    toastStore.addToast(result.mensaje, 'danger');
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

const confirmarForzarCierre = async () => {
  const result = await Swal.fire({
    title: '<span class="fw-bold">¿Dar por Completado?</span>',
    html: `Los ítems que faltan entregar de <strong>${reqSeleccionado.value?.codigo_req}</strong> ya no aparecerán en pendientes de ingreso.<br><br><span class="text-success fw-bold">Esta acción cerrará el requerimiento de forma definitiva.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#16a34a',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '<i class="bi bi-check-circle me-1"></i> Sí, Completar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'rounded-4 border-0 shadow',
      confirmButton: 'rounded-pill px-4',
      cancelButton: 'rounded-pill px-4'
    }
  });

  if (result.isConfirmed) {
    toastStore.addToast('Forzando cierre...', 'info');
    const res = await store.forzarCierreRequerimiento(reqSeleccionado.value.id);
    if (res.success) {
      toastStore.addToast(`Requerimiento cerrado exitosamente`, 'success');
      if (reqSeleccionado.value) {
        reqSeleccionado.value.estado = 'COMPLETADO';
      }
      setTimeout(() => bsModalDetalles.hide(), 500);
    } else {
      toastStore.addToast(res.mensaje, 'danger');
    }
  }
};

const badgeClass = (estado) => {
  const map = { PENDIENTE: 'badge-pendiente', COMPLETADO: 'badge-completado', CANCELADO: 'badge-cancelado', PARCIAL: 'badge-parcial' };
  return map[estado] || 'badge-pendiente';
};
</script>

<style scoped>
/* Estilos para las tarjetas de ítems del requerimiento */
.req-item-card {
  transition: all 0.2s ease;
  border: 1px solid #dee2e6 !important;
  border-left: 5px solid #2563eb !important; /* Acento azul */
  background-color: #f8fbff !important;
  animation: slideInUp 0.3s ease-out;
}

.req-item-card:hover {
  border-color: #2563eb !important;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1) !important;
  transform: translateY(-2px);
}

.req-item-card .form-control:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.15) !important;
}

@keyframes slideInUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.badge-pendiente {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
}
.badge-completado {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #14532d;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
}
.badge-parcial {
  background: linear-gradient(135deg, #fff7ed, #fed7aa);
  color: #9a3412;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
}
.badge-cancelado {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #7f1d1d;
  font-weight: 600;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 0.72rem;
}
</style>