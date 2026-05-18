<template>
  <RouterView />
  <ToastNotification />

  <!-- Barra flotante: ingreso minimizado (visible en cualquier ruta) -->
  <div v-if="ingresosStore.borrador"
    class="minimizado-bar shadow-lg d-flex align-items-center p-2 rounded-pill bg-dark text-white border border-secondary"
    style="position: fixed; bottom: 2rem; right: 2rem; z-index: 1050;">
    <div class="mx-3 small d-none d-md-block">
      <i class="bi bi-info-circle me-1 text-warning"></i>
      Tienes un registro en progreso...
    </div>
    <div class="d-flex gap-2">
      <router-link to="/ingresos"
        @click="dispararReanudar"
        class="btn btn-sm btn-primary rounded-pill px-3 fw-bold text-decoration-none">
        <i class="bi bi-play-fill"></i> Reanudar
      </router-link>
      <button class="btn btn-sm btn-outline-light rounded-pill px-2 border-0"
        @click="descartarBorrador">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import ToastNotification from './components/ToastNotification.vue';
import { useIngresosStore } from './stores/ingresos.store';
import Swal from 'sweetalert2';

const ingresosStore = useIngresosStore();

const dispararReanudar = () => {
  ingresosStore.debeAbrirModal = true;
};

const descartarBorrador = async () => {
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
    ingresosStore.limpiarBorrador();
  }
};
</script>