<template>
  <div class="d-flex">
    <MainLayout />
    <div class="mp-main">
      <!-- Topbar -->
      <div class="mp-topbar d-flex align-items-center justify-content-between">
        <div>
          <h1 class="h6 fw-semibold mb-0 text-dark">{{ title }}</h1>
          <nav aria-label="breadcrumb" style="font-size:0.75rem;" v-if="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item text-muted">Madera Poltand</li>
              <li class="breadcrumb-item active">{{ title }}</li>
            </ol>
          </nav>
        </div>
        <slot name="actions"></slot>
      </div>

      <!-- Content -->
      <div class="mp-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import MainLayout from './MainLayout.vue';

defineProps({
  title: { type: String, default: 'Inicio' },
  breadcrumb: { type: Boolean, default: true }
});
</script>
