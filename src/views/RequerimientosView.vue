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
          <span class="text-muted" style="font-size:0.8rem;">{{ store.historial.length }} registros</span>
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
              <td><span :class="badgeClass(r.estado)">{{ r.estado }}</span></td>
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

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="px-4 py-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-3 bg-light bg-opacity-50">
        <div class="text-muted" style="font-size:0.8rem;">
          Mostrando {{ (paginaActual - 1) * porPagina + 1 }} - {{ Math.min(paginaActual * porPagina, store.historial.length) }} de {{ store.historial.length }}
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
              {{ modoEdicion ? `Editando Requerimiento ${form.codigo_req}` : 'Nuevo Requerimiento' }}
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

            <div class="table-responsive mp-card p-0 overflow-auto mb-2" style="flex:1;">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th style="width:110px;">Cantidad</th>
                    <th style="width:120px; color:#2563eb;">P. Proveedor</th>
                    <th style="width:120px; color:#16a34a;">P. Mina</th>
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
                        :ref="el => { if(el) articuloRefs[i] = el }"
                        v-model="linea.articulo_id"
                        :options="catStore.articulos"
                        placeholder="Seleccionar artículo"
                        @update:modelValue="onArticuloChange(linea)"
                        @navigate="() => nextTick(() => cantidadRefs[i]?.focus())"
                      />
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm"
                        :ref="el => { if(el) cantidadRefs[i] = el }"
                        v-model.number="linea.cantidad" min="1"
                        @keydown.enter.prevent="() => nextTick(() => precioProvRefs[i]?.focus())"
                      />
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm"
                        :ref="el => { if(el) precioProvRefs[i] = el }"
                        v-model.number="linea.precio_proveedor" min="0" step="0.01"
                        style="color:#2563eb; font-weight:600;"
                        @keydown.enter.prevent="() => nextTick(() => precioMinaRefs[i]?.focus())"
                      />
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm"
                        :ref="el => { if(el) precioMinaRefs[i] = el }"
                        v-model.number="linea.precio_mina" min="0" step="0.01"
                        style="color:#16a34a; font-weight:600;"
                        @keydown.enter.prevent="agregarYFocus"
                      />
                    </td>
                    <td>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="quitarLinea(i)"
                        :disabled="linea.entregado > 0"
                        :title="linea.entregado > 0 ? 'No se puede quitar porque ya tiene entregas' : 'Quitar línea'"
                      >
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
          <div class="modal-footer">
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

// ---- Estado de Edición ----
const modoEdicion = ref(false);
const idRequerimientoEditar = ref(null);

// ---- Paginación ----
const paginaActual = ref(1);
const porPagina = ref(25);

const totalPaginas = computed(() => Math.ceil(store.historial.length / porPagina.value));

const historialPaginado = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value;
  return store.historial.slice(inicio, inicio + porPagina.value);
});

const paginasVisibles = computed(() => {
  const total = totalPaginas.value;
  const actual = paginaActual.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  
  if (actual <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (actual >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', actual - 1, actual, actual + 1, '...', total];
});

// Resetear página al cambiar historial o tamaño de página
watch(() => store.historial.length, () => { paginaActual.value = 1; });
watch(porPagina, () => { paginaActual.value = 1; });

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
  detalles: []
});
const form = ref(formVacio());

onMounted(async () => {
  await Promise.all([store.cargarHistorial(), catStore.cargarCatalogos()]);
  bsModalCrear = new Modal(modalCrearRef.value);
  bsModalDetalles = new Modal(modalDetallesRef.value);
});

const abrirModalCrear = () => {
  modoEdicion.value = false;
  idRequerimientoEditar.value = null;
  form.value = formVacio();
  mensajeError.value = '';
  mensajeExito.value = '';
  bsModalCrear.show();
};

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
  if (confirm(`¿Estás seguro de eliminar el requerimiento ${r.codigo_req}?`)) {
    const res = await store.eliminarRequerimiento(r.id);
    if (res.success) {
      toastStore.addToast(`Requerimiento ${r.codigo_req} eliminado`, 'success');
    } else {
      toastStore.addToast(res.mensaje, 'danger');
    }
  }
};

const exportarExcel = async () => {
  if (store.historial.length === 0) return;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Requerimientos');

  const headers = ['Código', 'Fecha', 'Mina', 'Supervisor', 'Estado', 'Total Proveedor', 'Total Mina'];
  const headerRow = worksheet.addRow(headers);
  
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F497D' }
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  });

  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 25;
  worksheet.getColumn(5).width = 15;
  worksheet.getColumn(6).width = 18;
  worksheet.getColumn(7).width = 18;

  store.historial.forEach(r => {
    const row = worksheet.addRow([
      r.codigo_req,
      r.fecha,
      r.mina,
      r.supervisor || 'Sin asignar',
      r.estado,
      Number(r.total_proveedor),
      Number(r.total_mina)
    ]);
    
    row.getCell(6).numFmt = '"S/" #,##0.00';
    row.getCell(6).font = { color: { argb: 'FF2563EB' }, bold: true };
    row.getCell(7).numFmt = '"S/" #,##0.00';
    row.getCell(7).font = { color: { argb: 'FF16A34A' }, bold: true };
    
    row.eachCell((cell) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `Requerimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const exportarExcelDetallado = async () => {
  if (store.historial.length === 0) return;
  
  const detalles = await store.getHistorialDetallado();
  if (!detalles || detalles.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Req. Detalle');

  const headers = [
    'Código', 'Fecha', 'Mina', 'Supervisor', 'Estado', 
    'Artículo', 'Proveedor', 'Pedido', 'Entregado', 'Faltante', 
    'P. Prov', 'P. Mina', 'T. Prov. Línea', 'T. Mina Línea'
  ];
  const headerRow = worksheet.addRow(headers);
  
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } }; 
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  });

  worksheet.getColumn(1).width = 15;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 20;
  worksheet.getColumn(4).width = 25;
  worksheet.getColumn(5).width = 15;
  worksheet.getColumn(6).width = 25;
  worksheet.getColumn(7).width = 20;
  worksheet.getColumn(8).width = 12;
  worksheet.getColumn(9).width = 12;
  worksheet.getColumn(10).width = 12;
  worksheet.getColumn(11).width = 15;
  worksheet.getColumn(12).width = 15;
  worksheet.getColumn(13).width = 18;
  worksheet.getColumn(14).width = 18;

  detalles.forEach(r => {
    const row = worksheet.addRow([
      r.codigo_req, r.fecha, r.mina, r.supervisor, r.estado,
      r.articulo, r.proveedor, 
      Number(r.pedido), Number(r.entregado), Number(r.faltante),
      Number(r.precio_proveedor), Number(r.precio_mina),
      Number(r.total_proveedor_linea), Number(r.total_mina_linea)
    ]);
    
    [11, 12, 13, 14].forEach(col => {
      row.getCell(col).numFmt = '"S/" #,##0.00';
    });
    
    row.getCell(10).font = { color: { argb: r.faltante > 0 ? 'FFDC2626' : (r.faltante < 0 ? 'FF2563EB' : 'FF16A34A') }, bold: true };
    row.getCell(13).font = { color: { argb: 'FF2563EB' }, bold: true };
    row.getCell(14).font = { color: { argb: 'FF16A34A' }, bold: true };
    
    row.eachCell((cell) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      cell.alignment = { vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `Req_Detallados_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      detalles: detallesConProveedor
    });
  } else {
    result = await store.crearRequerimiento({
      fecha: form.value.fecha,
      mina_id: form.value.mina_id,
      supervisor_id: form.value.supervisor_id || null,
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

const badgeClass = (estado) => {
  const map = { PENDIENTE: 'badge-pendiente', COMPLETADO: 'badge-completado', CANCELADO: 'badge-cancelado', PARCIAL: 'badge-parcial' };
  return map[estado] || 'badge-pendiente';
};
</script>