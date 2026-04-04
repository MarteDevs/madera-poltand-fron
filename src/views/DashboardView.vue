<template>
  <div class="contenedor">
    <header class="cabecera-pantalla">
      <h2>📊 Panel Principal - Historial</h2>
      <div class="acciones-header">
        <button class="btn-nuevo" @click="$router.push('/requerimientos')">➕ Nuevo Pedido</button>
        <button class="btn-nuevo bg-verde" @click="$router.push('/ingresos')">🚚 Registrar Ingreso</button>
        <button class="btn-salir" @click="salir">Cerrar Sesión</button>
      </div>
    </header>

    <!-- BARRA DE FILTROS -->
    <div class="panel filtros">
      <input type="text" v-model="filtroBusqueda" placeholder="🔍 Buscar por código o mina..." class="input-buscar">
      
      <select v-model="filtroEstado" class="select-estado">
        <option value="">Todos los Estados</option>
        <option value="PENDIENTE">🔴 Pendientes</option>
        <option value="COMPLETADO">🟢 Completados</option>
      </select>
    </div>

    <!-- TABLA PRINCIPAL -->
    <div class="panel-tabla">
      <table class="tabla-moderna">
        <thead>
          <tr>
            <th>Código</th>
            <th>Fecha</th>
            <th>Mina</th>
            <th>Supervisor</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="req in requerimientosFiltrados" :key="req.id">
            <td><strong>{{ req.codigo_req }}</strong></td>
            <td>{{ req.fecha }}</td>
            <td>{{ req.mina }}</td>
            <td>{{ req.supervisor }}</td>
            <td>
              <span :class="['etiqueta', req.estado === 'COMPLETADO' ? 'estado-verde' : 'estado-rojo']">
                {{ req.estado }}
              </span>
            </td>
            <td>
              <button class="btn-ver" @click="verDetalles(req)">👁️ Ver Detalles</button>
            </td>
          </tr>
          <tr v-if="requerimientosFiltrados.length === 0">
            <td colspan="6" style="text-align: center; color: gray;">No se encontraron registros.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DE DETALLES (Se muestra solo si hay un requerimiento seleccionado) -->
    <div v-if="reqSeleccionado" class="modal-fondo" @click.self="cerrarModal">
      <div class="modal-contenido">
        <h3>Detalles de {{ reqSeleccionado.codigo_req }}</h3>
        <p><strong>Mina:</strong> {{ reqSeleccionado.mina }}</p>
        
        <table class="tabla-moderna" style="margin-top: 15px;">
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Proveedor</th>
              <th>Pedido</th>
              <th>Entregado</th>
              <th>Faltante</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="det in detallesActuales" :key="det.id">
              <td>{{ det.articulo }}</td>
              <td>{{ det.proveedor }}</td>
              <td>{{ det.pedido }}</td>
              <td>{{ det.entregado }}</td>
              <td>
                <strong :style="{ color: det.faltante > 0 ? 'red' : 'green' }">
                  {{ det.faltante }}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: right; margin-top: 20px;">
          <button class="btn-salir" @click="cerrarModal">Cerrar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const authStore = useAuthStore();
const router = useRouter();

const historial = ref([]);
const filtroBusqueda = ref('');
const filtroEstado = ref('');

// Para el modal
const reqSeleccionado = ref(null);
const detallesActuales = ref([]);

// Cargar la tabla al inicio
onMounted(async () => {
    try {
        const res = await api.get('/requerimientos/historial');
        historial.value = res.data;
    } catch (error) {
        console.error("Error cargando historial");
    }
});

// Computed Property para filtrar "en vivo" (¡Súper rápido!)
const requerimientosFiltrados = computed(() => {
    return historial.value.filter(req => {
        const coincideTexto = req.codigo_req.toLowerCase().includes(filtroBusqueda.value.toLowerCase()) || 
                              req.mina.toLowerCase().includes(filtroBusqueda.value.toLowerCase());
        const coincideEstado = filtroEstado.value === '' || req.estado === filtroEstado.value;
        return coincideTexto && coincideEstado;
    });
});

// Lógica del Modal
const verDetalles = async (req) => {
    reqSeleccionado.value = req;
    try {
        const res = await api.get(`/requerimientos/${req.id}/detalles`);
        detallesActuales.value = res.data;
    } catch (error) {
        alert("Error al cargar detalles");
    }
};

const cerrarModal = () => {
    reqSeleccionado.value = null;
    detallesActuales.value = [];
};

const salir = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<style scoped>
/* Contenedores base */
.contenedor { max-width: 1200px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.cabecera-pantalla { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.acciones-header { display: flex; gap: 10px; }

/* Botones */
.btn-salir { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.btn-nuevo { background: #3498db; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;}
.bg-verde { background: #27ae60; }
.btn-ver { background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }

/* Filtros */
.filtros { display: flex; gap: 15px; margin-bottom: 20px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.input-buscar { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
.select-estado { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }

/* Tabla */
.panel-tabla { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.tabla-moderna { width: 100%; border-collapse: collapse; }
.tabla-moderna th, .tabla-moderna td { padding: 12px; border-bottom: 1px solid #ecf0f1; text-align: left; }
.tabla-moderna th { background: #f8f9fa; color: #2c3e50; }

/* Etiquetas de Estado */
.etiqueta { padding: 4px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; color: white; }
.estado-verde { background: #2ecc71; }
.estado-rojo { background: #e74c3c; }

/* MODAL / POPUP */
.modal-fondo { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-contenido { background: white; padding: 25px; border-radius: 8px; width: 90%; max-width: 600px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
</style>