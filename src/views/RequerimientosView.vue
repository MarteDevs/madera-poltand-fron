<template>
  <PageLayout title="Requerimientos">
    <template #actions>
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

      <!-- Barra de filtros: todos los filtros visibles directamente -->
      <div class="req-filter-bar">
        <div class="d-flex align-items-center flex-wrap gap-2 w-100">

          <!-- Filtro de Estado -->
          <div class="filter-badge">
            <i class="bi bi-funnel-fill text-primary me-1"></i>
            <select v-model="filtroEstado" class="filter-select-clean" style="width: 190px;">
              <option value="TODOS">Todos los estados ({{ countTodos }})</option>
              <option value="PENDIENTE">Pendientes ({{ countPendiente }})</option>
              <option value="PARCIAL">Parciales ({{ countParcial }})</option>
              <option value="COMPLETADO">Completados ({{ countCompletado }})</option>
              <option value="CANCELADO">Cancelados ({{ countCancelado }})</option>
            </select>
          </div>

          <!-- Mes -->
          <div class="filter-badge">
            <i class="bi bi-calendar3 text-success me-1"></i>
            <select v-model="filtroMes" class="filter-select-clean" style="width: 140px;">
              <option v-for="m in mesesOpciones" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <!-- Año -->
          <div class="filter-badge">
            <i class="bi bi-calendar-event text-warning me-1"></i>
            <select v-model="filtroAnio" class="filter-select-clean" style="width: 130px;">
              <option value="">Todos los años</option>
              <option v-for="a in aniosDisponibles" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>

          <!-- Proveedor -->
          <div class="filter-badge">
            <i class="bi bi-building text-info me-1"></i>
            <select v-model="filtroProveedor" class="filter-select-clean" style="width: 170px;">
              <option value="">Todos los proveedores</option>
              <option v-for="p in catStore.proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
            </select>
          </div>

          <!-- Destino -->
          <div class="filter-badge">
            <i class="bi bi-pin-map-fill text-warning me-1"></i>
            <select v-model="filtroTipoPago" class="filter-select-clean" style="width: 140px;">
              <option value="">Todo destino</option>
              <option value="DEPOSITO">Depósito</option>
              <option value="DIRECTO">Directo</option>
            </select>
          </div>

          <!-- Limpiar filtros -->
          <button class="btn btn-sm btn-outline-secondary" style="border-radius: 20px; padding: 5px 15px;"
            @click="limpiarFiltros"
            :disabled="filtroEstado === 'TODOS' && !buscarTexto && !filtroMes && !filtroAnio && !filtroProveedor && !filtroTipoPago">
            <i class="bi bi-trash3 me-1"></i> Limpiar
          </button>

          <!-- Buscador -->
          <div class="req-search-box ms-auto">
            <i class="bi bi-search"></i>
            <input
              type="text"
              v-model="buscarTexto"
              placeholder="Buscar por código, mina o supervisor"
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
                S/ {{ fmtMoney(r.total_proveedor) }}
              </td>
              <td class="text-end fw-semibold" style="color:#16a34a;">
                S/ {{ fmtMoney(r.total_mina) }}
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
                S/ {{ fmtMoney(totalProveedorFiltrado) }}
              </td>
              <td class="text-end fw-bold" style="color:#16a34a;">
                S/ {{ fmtMoney(totalMinaFiltrado) }}
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
      <div class="modal-dialog modal-xl" style="max-width:1440px;">
        <div class="modal-content" style="height:88vh; display:flex; flex-direction:column;">
          <div class="modal-header">
            <h5 class="modal-title fw-semibold">
              {{ modoEdicion ? `Editando Requerimiento ${form.codigo_req}` : `Nuevo Requerimiento ${siguienteCodigoReq ? '— ' + siguienteCodigoReq : ''}` }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" style="overflow:hidden; flex:1; min-height:0; display:flex; flex-direction:column;">
            <!-- Cabecera del requerimiento -->
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-medium" style="font-size:0.85rem;">Fecha</label>
                <input type="date" class="form-control" :class="{ 'is-invalid': fechaInvalida }" v-model="form.fecha" required
                  ref="fechaRef"
                  @blur="fechaTouched = true"
                  @keydown.enter.prevent="() => minaRef?.focusOpen()"
                />
                <div v-if="fechaInvalida" class="text-danger mt-1" style="font-size:0.78rem;">
                  <i class="bi bi-exclamation-circle me-1"></i>Ingresa una fecha válida.
                </div>
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
              <h6 class="fw-semibold mb-0">
                Artículos del pedido
                <span v-if="form.detalles.length > 0" class="badge bg-primary bg-opacity-10 text-primary ms-2" style="font-size:0.72rem;">
                  {{ form.detalles.length }}
                </span>
              </h6>
              <button class="btn btn-sm btn-outline-primary" ref="agregarBtnRef"
                @click="agregarYFocus"
                @keydown.enter.prevent="agregarYFocus"
              >
                <i class="bi bi-plus-lg me-1"></i> Agregar artículo
              </button>
            </div>

            <div class="d-flex flex-column gap-3 mb-3 px-1" style="flex:1; min-height:0; overflow-y:auto;">
              <div v-if="form.detalles.length === 0" class="text-center text-muted py-5 border rounded-3 bg-light">
                <i class="bi bi-cart-plus fs-3 d-block mb-2"></i>
                Agrega al menos un artículo al pedido
              </div>
              <div v-for="(linea, i) in form.detalles" :key="i" class="card shadow-sm border-0 req-item-card">
                <div class="req-item-number">{{ i + 1 }}</div>
                <div class="card-body p-3 ps-4">
                  <div class="row g-3 align-items-end">
                    <div class="col-md-5">
                      <label class="form-label mb-1 fw-semibold text-secondary" style="font-size: 0.72rem;">Artículo</label>
                      <SearchableSelect
                        :ref="el => { if(el) articuloRefs[i] = el }"
                        v-model="linea.articulo_id"
                        :options="catStore.articulos"
                        placeholder="Seleccionar artículo"
                        @update:modelValue="onArticuloChange(linea)"
                        @navigate="() => nextTick(() => cantidadRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-1 fw-semibold text-secondary" style="font-size: 0.72rem;">Cantidad</label>
                      <input type="number" class="form-control fw-bold border-2 border-primary bg-light-subtle"
                        :ref="el => { if(el) cantidadRefs[i] = el }"
                        v-model.number="linea.cantidad" min="1"
                        style="font-size: 0.9rem; height: 38px;"
                        @keydown.enter.prevent="() => nextTick(() => precioProvRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-1 fw-semibold text-secondary" style="font-size: 0.72rem;">P. Prov (S/.)</label>
                      <input type="number" class="form-control"
                        :ref="el => { if(el) precioProvRefs[i] = el }"
                        v-model.number="linea.precio_proveedor" min="0" step="0.01"
                        style="color:#2563eb; font-weight:600; font-size: 0.9rem; height: 38px;"
                        @keydown.enter.prevent="() => nextTick(() => precioMinaRefs[i]?.focus())"
                      />
                    </div>
                    <div class="col-md-2">
                      <label class="form-label mb-1 fw-semibold text-secondary" style="font-size: 0.72rem;">P. Mina (S/.)</label>
                      <input type="number" class="form-control"
                        :ref="el => { if(el) precioMinaRefs[i] = el }"
                        v-model.number="linea.precio_mina" min="0" step="0.01"
                        style="color:#16a34a; font-weight:600; font-size: 0.9rem; height: 38px;"
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
                  <div class="req-item-subtotal">
                    Subtotal línea {{ i + 1 }}:
                    <span class="text-primary fw-semibold">S/ {{ fmtMoney((Number(linea.cantidad) || 0) * (Number(linea.precio_proveedor) || 0)) }}</span>
                    <span class="text-muted">proveedor</span>
                    <span class="req-item-subtotal-sep">·</span>
                    <span class="text-success fw-semibold">S/ {{ fmtMoney((Number(linea.cantidad) || 0) * (Number(linea.precio_mina) || 0)) }}</span>
                    <span class="text-muted">mina</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="mensajeError" class="alert alert-danger py-2" style="font-size:0.85rem;">
              <i class="bi bi-exclamation-circle me-2"></i>{{ mensajeError }}
            </div>
          </div>
          <!-- Footer: totales en vivo pegados junto a los botones de acción,
               siempre a la vista y fuera del área con scroll de la lista. -->
          <div class="modal-footer req-modal-footer">
            <div v-if="form.detalles.length > 0" class="req-totals-bar">
              <span class="req-totals-count">{{ form.detalles.length }} artículo{{ form.detalles.length === 1 ? '' : 's' }}</span>
              <span class="req-totals-item">
                <i class="bi bi-circle-fill" style="font-size:0.5rem; color:#60a5fa;"></i>
                Total Proveedor: <strong>S/ {{ fmtMoney(totalProveedorForm) }}</strong>
              </span>
              <span class="req-totals-item">
                <i class="bi bi-circle-fill" style="font-size:0.5rem; color:#4ade80;"></i>
                Total Mina: <strong>S/ {{ fmtMoney(totalMinaForm) }}</strong>
              </span>
            </div>
            <div class="req-modal-footer-actions">
              <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button class="btn btn-primary" @click="guardar" :disabled="guardando">
                <span v-if="guardando" class="spinner-border spinner-border-sm me-2"></span>
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar Requerimiento' : 'Crear Requerimiento') }}
              </button>
            </div>
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
                        +{{ fmtMoney(Math.abs(Number(d.faltante))) }} (Exceso)
                      </span>
                      <span v-else class="text-success fw-medium"><i class="bi bi-check2 me-1"></i>0</span>
                    </td>
                    <td class="text-end" style="color:#2563eb;">{{ fmtMoney(d.precio_proveedor) }}</td>
                    <td class="text-end fw-semibold" style="color:#2563eb;">
                      {{ fmtMoney(Number(d.pedido) * Number(d.precio_proveedor)) }}
                    </td>
                    <td class="text-end" style="color:#16a34a;">{{ fmtMoney(d.precio_mina) }}</td>
                    <td class="text-end fw-semibold" style="color:#16a34a;">
                      {{ fmtMoney(Number(d.pedido) * Number(d.precio_mina)) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="detallesActuales.length > 0" class="table-light">
                  <tr>
                    <td colspan="5" class="text-end fw-bold" style="font-size:0.82rem;">TOTALES:</td>
                    <td class="text-end"></td>
                    <td class="text-end fw-bold" style="color:#2563eb;">
                      S/ {{ fmtMoney(detallesActuales.reduce((s, d) => s + Number(d.pedido) * Number(d.precio_proveedor), 0)) }}
                    </td>
                    <td class="text-end"></td>
                    <td class="text-end fw-bold" style="color:#16a34a;">
                      S/ {{ fmtMoney(detallesActuales.reduce((s, d) => s + Number(d.pedido) * Number(d.precio_mina), 0)) }}
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

// Montos en soles: sin ceros decimales de relleno ("1,819.00" -> "1,819"),
// pero conserva decimales reales si los hay ("1,819.5").
const fmtMoney = (v) => Number(v || 0).toLocaleString('es-PE', { maximumFractionDigits: 2 });

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
const cargandoEdicion = ref(false);

// ---- Filtros y Búsqueda ----
const filtroEstado = ref('TODOS');
const buscarTexto = ref('');
const buscarTextoDebounced = ref('');
let timerBuscar = null;
watch(buscarTexto, (val) => {
  clearTimeout(timerBuscar);
  timerBuscar = setTimeout(() => {
    buscarTextoDebounced.value = val;
  }, 200);
});
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

// Optimización: Un solo recorrido para contar todos los estados
const conteosEstado = computed(() => {
  const counts = { TODOS: 0, PENDIENTE: 0, PARCIAL: 0, COMPLETADO: 0, CANCELADO: 0 };
  const mes = filtroMes.value;
  const anio = filtroAnio.value;
  const prov = filtroProveedor.value;
  const tipo = filtroTipoPago.value;

  for (let i = 0; i < store.historial.length; i++) {
    const r = store.historial[i];
    const matchMes = !mes || (r.fecha && r.fecha.substring(5, 7) === mes);
    const matchAnio = !anio || (r.fecha && r.fecha.substring(0, 4) === anio);
    const matchProv = !prov || (r.proveedores || '').includes(prov);
    const matchTipo = !tipo || r.tipo_pago === tipo;

    if (matchMes && matchAnio && matchProv && matchTipo) {
      counts.TODOS++;
      if (counts[r.estado] !== undefined) {
        counts[r.estado]++;
      }
    }
  }
  return counts;
});

const countTodos = computed(() => conteosEstado.value.TODOS);
const countPendiente = computed(() => conteosEstado.value.PENDIENTE);
const countParcial = computed(() => conteosEstado.value.PARCIAL);
const countCompletado = computed(() => conteosEstado.value.COMPLETADO);
const countCancelado = computed(() => conteosEstado.value.CANCELADO);

const limpiarFiltros = () => {
  filtroEstado.value = 'TODOS';
  buscarTexto.value = '';
  buscarTextoDebounced.value = '';
  filtroMes.value = '';
  filtroAnio.value = '';
  filtroProveedor.value = '';
  filtroTipoPago.value = '';
};

const historialFiltrado = computed(() => {
  return store.historial.filter(r => {
    const matchEstado = filtroEstado.value === 'TODOS' || r.estado === filtroEstado.value;
    
    const text = buscarTextoDebounced.value.toLowerCase().trim();
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
watch([filtroEstado, buscarTextoDebounced, porPagina, filtroMes, filtroAnio, filtroProveedor], () => { paginaActual.value = 1; });
watch(() => store.historial.length, () => { paginaActual.value = 1; });

// ---- Validación de fecha ----
const fechaTouched = ref(false);
const fechaInvalida = computed(() => fechaTouched.value && !form.value.fecha);

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

  // Al abrir el modal, enfocar siempre el campo Fecha primero
  modalCrearRef.value.addEventListener('shown.bs.modal', () => {
    fechaRef.value?.focus();
  });
});

const abrirModalCrear = async () => {
  modoEdicion.value = false;
  idRequerimientoEditar.value = null;
  cargandoEdicion.value = false;
  form.value = formVacio();
  mensajeError.value = '';
  mensajeExito.value = '';
  fechaTouched.value = false;
  siguienteCodigoReq.value = 'Calculando...';
  bsModalCrear.show();

  const codigo = await store.getSiguienteCodigo(form.value.fecha);
  siguienteCodigoReq.value = codigo || 'Desconocido (Guarde para generar)';
};

// Actualizar código en vivo si cambia la fecha mientras se crea uno nuevo (con debounce)
let timerFecha = null;
watch(() => form.value.fecha, (nuevaFecha) => {
  if (!modoEdicion.value && nuevaFecha) {
    siguienteCodigoReq.value = 'Calculando...';
    clearTimeout(timerFecha);
    timerFecha = setTimeout(async () => {
      const codigo = await store.getSiguienteCodigo(nuevaFecha);
      siguienteCodigoReq.value = codigo || 'Desconocido (Guarde para generar)';
    }, 300);
  }
});

// Recalcular precios de las líneas si el usuario cambia el proveedor seleccionado
watch(() => form.value.proveedor_id, (nuevoProvId) => {
  if (cargandoEdicion.value) return;
  if (form.value.detalles && form.value.detalles.length > 0) {
    form.value.detalles.forEach(linea => {
      if (linea.articulo_id) {
        const precios = catStore.getPrecio(linea.articulo_id, nuevoProvId);
        linea.precio_proveedor = precios.precio_proveedor;
        linea.precio_mina = precios.precio_mina;
      }
    });
  }
});

const prepararEdicion = async (r) => {
  modoEdicion.value = true;
  idRequerimientoEditar.value = r.id;
  mensajeError.value = '';
  mensajeExito.value = '';
  fechaTouched.value = false;
  cargandoEdicion.value = true;

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

  nextTick(() => {
    cargandoEdicion.value = false;
  });

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


// Totales en vivo del pedido que se está armando (para no perder la
// referencia general mientras se van agregando líneas)
const totalProveedorForm = computed(() =>
  form.value.detalles.reduce((s, d) => s + (Number(d.cantidad) || 0) * (Number(d.precio_proveedor) || 0), 0)
);
const totalMinaForm = computed(() =>
  form.value.detalles.reduce((s, d) => s + (Number(d.cantidad) || 0) * (Number(d.precio_mina) || 0), 0)
);

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
  const precios = catStore.getPrecio(linea.articulo_id, form.value.proveedor_id);
  linea.precio_proveedor = precios.precio_proveedor;
  linea.precio_mina = precios.precio_mina;
};

const guardar = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';
  if (!form.value.fecha || isNaN(new Date(form.value.fecha).getTime())) {
    fechaTouched.value = true;
    mensajeError.value = 'La fecha es obligatoria y debe ser válida. Verifica el día, mes y año.';
    fechaRef.value?.focus();
    return;
  }
  if (!form.value.mina_id) {
    mensajeError.value = 'Debes seleccionar una mina.';
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
  position: relative;
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

/* Numeración por línea: referencia rápida ("línea 3") cuando hay muchos
   artículos agregados y es fácil perder la cuenta. */
.req-item-number {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 24px; height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
  z-index: 1;
}

/* Subtotal por línea: referencia numérica inmediata sin tener que sumar a mano. */
.req-item-subtotal {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  font-size: 0.76rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.req-item-subtotal-sep {
  margin: 0 4px;
  color: #cbd5e1;
}

/* Footer del modal: totales en vivo a la izquierda, acciones a la derecha,
   siempre visibles y pegados (sin el hueco que quedaba cuando la barra
   vivía dentro del área con scroll). */
.req-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.req-modal-footer-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* Barra de totales: fondo oscuro de alto contraste para identificarla de un
   vistazo entre el resto de campos. */
.req-totals-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
  font-size: 0.82rem;
}
.req-totals-count {
  font-weight: 700;
  color: #fff;
  padding-right: 12px;
  border-right: 1px solid rgba(255,255,255,0.15);
}
.req-totals-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #e2e8f0;
}
.req-totals-item strong {
  color: #fff;
  font-size: 0.95rem;
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