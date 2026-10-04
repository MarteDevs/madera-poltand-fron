<template>
  <div class="cf-field" :class="estadoClase">
    <label class="mp-form-label">
      {{ label }} <span v-if="required" class="cf-req">*</span>
      <span v-if="!required" class="cf-opt">(opcional)</span>
    </label>
    <div class="cf-wrap">
      <input
        class="form-control mp-input"
        :value="modelValue"
        @input="onInput"
        @blur="$emit('touch')"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :inputmode="inputmode"
        autocomplete="off"
      />
      <i v-if="estado === 'valid'" class="bi bi-check-circle-fill cf-icon cf-ok"></i>
      <i v-else-if="estado === 'invalid'" class="bi bi-exclamation-circle-fill cf-icon cf-err"></i>
    </div>
    <div class="cf-hint" v-if="estado === 'invalid' || hint">{{ estado === 'invalid' ? error : hint }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: null },
  touched: { type: Boolean, default: false },
  hint: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  maxlength: { type: [String, Number], default: null },
  inputmode: { type: String, default: 'text' },
  /** transforma el valor antes de emitirlo, ej. dejar solo dígitos */
  transform: { type: Function, default: null }
});
const emit = defineEmits(['update:modelValue', 'touch']);

const onInput = (e) => {
  const val = props.transform ? props.transform(e.target.value) : e.target.value;
  emit('update:modelValue', val);
  emit('touch');
};

const estado = computed(() => {
  if (!props.touched) return 'idle';
  if (props.error) return 'invalid';
  if (props.modelValue) return 'valid';
  return 'idle';
});
const estadoClase = computed(() => ({
  'is-valid': estado.value === 'valid',
  'is-invalid': estado.value === 'invalid'
}));
</script>

<style scoped>
.cf-field { margin-bottom: 1.1rem; }
.cf-req { color: var(--mp-danger); }
.cf-opt { color: var(--mp-text-muted); text-transform: none; font-weight: 500; font-size: 0.78rem; }
.cf-wrap { position: relative; }
.cf-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.95rem; }
.cf-ok { color: var(--mp-success); }
.cf-err { color: var(--mp-danger); }
.cf-hint { font-size: 0.76rem; color: var(--mp-text-muted); margin-top: 5px; }

.cf-field.is-valid .mp-input { border-color: var(--mp-success) !important; background: rgba(16,185,129,0.04); }
.cf-field.is-valid .mp-input:focus { box-shadow: 0 0 0 3px rgba(16,185,129,0.15) !important; }
.cf-field.is-invalid .mp-input { border-color: var(--mp-danger) !important; background: rgba(239,68,68,0.04); }
.cf-field.is-invalid .mp-input:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important; }
.cf-field.is-invalid .cf-hint { color: var(--mp-danger); font-weight: 600; }
</style>
