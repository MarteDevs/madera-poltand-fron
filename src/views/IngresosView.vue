<template>
  <div class="contenedor">
    <header class="cabecera-pantalla">
      <h2>🚚 Registro de Ingreso de Madera</h2>
      <button class="btn-salir" @click="$router.push('/')">Volver al Inicio</button>
    </header>

    <div class="grid-ingresos">
      <div class="panel">
        <h3>1. Información del Camión / Vale</h3>
        <div class="grupo">
          <label>Fecha de Llegada:</label>
          <input type="date" v-model="viaje.fecha">
        </div>
        <div class="grupo">
          <label>N° de Viaje:</label>
          <input type="text" v-model="viaje.viaje" placeholder="Ej: VIAJE-007">
        </div>
        <div class="grupo">
          <label>N° de Vale:</label>
          <input type="text" v-model="viaje.vale" placeholder="Ej: 2845">
        </div>
        <div class="grupo">
          <label>Observaciones:</label>
          <textarea v-model="viaje.observacion"></textarea>
        </div>
      </div>

      <div class="panel">
        <h3>2. Seleccionar Pendientes</h3>
        <p class="instrucciones">Selecciona los artículos que vienen en este camión:</p>
        
        <div class="lista-pendientes">
          <div v-for="item in listaPendientes" :key="item.requerimiento_detalle_id" class="card-pendiente">
            <div class="info-ped">
              <strong>{{ item.codigo_req }}</strong> - {{ item.articulo }}<br>
              <small>Proveedor: {{ item.proveedor }} | Faltan: {{ item.faltante }}</small>
            </div>
            <div class="accion-ped">
              <input type="number" step="0.01" placeholder="Cant." v-model.number="item.cantidad_a_entregar">
              <button @click="agregarAlViaje(item)" :disabled="!item.cantidad_a_entregar">➕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-tabla">
      <h3>Madera cargada en este documento</h3>
      <table class="tabla-moderna">
        <thead>
          <tr>
            <th>Requerimiento</th>
            <th>Artículo</th>
            <th>Cant. Entregada</th>
            <th>Quitar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fila, index) in carritoIngresos" :key="index">
            <td>{{ fila.codigo_req }}</td>
            <td>{{ fila.articulo }}</td>
            <td><strong>{{ fila.cantidad_entregada }}</strong></td>
            <td><button class="btn-rojo" @click="quitarDelViaje(index)">❌</button></td>
          </tr>
        </tbody>
      </table>

      <div class="footer-guardar">
        <button class="btn-guardar" :disabled="carritoIngresos.length === 0 || guardando" @click="guardarIngreso">
          {{ guardando ? 'Procesando...' : '💾 Confirmar Ingreso de Madera' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';

const listaPendientes = ref([]);
const carritoIngresos = ref([]);
const guardando = ref(false);

const viaje = ref({
    fecha: new Date().toISOString().substr(0, 10),
    viaje: '',
    vale: '',
    observacion: ''
});

// Cargar lo que falta entregar desde el Backend
const cargarPendientes = async () => {
    try {
        const res = await api.get('/ingresos/pendientes');
        listaPendientes.ref = res.data.map(i => ({ ...i, cantidad_a_entregar: null }));
        listaPendientes.value = res.data;
    } catch (error) {
        console.error("Error al cargar pendientes");
    }
};

onMounted(cargarPendientes);

const agregarAlViaje = (item) => {
    if (item.cantidad_a_entregar > item.faltante) {
        alert("La cantidad no puede ser mayor al faltante.");
        return;
    }
    carritoIngresos.value.push({
        requerimiento_detalle_id: item.requerimiento_detalle_id,
        codigo_req: item.codigo_req,
        articulo: item.articulo,
        cantidad_entregada: item.cantidad_a_entregar
    });
    // Limpiar el input
    item.cantidad_a_entregar = null;
};

const quitarDelViaje = (index) => carritoIngresos.value.splice(index, 1);

const guardarIngreso = async () => {
    guardando.value = true;
    try {
        const payload = {
            ...viaje.value,
            detalles: carritoIngresos.value
        };
        await api.post('/ingresos', payload);
        alert("¡Ingreso registrado y stock actualizado!");
        
        // Resetear todo
        carritoIngresos.value = [];
        viaje.value.viaje = '';
        viaje.value.vale = '';
        cargarPendientes(); // Recargar la lista de lo que queda pendiente
    } catch (error) {
        alert("Error al guardar el ingreso.");
    } finally {
        guardando.value = false;
    }
};
</script>

<style scoped>
/* Estilos similares a RequerimientosView para mantener coherencia */
.grid-ingresos { display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; margin-top: 20px; }
.card-pendiente { 
    display: flex; justify-content: space-between; align-items: center; 
    padding: 10px; border: 1px solid #eee; border-radius: 5px; margin-bottom: 8px;
    background: #fdfdfd;
}
.accion-ped input { width: 70px; padding: 5px; margin-right: 5px; }
.accion-ped button { background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;}
.btn-rojo { background: none; border: none; cursor: pointer; font-size: 1.2em; }
.footer-guardar { text-align: right; margin-top: 20px; }
.btn-guardar { background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; cursor: pointer; }
.btn-guardar:disabled { background: #ccc; }
</style>