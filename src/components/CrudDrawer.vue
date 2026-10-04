<template>
  <Teleport to="body">
    <div class="cd-scrim" :class="{ show: open }" @click="$emit('close')"></div>
    <aside class="cd-drawer" :class="{ show: open }" role="dialog" aria-modal="true">
      <div class="cd-head">
        <h3>{{ title }}</h3>
        <button class="cd-close" @click="$emit('close')" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="cd-body">
        <slot></slot>
      </div>
      <div class="cd-foot">
        <button class="cd-submit" :disabled="!canSubmit || submitting" @click="$emit('submit')">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ submitting ? 'Guardando...' : submitLabel }}
        </button>
        <div v-if="progressText" class="cd-progress">{{ progressText }}</div>
      </div>
    </aside>
  </Teleport>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  canSubmit: { type: Boolean, default: true },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Guardar' },
  progressText: { type: String, default: '' }
});
defineEmits(['close', 'submit']);
</script>

<style scoped>
/* Panel lateral en vez de modal centrado (Jakob's Law: patrón ya estándar en
   herramientas tipo Linear/Notion/Stripe) — la pantalla de fondo sigue visible. */
.cd-scrim {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(1px);
  z-index: var(--mp-z-overlay);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.cd-scrim.show { opacity: 1; pointer-events: auto; }

.cd-drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(400px, 92vw);
  background: var(--mp-card-bg);
  border-left: 1px solid var(--mp-border);
  z-index: calc(var(--mp-z-overlay) + 1);
  display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.3, 0.9, 0.4, 1);
  box-shadow: -14px 0 40px -18px rgba(0,0,0,0.35);
}
.cd-drawer.show { transform: translateX(0); }

.cd-head {
  padding: 20px 22px;
  border-bottom: 1px solid var(--mp-border-light);
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}
.cd-head h3 {
  margin: 0; font-family: 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--mp-text);
}
.cd-close {
  width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent;
  color: var(--mp-text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
}
.cd-close:hover { background: var(--mp-border-light); color: var(--mp-text); }

.cd-body { padding: 22px; flex: 1; overflow-y: auto; }

.cd-foot {
  padding: 16px 22px; border-top: 1px solid var(--mp-border-light);
}
.cd-submit {
  width: 100%; padding: 11px; border: none; border-radius: var(--mp-radius-sm);
  background: linear-gradient(135deg, var(--mp-accent), var(--mp-accent-hover));
  color: white; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  display: flex; align-items: center; justify-content: center;
}
.cd-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.cd-submit:not(:disabled):active { transform: scale(0.98); }
.cd-progress { text-align: center; font-size: 0.76rem; color: var(--mp-text-muted); margin-top: 8px; }

@media (prefers-reduced-motion: reduce) {
  .cd-scrim, .cd-drawer { transition: none; }
}
</style>
