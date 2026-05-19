<template>
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 2000">
        <TransitionGroup name="toast-slide">
            <div 
                v-for="toast in toastStore.toasts" 
                :key="toast.id"
                class="mp-toast d-flex align-items-center gap-2 mb-2"
                :class="`mp-toast--${toast.tipo}`"
                role="alert"
            >
                <div class="mp-toast-icon">
                    <i class="bi" :class="iconClass(toast.tipo)"></i>
                </div>
                <div class="mp-toast-body">{{ toast.mensaje }}</div>
                <button 
                    type="button" 
                    class="mp-toast-close" 
                    @click="toastStore.removeToast(toast.id)"
                >
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </TransitionGroup>
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
.mp-toast {
    min-width: 280px;
    max-width: 420px;
    padding: 14px 16px;
    border-radius: 14px;
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    border: 1px solid rgba(255,255,255,0.1);
}

.mp-toast--success {
    background: linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95));
    color: white;
}
.mp-toast--danger {
    background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95));
    color: white;
}
.mp-toast--warning {
    background: linear-gradient(135deg, rgba(245,158,11,0.95), rgba(217,119,6,0.95));
    color: white;
}
.mp-toast--info {
    background: linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95));
    color: white;
}

.mp-toast-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.mp-toast-body {
    flex: 1;
    font-size: 0.88rem;
    font-weight: 500;
}

.mp-toast-close {
    background: rgba(255,255,255,0.15);
    border: none;
    color: white;
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
}
.mp-toast-close:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1);
}

/* Transition */
.toast-slide-enter-active {
    animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.toast-slide-leave-active {
    animation: slideOutRight 0.3s ease both;
}

@keyframes slideInRight {
    from { opacity: 0; transform: translateX(80px) scale(0.9); }
    to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
}
</style>
