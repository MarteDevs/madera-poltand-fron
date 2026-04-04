<template>
  <div class="contenedor">
    <header class="cabecera-pantalla">
      <h2>📝 Registrar Nuevo Requerimiento</h2>
      <button class="btn-salir" @click="salir">Cerrar Sesión</button>
    </header>

    <div v-if="catalogos.cargando" class="cargando">Cargando listas...</div>

    <div v-else class="grid-formulario">
      <!-- PANEL IZQUIERDO: CABECERA DEL PEDIDO -->
      <div class="panel">
        <h3>1. Datos Generales</h3>
        
        <div class="grupo">
          <label>Fecha:</label>
          <input type="date" v-model="formCabecera.fecha" required>
        </div>

        <div class="grupo">
          <label>Mina (Cliente):</label>
          <select v-model="formCabecera.mina_id" required>
            <option value="" disabled>Seleccione una mina</option>
            <option v-for="m in catalogos.minas" :key="m.id" :value="m.id">
              {{ m.nombre }} - {{ m.razon_social }}
            </option>
          </select>
        </div>

        <div class="grupo">
          <label>Supervisor:</label>
          <select v-model="formCabecera.supervisor_id" required>
            <option value="" disabled>Seleccione un supervisor</option>
            <option v-for="s in catalogos.supervisores" :key="s.id" :value="s.id">
              {{ s.nombre }}
            </option>
          </select>
        </div>
      </div>

      <!-- PANEL DERECHO: AGREGAR ARTÍCULOS -->
      <div class="panel">
        <h3>2. Agregar Artículo</h3>
        
        <div class="grupo">
          <label>Artículo:</label>
          <select v-model="articuloTemp.articulo_id" @change="autocompletarPrecios">
            <option value="" disabled>Seleccione artículo</option>
            <option v-for="a in catalogos.articulos" :key="a.id" :value="a.id">
              {{ a.codigo }} - {{ a.nombre }}
            </option>
          </select>
        </div>

        <div class="grupo">
          <label>Proveedor:</label>
          <select v-model="articuloTemp.proveedor_id">
            <option value="" disabled>Seleccione proveedor</option>
            <option v-for="p in catalogos.proveedores" :key="p.id" :value="p.id">
              {{ p.nombre }}
            </option>
          </select>
        </div>

        <div class="grid-2-col">
          <div class="grupo">
            <label>Cantidad:</label>
            <input type="number" v-model="articuloTemp.cantidad" min="1">
          </div>
          <div class="grupo">
            <label>P. Proveedor:</label>
            <input type="number" step="0.01" v-model="articuloTemp.precio_proveedor" readonly style="background: #eee;">
          </div>
          <div class="grupo">
            <label>P. Mina:</label>
            <input type="number" step="0.01" v-model="articuloTemp.precio_mina" readonly style="background: #eee;">
          </div>
        </div>

        <button class="btn-agregar" @click="agregarAlCarrito">➕ Agregar a la lista</button>
      </div>
    </div>

    <!-- TABLA DE ELEMENTOS TEMPORALES (Tu antiguo ListBox) -->
    <div class="panel-tabla">
      <h3>Lista de Artículos a Pedir</h3>
      <table class="tabla-moderna">
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Proveedor</th>
            <th>Cantidad</th>
            <th>P. Prov</th>
            <th>P. Mina</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="carrito.length === 0">
            <td colspan="6" style="text-align: center; color: #7f8c8d;">No hay artículos agregados aún.</td>
          </tr>
          <tr v-for="(item, index) in carrito" :key="index">
            <td>{{ obtenerNombreArticulo(item.articulo_id) }}</td>
            <td>{{ obtenerNombreProveedor(item.proveedor_id) }}</td>
            <td>{{ item.cantidad }}</td>
            <td>S/ {{ item.precio_proveedor }}</td>
            <td>S/ {{ item.precio_mina }}</td>
            <td>
              <button class="btn-rojo" @click="quitarDelCarrito(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- BOTÓN PARA ENVIAR A LA BASE DE DATOS -->
      <div style="text-align: right; margin-top: 1rem;">
        <button class="btn-guardar" :disabled="carrito.length === 0 || guardando" @click="guardarRequerimiento">
          {{ guardando ? 'Guardando...' : '💾 Guardar Requerimiento' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useCatalogosStore } from '../stores/catalogos.store';
import { useRouter } from 'vue-router';
import api from '../api/axios';

const authStore = useAuthStore();
const catalogos = useCatalogosStore();
const router = useRouter();

// Variables de estado (Reactividad)
const guardando = ref(false);
const carrito = ref([]); // Reemplaza tu 'elementosTemporales' de VBA

// Formulario Cabecera
const formCabecera = ref({
    fecha: new Date().toISOString().substr(0, 10), // Fecha de hoy por defecto
    mina_id: '',
    supervisor_id: ''
});

// Formulario Artículo Temporal
const articuloTemp = ref({
    articulo_id: '',
    proveedor_id: '',
    cantidad: 1,
    precio_proveedor: 0,
    precio_mina: 0
});

// Al cargar la pantalla, vamos a traer las listas de la BD
onMounted(() => {
    catalogos.cargarCatalogos();
});

// -- LOGICA DEL FORMULARIO --

// Cuando elige un artículo, llenamos los precios automáticamente
const autocompletarPrecios = () => {
    const articuloSeleccionado = catalogos.articulos.find(a => a.id === articuloTemp.value.articulo_id);
    if (articuloSeleccionado) {
        articuloTemp.value.precio_proveedor = articuloSeleccionado.precio_proveedor;
        articuloTemp.value.precio_mina = articuloSeleccionado.precio_mina;
    }
};

const agregarAlCarrito = () => {
    if (!articuloTemp.value.articulo_id || !articuloTemp.value.proveedor_id || articuloTemp.value.cantidad <= 0) {
        alert("Complete todos los campos del artículo correctamente.");
        return;
    }

    // Copiamos el objeto y lo metemos al array
    carrito.value.push({ ...articuloTemp.value });

    // Limpiamos los campos para agregar otro
    articuloTemp.value.articulo_id = '';
    articuloTemp.value.cantidad = 1;
    articuloTemp.value.precio_proveedor = 0;
    articuloTemp.value.precio_mina = 0;
};

const quitarDelCarrito = (index) => {
    carrito.value.splice(index, 1);
};

// Funciones para pintar el texto en la tabla (ya que solo tenemos IDs)
const obtenerNombreArticulo = (id) => catalogos.articulos.find(a => a.id === id)?.nombre || '';
const obtenerNombreProveedor = (id) => catalogos.proveedores.find(p => p.id === id)?.nombre || '';

// -- GUARDAR EN NODE.JS --
const guardarRequerimiento = async () => {
    if (!formCabecera.value.mina_id || !formCabecera.value.supervisor_id) {
        alert("Falta seleccionar la Mina o el Supervisor en la cabecera.");
        return;
    }

    // Armamos el JSON exacto que espera nuestro Backend
    const payload = {
        fecha: formCabecera.value.fecha,
        mina_id: formCabecera.value.mina_id,
        supervisor_id: formCabecera.value.supervisor_id,
        detalles: carrito.value
    };

    guardando.value = true;
    try {
        const respuesta = await api.post('/requerimientos', payload);
        alert(`¡Éxito! ${respuesta.data.mensaje} | Código: ${respuesta.data.codigo_req}`);
        
        // Limpiamos todo tras guardar
        carrito.value = [];
        formCabecera.value.mina_id = '';
        formCabecera.value.supervisor_id = '';
    } catch (error) {
        console.error("Error guardando:", error);
        alert(error.response?.data?.mensaje || "Ocurrió un error al guardar.");
    } finally {
        guardando.value = false;
    }
};

const salir = () => {
    authStore.logout();
    router.push('/login');
};
</script>

<style scoped>
/* CSS Básico y Limpio */
.contenedor { max-width: 1000px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.cabecera-pantalla { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-salir { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.grid-formulario { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.panel { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.grupo { margin-bottom: 15px; display: flex; flex-direction: column; }
.grupo label { font-weight: bold; margin-bottom: 5px; font-size: 0.9em; color: #34495e; }
.grupo input, .grupo select { padding: 8px; border: 1px solid #bdc3c7; border-radius: 4px; }
.grid-2-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.btn-agregar { background: #3498db; color: white; border: none; padding: 10px; width: 100%; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-guardar { background: #27ae60; color: white; border: none; padding: 12px 20px; font-size: 1.1em; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-guardar:disabled { background: #95a5a6; cursor: not-allowed; }
.btn-rojo { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }

/* Tabla */
.panel-tabla { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
.tabla-moderna { width: 100%; border-collapse: collapse; margin-top: 10px; }
.tabla-moderna th, .tabla-moderna td { padding: 12px; border-bottom: 1px solid #ecf0f1; text-align: left; }
.tabla-moderna th { background: #f8f9fa; color: #2c3e50; }
</style>