<template>
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 2000">
        <div 
            v-for="toast in toastStore.toasts" 
            :key="toast.id"
            class="toast show align-items-center border-0 mb-2"
            :class="`text-bg-${toast.tipo}`"
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
        >
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi me-2" :class="iconClass(toast.tipo)"></i>
                    {{ toast.mensaje }}
                </div>
                <button 
                    type="button" 
                    class="btn-close btn-close-white me-2 m-auto" 
                    @click="toastStore.removeToast(toast.id)"
                    aria-label="Close"
                ></button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast.store';

const toastStore = useToastStore();

const iconClass = (tipo) => {
    switch (tipo) {
        case 'success': return 'bi-check-circle-fill';
        case 'danger':  return 'bi-exclamation-triangle-fill';
        case 'warning': return 'bi-exclamation-circle-fill';
        default:        return 'bi-info-circle-fill';
    }
};
</script>

<style scoped>
.toast {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    min-width: 250px;
}
</style>
