<template>
  <div class="searchable-select-wrapper" ref="wrapperRef">
    <!-- Campo visible -->
    <div
      class="form-control d-flex align-items-center justify-content-between"
      :class="{ 'ss-open': open, 'is-invalid': invalid }"
      style="cursor:pointer;min-height:38px;user-select:none;"
      @click="toggle"
    >
      <span :class="modelValue ? '' : 'text-muted'" style="font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        {{ selectedLabel || placeholder }}
      </span>
      <i class="bi ms-2" :class="open ? 'bi-chevron-up' : 'bi-chevron-down'" style="font-size:0.7rem;flex-shrink:0;"></i>
    </div>

    <!-- Dropdown -->
    <div v-if="open" class="ss-dropdown shadow-sm border rounded-2 bg-white">
      <!-- Input de búsqueda -->
      <div class="ss-search px-2 pt-2 pb-1">
        <input
          ref="searchRef"
          type="text"
          class="form-control form-control-sm"
          v-model="query"
          :placeholder="`Buscar ${placeholder.toLowerCase()}...`"
          @keydown.esc="close"
          @keydown.enter.prevent="selectFirst"
          autocomplete="off"
        />
      </div>

      <!-- Lista de opciones -->
      <ul class="ss-list list-unstyled mb-0">
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
          {{ opt[labelKey] }}
        </li>
        <li v-if="filtered.length === 0" class="ss-option text-muted fst-italic" style="font-size:0.85rem;pointer-events:none;">
          Sin resultados
        </li>
      </ul>
    </div>
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

.form-control.ss-open {
  border-color: #86b7fe;
  box-shadow: 0 0 0 .25rem rgba(13,110,253,.25);
  outline: 0;
}

.ss-dropdown {
  position: absolute;
  z-index: 1055;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 260px;
  display: flex;
  flex-direction: column;
}

.ss-search { flex-shrink: 0; }

.ss-list {
  overflow-y: auto;
  flex: 1;
  padding: 4px 0;
}

.ss-option {
  padding: 7px 14px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background .12s;
}
.ss-option:hover { background: #f0f4ff; }
.ss-option.active { background: #e8f0fe; color: #1a56db; font-weight: 600; }
</style>
