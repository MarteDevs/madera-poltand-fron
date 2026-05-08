<template>
  <div class="d-flex">
    <MainLayout ref="sidebarRef" />
    <div class="mp-main">
      <!-- Topbar -->
      <div class="mp-topbar d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <!-- Botón hamburguesa visible solo en mobile -->
          <button 
            class="btn btn-light d-lg-none p-2 lh-1 border" 
            @click="triggerSidebar"
            aria-label="Menu"
          >
            <i class="bi bi-list fs-4"></i>
          </button>

          <div>
            <h1 class="h6 fw-semibold mb-0 text-dark">{{ title }}</h1>
            <nav aria-label="breadcrumb" class="d-none d-sm-block" style="font-size:0.75rem;" v-if="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item text-muted">Madera Poltand</li>
                <li class="breadcrumb-item active">{{ title }}</li>
              </ol>
            </nav>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Content -->
      <div class="mp-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MainLayout from './MainLayout.vue';

const sidebarRef = ref(null);

defineProps({
  title: { type: String, default: 'Inicio' },
  breadcrumb: { type: Boolean, default: true }
});

const triggerSidebar = () => {
  // Emitimos un evento global que el MainLayout está escuchando
  window.dispatchEvent(new CustomEvent('toggle-sidebar'));
};
</script>
