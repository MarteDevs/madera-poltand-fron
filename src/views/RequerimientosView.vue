<template>
  <MainLayout pageTitle="Gestión de Requerimientos">
    <div class="page-container">
      
      <!-- Toolbox / Actions -->
      <div class="toolbox glass-panel">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input type="text" class="search-input" placeholder="Buscar por código, artículo o mina..." />
        </div>
        
        <div class="action-buttons">
          <button class="premium-btn secondary-btn">
            <span class="icon">📊</span> Exportar
          </button>
          <button class="premium-btn new-btn">
            <span class="icon">➕</span> Nuevo Requerimiento
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container glass-panel">
        <table class="premium-table">
          <thead>
            <tr>
              <th>CÓDIGO</th>
              <th>FECHA</th>
              <th>ARTÍCULO</th>
              <th>PROVEEDOR</th>
              <th>MINA</th>
              <th class="text-right">CANTIDAD</th>
              <th>ESTADO</th>
              <th class="text-center">FALTANTE</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <!-- Dummy Data for presentation, will be replaced by API call -->
            <tr v-for="item in requerimientos" :key="item.id">
              <td class="font-mono">{{ item.codigo }}</td>
              <td>{{ item.fecha }}</td>
              <td class="font-bold">{{ item.articulo }}</td>
              <td>{{ item.proveedor }}</td>
              <td>{{ item.mina }}</td>
              <td class="text-right">{{ item.cantidad }}</td>
              <td>
                <span class="status-pill" :class="item.estado.toLowerCase()">
                  {{ item.estado }}
                </span>
              </td>
              <td class="text-center">
                <span class="faltante-badge" v-if="item.faltante > 0">{{ item.faltante }}</span>
                <span class="faltante-ok" v-else>0</span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="action-btn edit" title="Editar">✏️</button>
                  <button class="action-btn delete" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '../components/MainLayout.vue';

// Aquí inyectarás el servicio axios real luego
const requerimientos = ref([
  { id: 1, codigo: 'REQ-4-001', fecha: '2026-04-01', articulo: 'POSTES 2.40 MTS X 8', proveedor: 'BAILON', mina: 'MINA NORTE', cantidad: 100, estado: 'PENDIENTE', faltante: 40 },
  { id: 2, codigo: 'REQ-4-002', fecha: '2026-04-02', articulo: 'CANTONERAS 3MTS', proveedor: 'BAILON', mina: 'MINA SUR', cantidad: 50, estado: 'COMPLETADO', faltante: 0 },
  { id: 3, codigo: 'REQ-4-003', fecha: '2026-04-03', articulo: 'MARCHABANTES 3MTS', proveedor: 'OTROS', mina: 'CENTRAL', cantidad: 200, estado: 'PENDIENTE', faltante: 200 },
]);

onMounted(async () => {
  // TODO: Hacer el GET con Axios al backend
  // try {
  //   const res = await axios.get('/api/requerimientos');
  //   requerimientos.value = res.data;
  // } catch (e) {
  //   console.error(e);
  // }
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 2rem;
}

/* Toolbox */
.toolbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius-md);
}

.search-box {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  width: 350px;
}

.search-input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  width: 100%;
  margin-left: 0.5rem;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.new-btn {
  width: auto;
  padding: 0.5rem 1rem;
}

.secondary-btn {
  width: auto;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--glass-border);
  box-shadow: none;
}

.secondary-btn:hover {
  background: rgba(255,255,255,0.05);
  transform: translateY(-1px);
}

/* Data Table */
.table-container {
  border-radius: var(--border-radius-md);
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.premium-table th, 
.premium-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  white-space: nowrap;
}

.premium-table th {
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  background: rgba(0,0,0,0.2);
}

.premium-table tbody tr {
  transition: background 0.2s;
}

.premium-table tbody tr:hover {
  background: rgba(255,255,255,0.03);
}

.font-mono {
  font-family: monospace;
  color: var(--primary-hover);
}

.font-bold {
  font-weight: 600;
  color: white;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

/* Pills and Badges */
.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.status-pill.completado {
  background: var(--success-glow);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-pill.pendiente {
  background: var(--error-glow);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.faltante-badge {
  background: #fca5a5;
  color: #7f1d1d;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.faltante-ok {
  color: var(--success);
  font-weight: bold;
}

/* Row Actions */
.row-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: rgba(255,255,255,0.1);
  transform: scale(1.1);
}
</style>