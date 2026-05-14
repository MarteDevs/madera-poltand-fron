<template>
  <PageLayout title="Ingresos de Madera">
    <template #actions>
      <button class="btn btn-sm shadow-sm" :class="esMinimizado ? 'btn-warning fw-bold' : 'btn-primary'" @click="abrirModalIngreso">
        <i class="bi me-1" :class="esMinimizado ? 'bi-play-circle-fill' : 'bi-plus-lg'"></i>
        {{ esMinimizado ? 'Continuar Registro' : 'Registrar Ingreso' }}
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
        <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
          <h6 class="mb-0 fw-semibold">
            Items Pendientes de Entrega
            <span class="badge bg-warning text-dark ms-2">{{ store.pendientes.length }}</span>
          </h6>
          <button class="btn btn-sm btn-outline-success border-success text-success" @click="exportarPendientesExcel" :disabled="store.pendientes.length === 0 || store.cargando">
            <i class="bi bi-file-earmark-excel-fill me-1"></i> Exportar Excel
          </button>
        </div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Código Req.</th>
                <th>Mina</th>
                <th>Artículo</th>
                <th>Proveedor</th>
                <th class="text-end">Pedido</th>
                <th class="text-end">Entregado</th>
                <th class="text-end">Faltante</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.cargando">
                <td colspan="7" class="text-center py-5 text-muted">
                  <span class="spinner-border spinner-border-sm me-2"></span>Cargando...
                </td>
              </tr>
              <tr v-else-if="store.pendientes.length === 0">
                <td colspan="7" class="text-center py-5 text-success">
                  <i class="bi bi-check-circle fs-4 d-block mb-2"></i>¡Todo entregado! No hay faltantes.
                </td>
              </tr>
              <tr v-for="item in store.pendientes" :key="item.requerimiento_detalle_id">
                <td><span class="fw-medium text-primary">{{ item.codigo_req }}</span></td>
                <td><span class="badge bg-light text-dark border">{{ item.mina }}</span></td>
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
        <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h6 class="mb-0 fw-semibold">Ingresos Registrados</h6>
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
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-success border-success text-success" @click="exportarHistorialExcel" :disabled="store.historial.length === 0 || store.cargandoHistorial">
                <i class="bi bi-file-earmark-excel-fill me-1"></i> Exportar Excel
              </button>
              <button class="btn btn-sm btn-outline-secondary" @click="store.cargarHistorial()" :disabled="store.cargandoHistorial">
                <span v-if="store.cargandoHistorial" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-arrow-clockwise me-1"></i>
                Actualizar
              </button>
            </div>
          </div>
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
              <tr v-for="ing in historialPaginado" :key="ing.id">
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
          <div class="modal-header bg-light py-2">
            <h5 class="modal-title fw-semibold d-flex align-items-center">
              <i class="bi bi-truck me-2 text-primary"></i>
              Registrar Ingreso (Viaje)
            </h5>
            <div class="ms-auto d-flex align-items-center gap-1">
              <button type="button" class="btn btn-sm btn-link text-secondary text-decoration-none px-2" @click="minimizarModal" title="Minimizar">
                <i class="bi bi-dash-lg fs-5"></i>
              </button>
              <button type="button" class="btn-close" @click="descartarIngreso" title="Descartar y cerrar"></button>
            </div>
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

            <!-- Filtros y Controles -->
            <div class="d-flex flex-column gap-3 mb-3 bg-light p-3 rounded-3 border">
              <div class="d-flex align-items-center justify-content-between">
                <h6 class="fw-bold mb-0 text-secondary" style="font-size:0.85rem; letter-spacing:0.02em;">
                  FILTRAR ÍTEMS PENDIENTES
                </h6>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="switchSoloMarcados" v-model="mostrarSoloMarcados">
                  <label class="form-check-label fw-medium" for="switchSoloMarcados" style="font-size:0.8rem; cursor:pointer;">
                    Solo marcados ({{ itemsMarcados.length }})
                  </label>
                </div>
              </div>
              
              <div class="row g-2">
                <div class="col-md-3">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Buscar..." v-model="buscarReq" />
                  </div>
                </div>
                <div class="col-md-3">
                  <select v-model="filtroCodigoReq" class="form-select form-select-sm">
                    <option value="">— Todos los Req —</option>
                    <option v-for="req in uniqueRequerimientos" :key="req" :value="req">{{ req }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="filtroMina" class="form-select form-select-sm">
                    <option value="">— Todas las Minas —</option>
                    <option v-for="m in catalogStore.minas" :key="m.id" :value="m.nombre">{{ m.nombre }}</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select v-model="filtroProveedor" class="form-select form-select-sm">
                    <option value="">— Todos los Proveedores —</option>
                    <option v-for="p in catalogStore.proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tabla de ítems -->
            <!-- Tabla de ítems -->
            <div class="table-responsive mp-card p-0" style="max-height:380px; overflow-y: auto; border:1px solid #e2e8f0; border-radius: 8px;">
              <table class="table table-sm table-hover mb-0" style="font-size:0.85rem;">
                <thead class="table-dark sticky-top" style="z-index: 10;">
                  <tr>
                    <th style="width:40px;" class="ps-3"></th>
                    <th style="width:100px;">REQ.</th>
                    <th>MINA</th>
                    <th>ARTÍCULO</th>
                    <th>PROVEEDOR</th>
                    <th class="text-end" style="width:80px;">PEDIDO</th>
                    <th class="text-end" style="width:80px;">FALTANTE</th>
                    <th style="width:110px;" class="pe-3">VIAJE</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- SECCIÓN: MARCADOS (Siempre visibles) -->
                  <template v-if="itemsMarcados.length > 0">
                    <tr 
                      v-for="item in itemsMarcados" 
                      :key="'marked-' + item.requerimiento_detalle_id" 
                      class="table-primary table-opacity-10 align-middle"
                    >
                      <td class="text-center ps-3">
                        <input type="checkbox" class="form-check-input custom-checkbox"
                          v-model="seleccionados[item.requerimiento_detalle_id]"
                          @change="onCheck(item)" />
                      </td>
                      <td><span class="text-primary fw-bold">{{ item.codigo_req }}</span></td>
                      <td><span class="badge bg-white text-dark border">{{ item.mina }}</span></td>
                      <td class="fw-medium">{{ item.articulo }}</td>
                      <td class="text-muted">{{ item.proveedor }}</td>
                      <td class="text-end">{{ item.pedido }}</td>
                      <td class="text-end text-danger fw-bold">{{ item.faltante }}</td>
                      <td class="pe-3">
                        <input type="number" class="form-control form-control-sm text-center fw-bold"
                          v-model.number="cantidades[item.requerimiento_detalle_id]"
                          :min="0.01" :max="item.faltante" step="0.01" />
                      </td>
                    </tr>
                    <tr v-if="!mostrarSoloMarcados && itemsFiltradosNoMarcados.length > 0">
                      <td colspan="8" class="py-2 px-3 text-secondary bg-light border-bottom border-top" style="font-size:0.7rem; font-weight:700;">
                        <i class="bi bi-arrow-down-short"></i> RESTO DE ÍTEMS PENDIENTES
                      </td>
                    </tr>
                  </template>

                  <!-- SECCIÓN: FILTRADOS (no marcados) -->
                  <template v-if="!mostrarSoloMarcados">
                    <tr
                      v-for="item in itemsFiltradosPaginados"
                      :key="'filt-' + item.requerimiento_detalle_id"
                      class="align-middle"
                    >
                      <td class="text-center ps-3">
                        <input type="checkbox" class="form-check-input custom-checkbox"
                          v-model="seleccionados[item.requerimiento_detalle_id]"
                          @change="onCheck(item)" />
                      </td>
                      <td><span class="text-primary">{{ item.codigo_req }}</span></td>
                      <td><span class="badge bg-light text-dark border">{{ item.mina }}</span></td>
                      <td>{{ item.articulo }}</td>
                      <td class="text-muted">{{ item.proveedor }}</td>
                      <td class="text-end">{{ item.pedido }}</td>
                      <td class="text-end text-danger fw-semibold">{{ item.faltante }}</td>
                      <td class="pe-3">
                        <input type="number" class="form-control form-control-sm text-center"
                          v-model.number="cantidades[item.requerimiento_detalle_id]"
                          :min="0.01" :max="item.faltante" step="0.01"
                          :disabled="!seleccionados[item.requerimiento_detalle_id]" />
                      </td>
                    </tr>
                  </template>

                  <!-- Sin resultados -->
                  <tr v-if="!mostrarSoloMarcados && itemsFiltradosNoMarcados.length === 0 && itemsMarcados.length === 0">
                    <td colspan="8" class="text-center py-5 text-muted">
                      <i class="bi bi-inbox fs-2 d-block mb-2 opacity-25"></i>
                      No hay ítems pendientes que coincidan con los filtros.
                    </td>
                  </tr>
                  <tr v-if="mostrarSoloMarcados && itemsMarcados.length === 0">
                    <td colspan="8" class="text-center py-5 text-muted">
                      <i class="bi bi-check2-square fs-2 d-block mb-2 opacity-25"></i>
                      No has seleccionado ningún ítem todavía.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación Pendientes -->
            <div v-if="!mostrarSoloMarcados && totalPaginasPendientes > 1" class="d-flex align-items-center justify-content-between mt-3 mb-2 px-1">
              <span class="text-muted" style="font-size: 0.8rem;">
                Mostrando <strong>{{ itemsFiltradosPaginados.length }}</strong> de <strong>{{ itemsFiltradosNoMarcados.length }}</strong> resultados
              </span>
              <nav>
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" :class="{ disabled: paginaPendientesActual === 1 }">
                    <button class="page-link shadow-none" @click="paginaPendientesActual--" type="button">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  <li class="page-item active">
                    <span class="page-link px-3 fw-bold">{{ paginaPendientesActual }} / {{ totalPaginasPendientes }}</span>
                  </li>
                  <li class="page-item" :class="{ disabled: paginaPendientesActual === totalPaginasPendientes }">
                    <button class="page-link shadow-none" @click="paginaPendientesActual++" type="button">
                      <i class="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <!-- SECCIÓN: ARTÍCULOS EXTRA -->
            <div class="mt-5 border-top pt-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <h6 class="fw-bold mb-0 text-dark">Artículos No Solicitados (Extras)</h6>
                  <p class="text-muted mb-0" style="font-size:0.75rem;">Añade artículos que llegaron pero no estaban en el requerimiento.</p>
                </div>
                <button class="btn btn-sm btn-success px-3 shadow-sm" @click="agregarExtra" type="button">
                  <i class="bi bi-plus-lg me-1"></i> Agregar Extra
                </button>
              </div>

              <div v-if="extras.length === 0" class="mp-empty-extras text-center py-4 border rounded-3 bg-light opacity-75">
                <i class="bi bi-plus-circle fs-3 text-muted d-block mb-2"></i>
                <span class="text-muted small">No hay artículos extras añadidos en este ingreso.</span>
              </div>

              <div v-else class="d-flex flex-column gap-3">
                <div v-for="(ext, idx) in extras" :key="idx" class="card shadow-sm border-0 bg-white extra-card">
                  <div class="card-header bg-white py-2 d-flex align-items-center justify-content-between border-bottom-0">
                    <span class="badge rounded-pill bg-dark text-white fw-bold px-3">EXTRA #{{ idx + 1 }}</span>
                    <button class="btn btn-link text-danger p-0 border-0 shadow-none" @click="eliminarExtra(idx)" title="Eliminar extra">
                      <i class="bi bi-trash3-fill"></i>
                    </button>
                  </div>
                  <div class="card-body p-2">
                    <div class="row g-2">
                      <!-- Fila 1: Artículo y Proveedor -->
                      <div class="col-md-6">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Artículo</label>
                        <SearchableSelect
                          :ref="el => refArticuloExtra[idx] = el"
                          v-model="ext.articulo_id"
                          :options="catalogStore.articulos"
                          placeholder="Buscar artículo..."
                          @update:modelValue="onArticuloChange(idx)"
                          @navigate="refProveedorExtra[idx]?.focusOpen()"
                        />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Proveedor</label>
                        <SearchableSelect
                          :ref="el => refProveedorExtra[idx] = el"
                          v-model="ext.proveedor_id"
                          :options="catalogStore.proveedores"
                          placeholder="Seleccionar proveedor..."
                          @navigate="refMinaExtra[idx]?.focusOpen()"
                        />
                      </div>

                      <!-- Fila 2: Mina, Cantidad y Precios -->
                      <div class="col-md-4">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Mina / Destino</label>
                        <SearchableSelect
                          :ref="el => refMinaExtra[idx] = el"
                          v-model="ext.mina_id"
                          :options="catalogStore.minas"
                          placeholder="Destino final..."
                          @navigate="refCantidadExtra[idx]?.focus()"
                        />
                      </div>
                      <div class="col-md-2">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Cantidad</label>
                        <input
                          :ref="el => refCantidadExtra[idx] = el"
                          type="number"
                          v-model.number="ext.cantidad_entregada"
                          class="form-control form-control-sm text-center fw-bold border-2 border-primary bg-light-subtle"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          style="font-size: 0.8rem; height: 28px;"
                          @keydown.enter.prevent="agregarExtra()"
                        />
                      </div>
                      <div class="col-md-3">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Precio Prov.</label>
                        <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light text-muted border-end-0 fw-bold">S/.</span>
                          <input type="number" v-model.number="ext.precio_proveedor" class="form-control border-start-0 text-end fw-semibold" step="0.01" style="font-size: 0.8rem; height: 28px;" />
                        </div>
                      </div>
                      <div class="col-md-3">
                        <label class="form-label mb-0 fw-semibold text-secondary" style="font-size: 0.65rem;">Precio Mina</label>
                        <div class="input-group input-group-sm">
                          <span class="input-group-text bg-light text-muted border-end-0 fw-bold">S/.</span>
                          <input type="number" v-model.number="ext.precio_mina" class="form-control border-start-0 text-end fw-semibold" step="0.01" style="font-size: 0.8rem; height: 28px;" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <td>
                      <span v-if="d.es_extra" class="badge bg-warning text-dark" style="font-size:0.7rem;">EXTRA</span>
                      <span v-else class="text-primary fw-medium" style="font-size:0.82rem;">{{ d.codigo_req }}</span>
                    </td>
                    <td style="font-size:0.85rem;">{{ d.articulo }}</td>
                    <td class="text-muted" style="font-size:0.85rem;">{{ d.proveedor }}</td>
                    <td class="text-end" style="color:#2563eb;">{{ Number(d.precio_proveedor).toFixed(2) }}</td>
                    <td class="text-end" style="color:#16a34a;">{{ Number(d.precio_mina).toFixed(2) }}</td>
                    <td class="text-end fw-medium">{{ d.pedido || '—' }}</td>
                    <td class="text-end fw-bold text-success">{{ Number(d.cantidad_entregada).toFixed(2) }}</td>
                    <td class="text-end fw-semibold">
                      <template v-if="!d.es_extra">
                        <span v-if="(d.pedido - d.entregado_total) === 0" class="text-success fw-bold">
                          <i class="bi bi-check-lg"></i> 0.00
                        </span>
                        <span v-else-if="(d.pedido - d.entregado_total) < 0" class="badge bg-primary bg-opacity-10 text-primary border border-primary px-2 py-1">
                          +{{ Math.abs(d.pedido - d.entregado_total).toFixed(2) }} (Exceso)
                        </span>
                        <span v-else class="text-danger fw-bold">
                          {{ (d.pedido - d.entregado_total).toFixed(2) }}
                        </span>
                      </template>
                      <span v-else class="text-muted small">Extra</span>
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
    <!-- Barra flotante cuando está minimizado -->
    <div v-if="esMinimizado" class="minimizado-bar shadow-lg d-flex align-items-center p-2 rounded-pill bg-dark text-white border border-secondary">
      <div class="mx-3 small d-none d-md-block">
        <i class="bi bi-info-circle me-1 text-warning"></i>
        Tienes un registro en progreso...
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" @click="reanudarModal">
          <i class="bi bi-play-fill"></i> Reanudar
        </button>
        <button class="btn btn-sm btn-outline-light rounded-pill px-2 border-0" @click="descartarIngreso">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </PageLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { Modal } from 'bootstrap';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import PageLayout from '../components/PageLayout.vue';
import SearchableSelect from '../components/SearchableSelect.vue';
import { useIngresosStore } from '../stores/ingresos.store';
import { useToastStore } from '../stores/toast.store';
import { useCatalogosStore } from '../stores/catalogos.store';

const store = useIngresosStore();
const toastStore = useToastStore();
const catalogStore = useCatalogosStore();
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

// Refs para navegación en extras (arrays)
const refArticuloExtra = ref([]);
const refProveedorExtra = ref([]);
const refMinaExtra = ref([]);
const refCantidadExtra = ref([]);

// Opciones de viaje para el SearchableSelect
const opcionesViaje = [
  ...Array.from({ length: 13 }, (_, i) => ({ id: `${i + 1}-VIAJE`, nombre: `${i + 1}-VIAJE` })),
  { id: 'DEPOSITO', nombre: 'DEPOSITO' }
];

// Estado de tabs
const tabActiva = ref('pendientes');
const esMinimizado = ref(false);

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

// Artículos extras (que no están en requerimiento)
const extras = ref([]);

const agregarExtra = () => {
  extras.value.push({
    articulo_id: null,
    proveedor_id: null,
    mina_id: null,
    cantidad_entregada: 0,
    precio_proveedor: 0,
    precio_mina: 0
  });
  // Auto-enfocar el primer campo del nuevo extra
  nextTick(() => {
    const idx = extras.value.length - 1;
    setTimeout(() => refArticuloExtra.value[idx]?.focusOpen(), 100);
  });
};

const eliminarExtra = (index) => {
  extras.value.splice(index, 1);
};

const onArticuloChange = (idx) => {
  const extra = extras.value[idx];
  if (!extra.articulo_id) {
    extra.precio_proveedor = 0;
    extra.precio_mina = 0;
    return;
  }
  const art = catalogStore.articulos.find(a => a.id === extra.articulo_id);
  if (art) {
    extra.precio_proveedor = Number(art.precio_proveedor);
    extra.precio_mina = Number(art.precio_mina);
  }
};

// Estado del modal de detalle
const ingresoSeleccionado = ref(null);

// ---- Paginación Historial ----
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

watch(() => store.historial.length, () => { paginaActual.value = 1; });
watch(porPagina, () => { paginaActual.value = 1; });

// Buscador del modal de ingreso
const buscarReq = ref('');
const filtroMina = ref('');
const filtroProveedor = ref('');
const filtroCodigoReq = ref('');
const mostrarSoloMarcados = ref(false);

const uniqueRequerimientos = computed(() => {
  const codes = store.pendientes.map(p => p.codigo_req);
  return [...new Set(codes)].sort();
});

// ---- Paginación Items Pendientes (en modal) ----
const paginaPendientesActual = ref(1);
const porPaginaPendientes = 10;

// Items ya marcados (siempre se muestran arriba, sin importar el filtro)
const itemsMarcados = computed(() =>
  store.pendientes.filter(item => seleccionados[item.requerimiento_detalle_id])
);

// Items que coinciden con búsqueda pero NO están marcados
const itemsFiltradosNoMarcados = computed(() => {
  const q = buscarReq.value.trim().toLowerCase();
  const mina = filtroMina.value;
  const prov = filtroProveedor.value;

  const noMarcados = store.pendientes.filter(item => !seleccionados[item.requerimiento_detalle_id]);
  
  return noMarcados.filter(item => {
    const matchesSearch = !q || (item.codigo_req.toLowerCase().includes(q) || item.articulo.toLowerCase().includes(q));
    const matchesMina = !mina || item.mina === mina;
    const matchesProv = !prov || item.proveedor === prov;
    const matchesReq = !filtroCodigoReq.value || item.codigo_req === filtroCodigoReq.value;
    return matchesSearch && matchesMina && matchesProv && matchesReq;
  });
});

const totalPaginasPendientes = computed(() => Math.ceil(itemsFiltradosNoMarcados.value.length / porPaginaPendientes));

const itemsFiltradosPaginados = computed(() => {
  const inicio = (paginaPendientesActual.value - 1) * porPaginaPendientes;
  return itemsFiltradosNoMarcados.value.slice(inicio, inicio + porPaginaPendientes);
});

watch([buscarReq, filtroMina, filtroProveedor, filtroCodigoReq], () => {
  paginaPendientesActual.value = 1;
});

onMounted(async () => {
  await Promise.all([
    store.cargarPendientes(),
    catalogStore.cargarCatalogos()
  ]);
  bsModal = new Modal(modalRef.value);
  bsModalDetalle = new Modal(modalDetalleRef.value);
});

// ── Exportar Excel ──
const exportarPendientesExcel = async () => {
  if (store.pendientes.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Pendientes Entrega');

  worksheet.columns = [
    { header: 'Código Req.', key: 'codigo', width: 18 },
    { header: 'Mina', key: 'mina', width: 25 },
    { header: 'Artículo', key: 'articulo', width: 45 },
    { header: 'Proveedor', key: 'proveedor', width: 30 },
    { header: 'Pedido', key: 'pedido', width: 15 },
    { header: 'Entregado', key: 'entregado', width: 15 },
    { header: 'Faltante', key: 'faltante', width: 15 }
  ];

  // Estilo a la cabecera
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D6EFD' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  store.pendientes.forEach(item => {
    worksheet.addRow({
      codigo: item.codigo_req,
      mina: item.mina,
      articulo: item.articulo,
      proveedor: item.proveedor,
      pedido: Number(item.pedido),
      entregado: Number(item.entregado),
      faltante: Number(item.faltante)
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Pendientes_Entrega_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const exportarHistorialExcel = async () => {
  if (store.historial.length === 0) return;

  const response = await store.exportarHistorialDetallado();
  if (!response.success || !response.data || response.data.length === 0) {
      alert("No hay datos para exportar o ocurrió un error");
      return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Historial Detallado');

  worksheet.columns = [
    { header: 'Cód. Ingreso', key: 'codigo_ingreso', width: 22 },
    { header: 'Fecha', key: 'fecha_ingreso', width: 14 },
    { header: 'Viaje', key: 'viaje', width: 15 },
    { header: 'Vale', key: 'vale', width: 15 },
    { header: 'Observación', key: 'observacion', width: 25 },
    { header: 'Req.', key: 'codigo_req', width: 15 },
    { header: 'Mina', key: 'mina', width: 20 },
    { header: 'Artículo', key: 'articulo', width: 40 },
    { header: 'Proveedor', key: 'proveedor', width: 25 },
    { header: 'P. Prov', key: 'precio_proveedor', width: 12 },
    { header: 'P. Mina', key: 'precio_mina', width: 12 },
    { header: 'Pedido', key: 'pedido', width: 12 },
    { header: 'En Viaje', key: 'cantidad_entregada', width: 12 },
    { header: 'Faltante Act.', key: 'faltante', width: 14 }
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF198754' } }; // Verde para historial
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  response.data.forEach(item => {
    worksheet.addRow({
      codigo_ingreso: item.codigo_ingreso,
      fecha_ingreso: item.fecha_ingreso,
      viaje: item.viaje || '',
      vale: item.vale || '',
      observacion: item.observacion || '',
      codigo_req: item.codigo_req,
      mina: item.mina || '',
      articulo: item.articulo,
      proveedor: item.proveedor,
      precio_proveedor: Number(item.precio_proveedor || 0),
      precio_mina: Number(item.precio_mina || 0),
      pedido: Number(item.pedido || 0),
      cantidad_entregada: Number(item.cantidad_entregada || 0),
      faltante: Number(item.faltante || 0)
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Historial_Ingresos_Detallado_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// ── Tab historial ──
const cambiarAHistorial = async () => {
  tabActiva.value = 'historial';
  if (store.historial.length === 0) {
    await store.cargarHistorial();
  }
};

// ── Modal registrar ingreso ──
const limpiarFormulario = () => {
  form.value = { fecha: new Date().toISOString().split('T')[0], viaje: '', vale: '', observacion: '' };
  extras.value = []; // Reset extras
  buscarReq.value = '';
  filtroMina.value = '';
  filtroProveedor.value = '';
  filtroCodigoReq.value = '';
  mostrarSoloMarcados.value = false;
  paginaPendientesActual.value = 1;
  Object.keys(seleccionados).forEach(k => delete seleccionados[k]);
  Object.keys(cantidades).forEach(k => delete cantidades[k]);
  mensajeError.value = '';
  mensajeExito.value = '';
};

const minimizarModal = () => {
  esMinimizado.value = true;
  bsModal.hide();
};

const reanudarModal = () => {
  esMinimizado.value = false;
  bsModal.show();
};

const descartarIngreso = async () => {
  const result = await Swal.fire({
    title: '<span class="fw-bold">¿Descartar ingreso?</span>',
    html: 'Se perderán todos los datos seleccionados y los artículos extras agregados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: '<i class="bi bi-trash me-1"></i> Sí, descartar',
    cancelButtonText: 'No, volver',
    reverseButtons: true,
    heightAuto: false,
    customClass: {
      popup: 'rounded-4 border-0 shadow',
      confirmButton: 'rounded-pill px-4',
      cancelButton: 'rounded-pill px-4'
    }
  });

  if (result.isConfirmed) {
    limpiarFormulario();
    esMinimizado.value = false;
    if (bsModal) bsModal.hide();
  }
};

const abrirModalIngreso = () => {
  if (esMinimizado.value) {
    reanudarModal();
  } else {
    limpiarFormulario();
    bsModal.show();
    // Enfocar el primer campo al abrir el modal
    nextTick(() => {
      setTimeout(() => refFecha.value?.focus(), 300);
    });
  }
};

const onCheck = (item) => {
  if (seleccionados[item.requerimiento_detalle_id]) {
    // Si se acaba de marcar, inicializar cantidad con vacío para obligar al usuario a escribir
    if (cantidades[item.requerimiento_detalle_id] === undefined) {
      cantidades[item.requerimiento_detalle_id] = '';
    }
  } else {
    delete cantidades[item.requerimiento_detalle_id];
  }
};

const toggleSeleccion = (item) => {
  const id = item.requerimiento_detalle_id;
  seleccionados[id] = !seleccionados[id];
  onCheck(item);
};

const guardar = async () => {
  mensajeError.value = '';
  mensajeExito.value = '';

  const detallesNormales = Object.entries(seleccionados)
    .filter(([, val]) => val)
    .map(([id]) => ({
      requerimiento_detalle_id: parseInt(id),
      cantidad_entregada: cantidades[id]
    }))
    .filter(d => d.cantidad_entregada > 0);

  // Validar extras
  const extrasValidos = extras.value.filter(e => e.articulo_id && e.proveedor_id && e.mina_id && e.cantidad_entregada > 0);

  if (detallesNormales.length === 0 && extrasValidos.length === 0) {
    mensajeError.value = 'Selecciona al menos un artículo o agrega un extra válido.';
    return;
  }

  const payload = {
    fecha: form.value.fecha,
    viaje: form.value.viaje,
    vale: form.value.vale,
    observacion: form.value.observacion,
    detalles: [...detallesNormales, ...extrasValidos]
  };

  guardando.value = true;
  const result = await store.crearIngreso(payload);
  guardando.value = false;

  if (result.success) {
    toastStore.addToast(`Ingreso ${result.codigo} registrado exitosamente.`, 'success');
    esMinimizado.value = false;
    setTimeout(() => bsModal.hide(), 1000);
  } else {
    mensajeError.value = result.mensaje;
    toastStore.addToast(result.mensaje, 'danger');
  }
};

// ── Modal detalle de ingreso ──
const verDetalle = async (ing) => {
  ingresoSeleccionado.value = ing;
  bsModalDetalle.show();
  await store.cargarDetalleIngreso(ing.id);
};
</script>

<style scoped>
.extra-card {
  transition: all 0.2s ease;
  border: 1px solid #dee2e6 !important;
  border-left: 5px solid #0d6efd !important; /* Acento de color lateral */
  background-color: #f8fbff !important; /* Fondo sutil azulado */
}

.extra-card:hover {
  border-color: #0d6efd !important;
  box-shadow: 0 8px 24px rgba(13, 110, 253, 0.12) !important;
  transform: translateY(-3px);
}

.extra-card .card-header {
  border-bottom: 1px dashed #cbd5e1 !important;
  background-color: transparent !important;
}

.extra-card label {
  letter-spacing: 0.02em;
  color: #475569;
}

.extra-card .form-control:focus {
  background-color: #fff !important;
  border-color: #0d6efd !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15) !important;
}

.mp-empty-extras {
  border-style: dashed !important;
  border-width: 2px !important;
}

.table-opacity-10 {
  background-color: rgba(13, 110, 253, 0.03) !important;
}

.custom-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  border: 2px solid #0d6efd !important;
  background-color: #fff;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
}

.custom-checkbox:hover {
  transform: scale(1.15);
  border-color: #0a58ca !important;
}

/* Estilos Barra Minimizado */
.minimizado-bar {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1060;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>