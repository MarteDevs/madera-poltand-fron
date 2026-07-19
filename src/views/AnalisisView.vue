<template>
  <PageLayout title="Business Analytics">
    <template #actions>
      <button @click="cargarDatos" class="btn btn-outline-primary rounded-pill px-4" :disabled="cargando">
        <i class="bi bi-arrow-clockwise me-1" :class="{'fa-spin': cargando}"></i> {{ cargando ? 'Cargando...' : 'Actualizar' }}
      </button>
    </template>

    <div class="px-2 py-2">
      <!-- Filtros -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Año</label>
            <select v-model="filtroAnio" class="form-select border-0 bg-light rounded-3">
              <option value="">TODOS</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Mes</label>
            <select v-model="filtroMes" class="form-select border-0 bg-light rounded-3">
              <option value="">TODOS</option>
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Mina</label>
            <select v-model="filtroMina" class="form-select border-0 bg-light rounded-3">
              <option value="TODAS">TODAS</option>
              <option v-for="m in catalogosStore.minas" :key="m.id" :value="m.nombre">{{ m.nombre }}</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label text-muted small fw-bold">Proveedor</label>
            <select v-model="filtroProveedor" class="form-select border-0 bg-light rounded-3">
              <option value="TODOS">TODOS</option>
              <option v-for="p in catalogosStore.proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Requerimientos -->
    <h4 class="fw-bold mt-5 mb-3 text-dark border-bottom pb-2">Análisis de Requerimientos</h4>
    
    <!-- KPIs Requerimientos -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-primary small fw-bold mb-2"><i class="bi bi-wallet2 me-1"></i> GASTO PROVEEDOR</div>
            <h3 class="fw-bold m-0" style="color: #1e40af;">S/ {{ formatearMonto(totalProveedor) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-success small fw-bold mb-2"><i class="bi bi-cash-stack me-1"></i> VALORIZACIÓN MINA</div>
            <h3 class="fw-bold m-0" style="color: #166534;">S/ {{ formatearMonto(totalMina) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-secondary small fw-bold mb-2"><i class="bi bi-file-earmark-text me-1"></i> TOTAL REQUERIMIENTOS</div>
            <h3 class="fw-bold m-0 text-dark">{{ totalRequerimientos }} <span class="fs-6 text-muted fw-normal">registros</span></h3>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Tendencia de Gastos vs Valorización</h5>
            <div style="height: 300px;">
              <Line v-if="datosTendencia.labels.length > 0" :data="datosTendencia" :options="opcionesLinea" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Este gráfico muestra la evolución en el tiempo de los gastos a proveedores frente al valor asignado a la mina. Ayuda a identificar picos de gastos por fechas.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Distribución por Mina</h5>
            <div style="height: 300px; display: flex; justify-content: center;">
              <Doughnut v-if="datosMinas.labels.length > 0" :data="datosMinas" :options="opcionesPie" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Muestra qué porcentaje del gasto total corresponde a cada mina, permitiendo ver rápidamente cuál consume más recursos del presupuesto.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Top 5 Proveedores (S/)</h5>
            <div style="height: 300px;">
              <Bar v-if="datosProveedores.labels.length > 0" :data="datosProveedores" :options="opcionesBarras" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Ranking de los 5 proveedores a los que más se les ha facturado. Es un indicador clave para posibles negociaciones por volumen de compra.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Estado de Requerimientos</h5>
            <div style="height: 300px; display: flex; justify-content: center;">
              <Pie v-if="datosEstados.labels.length > 0" :data="datosEstados" :options="opcionesPie" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Muestra cuántos requerimientos están pendientes, observados o atendidos. Sirve para medir la eficiencia del equipo operativo.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Ingresos -->
    <h4 class="fw-bold mt-5 mb-3 text-dark border-bottom pb-2">Análisis de Ingresos (Vales)</h4>
    
    <!-- KPIs Ingresos -->
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-fuchsia-700 small fw-bold mb-2" style="color: #a21caf;"><i class="bi bi-wallet2 me-1"></i> GASTO PROVEEDOR (INGRESOS)</div>
            <h3 class="fw-bold m-0" style="color: #701a75;">S/ {{ formatearMonto(totalProveedorIngresos) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-amber-700 small fw-bold mb-2" style="color: #b45309;"><i class="bi bi-cash-stack me-1"></i> VALORIZACIÓN MINA (INGRESOS)</div>
            <h3 class="fw-bold m-0" style="color: #78350f;">S/ {{ formatearMonto(totalMinaIngresos) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm rounded-4 h-100" style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
          <div class="card-body p-4 d-flex flex-column justify-content-center">
            <div class="text-secondary small fw-bold mb-2"><i class="bi bi-truck me-1"></i> TOTAL INGRESOS / VALES</div>
            <h3 class="fw-bold m-0 text-dark">{{ totalIngresos }} <span class="fs-6 text-muted fw-normal">registros</span></h3>
          </div>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Ingresos por Proveedor (Top 5)</h5>
            <div style="height: 300px;">
              <Bar v-if="datosProveedoresIngresos.labels.length > 0" :data="datosProveedoresIngresos" :options="opcionesBarras" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Indica qué proveedores han realizado una mayor cantidad de entregas físicas (ingresos) en el periodo filtrado.</p>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Ingresos por Mina</h5>
            <div style="height: 300px; display: flex; justify-content: center;">
              <Doughnut v-if="datosMinasIngresos.labels.length > 0" :data="datosMinasIngresos" :options="opcionesPie" />
              <div v-else class="text-center text-muted h-100 d-flex align-items-center justify-content-center">No hay datos</div>
            </div>
            <p class="text-muted small mt-3 mb-0">Muestra la proporción de entregas de materiales destinadas a cada mina en específico, basado en los vales de ingreso registrados.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  </PageLayout>
</template>

<script setup>
import PageLayout from '../components/PageLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { useRequerimientosStore } from '../stores/requerimientos.store'
import { useIngresosStore } from '../stores/ingresos.store'
import { useCatalogosStore } from '../stores/catalogos.store'

import { Bar, Doughnut, Line, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler)

const reqStore = useRequerimientosStore()
const ingStore = useIngresosStore()
const catalogosStore = useCatalogosStore()

const filtroAnio = ref(new Date().getFullYear().toString())
const filtroMes = ref((new Date().getMonth() + 1).toString().padStart(2, '0'))
const filtroMina = ref('TODAS')
const filtroProveedor = ref('TODOS')

const cargando = ref(false)

onMounted(async () => {
  await cargarDatos()
})

const cargarDatos = async () => {
  cargando.value = true
  await Promise.all([
    reqStore.cargarHistorial(),
    ingStore.cargarHistorial(),
    catalogosStore.cargarCatalogos()
  ])
  cargando.value = false
}

const reqsFiltrados = computed(() => {
  return reqStore.historial.filter(r => {
    let matchesAnio = filtroAnio.value ? r.fecha.startsWith(filtroAnio.value) : true
    let matchesMes = filtroMes.value ? r.fecha.substring(5, 7) === filtroMes.value : true
    let matchesMina = filtroMina.value !== 'TODAS' ? r.mina === filtroMina.value : true
    let matchesProv = filtroProveedor.value !== 'TODOS' ? (r.proveedores || '').includes(filtroProveedor.value) : true
    return matchesAnio && matchesMes && matchesMina && matchesProv
  })
})

const ingFiltrados = computed(() => {
  return ingStore.historial.filter(i => {
    let matchesAnio = filtroAnio.value ? i.fecha.startsWith(filtroAnio.value) : true
    let matchesMes = filtroMes.value ? i.fecha.substring(5, 7) === filtroMes.value : true
    let matchesMina = filtroMina.value !== 'TODAS' ? (i.minas || '').includes(filtroMina.value) : true
    let matchesProv = filtroProveedor.value !== 'TODOS' ? (i.proveedores || '').includes(filtroProveedor.value) : true
    return matchesAnio && matchesMes && matchesMina && matchesProv
  })
})

const totalProveedor = computed(() => reqsFiltrados.value.reduce((acc, r) => acc + Number(r.total_proveedor || 0), 0))
const totalMina = computed(() => reqsFiltrados.value.reduce((acc, r) => acc + Number(r.total_mina || 0), 0))
const totalRequerimientos = computed(() => reqsFiltrados.value.length)

const totalProveedorIngresos = computed(() => ingFiltrados.value.reduce((acc, i) => acc + Number(i.total_proveedor || 0), 0))
const totalMinaIngresos = computed(() => ingFiltrados.value.reduce((acc, i) => acc + Number(i.total_mina || 0), 0))
const totalIngresos = computed(() => ingFiltrados.value.length)

const formatearMonto = (monto) => {
  return Number(monto).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ======================= GRAFICOS ======================= //

// 1. Tendencia
const datosTendencia = computed(() => {
  const isDiario = filtroMes.value !== ''
  const grupos = {}
  
  reqsFiltrados.value.forEach(r => {
    if (!r.fecha) return
    const key = isDiario ? r.fecha.substring(8, 10) : r.fecha.substring(5, 7)
    if (!grupos[key]) grupos[key] = { prov: 0, mina: 0 }
    grupos[key].prov += Number(r.total_proveedor || 0)
    grupos[key].mina += Number(r.total_mina || 0)
  })
  
  const labels = Object.keys(grupos).sort()
  return {
    labels: labels.map(l => isDiario ? `Día ${l}` : `Mes ${l}`),
    datasets: [
      {
        label: 'Valorización Mina',
        data: labels.map(l => grupos[l].mina),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Gasto Proveedor',
        data: labels.map(l => grupos[l].prov),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }
})

// 2. Top 5 Proveedores
const datosProveedores = computed(() => {
  const provSum = {}
  reqsFiltrados.value.forEach(r => {
    const ps = (r.proveedores || 'S/N').split(',')
    const monto = Number(r.total_proveedor || 0) / (ps.length || 1)
    ps.forEach(p => {
      const pn = p.trim()
      if (!provSum[pn]) provSum[pn] = 0
      provSum[pn] += monto
    })
  })
  
  const sorted = Object.entries(provSum).sort((a,b) => b[1] - a[1]).slice(0, 5)
  return {
    labels: sorted.map(x => x[0].substring(0, 20) + (x[0].length > 20 ? '...' : '')),
    datasets: [{
      label: 'Gasto S/',
      data: sorted.map(x => x[1]),
      backgroundColor: '#f59e0b',
      borderRadius: 4
    }]
  }
})

// 3. Distribución por Mina
const datosMinas = computed(() => {
  const grupos = {}
  reqsFiltrados.value.forEach(r => {
    const m = r.mina || 'Desconocida'
    if (!grupos[m]) grupos[m] = 0
    grupos[m] += Number(r.total_mina || 0)
  })
  return {
    labels: Object.keys(grupos),
    datasets: [{
      data: Object.values(grupos),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
    }]
  }
})

// 4. Estados
const datosEstados = computed(() => {
  const grupos = {}
  reqsFiltrados.value.forEach(r => {
    const e = r.estado || 'Desconocido'
    if (!grupos[e]) grupos[e] = 0
    grupos[e]++
  })
  return {
    labels: Object.keys(grupos),
    datasets: [{
      data: Object.values(grupos),
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280', '#3b82f6']
    }]
  }
})

// === INGRESOS ===
const datosProveedoresIngresos = computed(() => {
  const grupos = {}
  ingFiltrados.value.forEach(i => {
    const ps = (i.proveedores || 'Desconocido').split(',')
    ps.forEach(p => {
      const pn = p.trim()
      if (!grupos[pn]) grupos[pn] = 0
      grupos[pn] += 1 / ps.length // Reparto de la entrega
    })
  })
  
  const sorted = Object.entries(grupos).sort((a,b) => b[1] - a[1]).slice(0, 5)
  return {
    labels: sorted.map(x => x[0].substring(0, 20) + (x[0].length > 20 ? '...' : '')),
    datasets: [{
      label: 'N° Entregas',
      data: sorted.map(x => x[1]),
      backgroundColor: '#8b5cf6',
      borderRadius: 4
    }]
  }
})

const datosMinasIngresos = computed(() => {
  const grupos = {}
  ingFiltrados.value.forEach(i => {
    const ms = (i.minas || 'Desconocida').split(',')
    ms.forEach(m => {
      const mn = m.trim()
      if (!grupos[mn]) grupos[mn] = 0
      grupos[mn] += 1 / ms.length // Reparto
    })
  })
  return {
    labels: Object.keys(grupos),
    datasets: [{
      data: Object.values(grupos),
      backgroundColor: ['#06b6d4', '#f43f5e', '#eab308', '#22c55e', '#8b5cf6', '#ec4899', '#3b82f6']
    }]
  }
})

// Opciones globales
const opcionesLinea = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true } }
}
const opcionesBarras = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // barras horizontales
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true } }
}
const opcionesPie = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } }
}
</script>
