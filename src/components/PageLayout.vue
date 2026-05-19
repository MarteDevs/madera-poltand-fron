<template>
  <div class="d-flex">
    <MainLayout ref="sidebarRef" />
    <div class="mp-main">
      <!-- Topbar -->
      <div class="mp-topbar d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <!-- Botón hamburguesa visible solo en mobile -->
          <button 
            class="topbar-menu-btn d-lg-none" 
            @click="triggerSidebar"
            aria-label="Menu"
          >
            <i class="bi bi-list"></i>
          </button>

          <div>
            <h1 class="topbar-title">{{ title }}</h1>
            <nav aria-label="breadcrumb" class="d-none d-sm-block" v-if="breadcrumb">
              <ol class="breadcrumb mb-0" style="font-size:0.72rem;">
                <li class="breadcrumb-item text-muted">
                  <i class="bi bi-house-fill me-1"></i>Madera Poltand
                </li>
                <li class="breadcrumb-item active fw-medium">{{ title }}</li>
              </ol>
            </nav>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Content with animation -->
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

<style scoped>
.topbar-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.topbar-menu-btn {
  width: 40px; height: 40px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  color: #64748b;
  transition: all 0.2s ease;
}
.topbar-menu-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  transform: scale(1.05);
}
</style>
