import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([]);

    /**
     * Añade una notificación toast
     * @param {string} mensaje 
     * @param {string} tipo - 'success', 'danger', 'warning', 'info'
     */
    const addToast = (mensaje, tipo = 'success') => {
        const id = Date.now();
        toasts.value.push({ id, mensaje, tipo });
        
        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    };

    const removeToast = (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    return {
        toasts,
        addToast,
        removeToast
    };
});
