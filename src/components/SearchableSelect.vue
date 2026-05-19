<template>
  <div class="searchable-select-wrapper" ref="wrapperRef">
    <!-- Campo visible -->
    <div
      class="ss-trigger"
      :class="{ 'ss-open': open, 'is-invalid': invalid }"
      @click="toggle"
    >
      <span :class="modelValue ? 'ss-value' : 'ss-placeholder'">
        {{ selectedLabel || placeholder }}
      </span>
      <i class="bi ss-chevron" :class="open ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
    </div>

    <!-- Dropdown -->
    <Transition name="ss-drop">
      <div v-if="open" class="ss-dropdown">
        <!-- Input de búsqueda -->
        <div class="ss-search">
          <i class="bi bi-search ss-search-icon"></i>
          <input
            ref="searchRef"
            type="text"
            class="ss-search-input"
            v-model="query"
            :placeholder="`Buscar ${placeholder.toLowerCase()}...`"
            @keydown.esc="close"
            @keydown.enter.prevent="selectFirst"
            autocomplete="off"
          />
        </div>

        <!-- Lista de opciones -->
        <ul class="ss-list">
          <li v-if="allowEmpty" @click="select(null, emptyLabel)" class="ss-option" :class="{ active: modelValue === null || modelValue === '' }">
            <span class="text-muted fst-italic" style="font-size:0.85rem;">{{ emptyLabel }}</span>
          </li>
          <li
            v-for="opt in filtered"
            :key="opt[valueKey]"
            class="ss-option"
            :class="{ active: opt[valueKey] === modelValue }"
            @click="select(opt[valueKey], opt[labelKey])"
          >
            <span v-if="opt[valueKey] === modelValue" class="ss-check"><i class="bi bi-check2"></i></span>
            {{ opt[labelKey] }}
          </li>
          <li v-if="filtered.length === 0" class="ss-empty">
            <i class="bi bi-search me-2"></i>Sin resultados
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { default: null },
  options:    { type: Array,  default: () => [] },
  valueKey:   { type: String, default: 'id' },
  labelKey:   { type: String, default: 'nombre' },
  placeholder:{ type: String, default: 'Seleccionar' },
  allowEmpty: { type: Boolean, default: false },
  emptyLabel: { type: String, default: 'Sin asignar' },
  invalid:    { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'navigate']);

const open      = ref(false);
const query     = ref('');
const wrapperRef = ref(null);
const searchRef  = ref(null);

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o[props.valueKey] === props.modelValue);
  return opt ? opt[props.labelKey] : (props.allowEmpty && !props.modelValue ? props.emptyLabel : '');
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.options;
  return props.options.filter(o => String(o[props.labelKey]).toLowerCase().includes(q));
});

const toggle = () => { open.value ? close() : openDropdown(); };

const openDropdown = () => {
  open.value = true;
  query.value = '';
  nextTick(() => searchRef.value?.focus());
};

const close = () => { open.value = false; query.value = ''; };

const select = (val, _label) => {
  emit('update:modelValue', val ?? '');
  close();
  nextTick(() => emit('navigate'));
};

const selectFirst = () => {
  if (filtered.value.length > 0) {
    select(filtered.value[0][props.valueKey]);
  }
};

// Cerrar al hacer clic fuera
const onOutsideClick = (e) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) close();
};
onMounted(() => document.addEventListener('mousedown', onOutsideClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick));

// Cerrar si el v-model cambia desde fuera
watch(() => props.modelValue, () => { if (open.value) close(); });

// Exponer para navegación por teclado desde el padre
defineExpose({ focusOpen: openDropdown });
</script>

<style scoped>
.searchable-select-wrapper { position: relative; }

.ss-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  padding: 6px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.ss-trigger:hover { border-color: #cbd5e1; }
.ss-trigger.ss-open {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
}
.ss-trigger.is-invalid { border-color: #ef4444; }

.ss-value {
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.ss-placeholder {
  font-size: 0.9rem;
  color: #94a3b8;
}
.ss-chevron {
  font-size: 0.65rem;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 8px;
  transition: transform 0.25s ease;
}
.ss-open .ss-chevron { transform: rotate(180deg); }

/* Dropdown */
.ss-dropdown {
  position: absolute;
  z-index: 1055;
  top: calc(100% + 6px);
  left: 0; right: 0;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Search */
.ss-search {
  flex-shrink: 0;
  padding: 10px 12px 8px;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}
.ss-search-icon {
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.8rem;
}
.ss-search-input {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 7px 12px 7px 32px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s ease;
}
.ss-search-input:focus {
  border-color: #3b82f6;
}

/* List */
.ss-list {
  overflow-y: auto;
  flex: 1;
  padding: 4px 0;
  margin: 0;
  list-style: none;
}

.ss-option {
  padding: 8px 14px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ss-option:hover { background: rgba(59,130,246,0.05); }
.ss-option.active {
  background: rgba(59,130,246,0.08);
  color: #2563eb;
  font-weight: 600;
}

.ss-check {
  color: #3b82f6;
  font-size: 1rem;
}

.ss-empty {
  padding: 16px 14px;
  color: #94a3b8;
  font-size: 0.82rem;
  text-align: center;
  font-style: italic;
}

/* Transition */
.ss-drop-enter-active {
  animation: ssDropIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.ss-drop-leave-active {
  animation: ssDropOut 0.15s ease both;
}

@keyframes ssDropIn {
  from { opacity: 0; transform: translateY(-8px) scaleY(0.95); }
  to { opacity: 1; transform: translateY(0) scaleY(1); }
}
@keyframes ssDropOut {
  from { opacity: 1; }
  to { opacity: 0; transform: translateY(-4px); }
}
</style>
