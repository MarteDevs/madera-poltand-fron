import { ref, computed } from 'vue';
import api from '../api/axios';

/**
 * Lógica compartida de los catálogos simples (minas, proveedores, supervisores,
 * viajes): listar activos/desactivados, buscar, crear/reactivar, actualizar y
 * borrado inteligente (lógico si tiene historial, físico si no). Extraído de
 * la duplicación casi idéntica que había en las 4 vistas.
 *
 * El composable solo maneja datos/estado; cada vista decide cómo confirmar
 * (confirm() nativo, SweetAlert2, etc.) y cómo notificar (toast, Swal...) vía
 * los callbacks onConfirm/onNotify, para no forzar un único look & feel.
 *
 * @param {object} opciones
 * @param {string} opciones.resource - ruta base de la API, ej. '/minas'
 * @param {string[]} [opciones.camposBusqueda] - campos de texto a filtrar
 * @param {() => object} [opciones.formInicial] - fábrica del form vacío
 * @param {Object.<string, (valor:any, form:object)=>string|null>} [opciones.validadores]
 *   Un validador por campo: recibe el valor (y el form completo) y devuelve el
 *   mensaje de error, o null si es válido. Habilita la validación en vivo
 *   (Nielsen #1 Visibilidad del estado / #5 Prevención de errores): mientras
 *   el campo no haya sido tocado no se muestra en rojo, pero el formulario
 *   completo (`isFormValid`) ya refleja si se puede guardar o no.
 * @param {(mensaje: string, tipo: string) => void} [opciones.onNotify]
 * @param {(mensaje: string) => Promise<boolean>} [opciones.onConfirm]
 */
export function useCrudCatalogo({
    resource,
    camposBusqueda = ['nombre'],
    formInicial = () => ({ nombre: '' }),
    validadores = {},
    onNotify = () => {},
    onConfirm = async () => true
}) {
    const items = ref([]);
    const itemsDesactivados = ref([]);
    const cargando = ref(true);
    const cargandoDesactivados = ref(false);
    const busqueda = ref('');
    const busquedaDesactivados = ref('');

    const editando = ref(false);
    const editandoId = ref(null);
    const guardando = ref(false);
    const error = ref('');
    const form = ref(formInicial());

    // Validación en vivo por campo
    const fieldErrors = ref({});
    const fieldTouched = ref({});

    const validarCampo = (campo) => {
        fieldTouched.value = { ...fieldTouched.value, [campo]: true };
        const regla = validadores[campo];
        if (!regla) return;
        fieldErrors.value = { ...fieldErrors.value, [campo]: regla(form.value[campo], form.value) };
    };

    const validarTodo = () => {
        const errores = {};
        for (const campo in validadores) {
            errores[campo] = validadores[campo](form.value[campo], form.value);
        }
        fieldErrors.value = errores;
        return Object.values(errores).every(e => !e);
    };

    /** Mensaje de error a mostrar (solo si el campo ya fue tocado). */
    const displayError = (campo) => (fieldTouched.value[campo] ? fieldErrors.value[campo] : null);

    const isFormValid = computed(() => Object.values(fieldErrors.value).every(e => !e));

    const coincide = (item, q) =>
        camposBusqueda.some(campo => (item[campo] || '').toString().toLowerCase().includes(q));

    const filtrados = computed(() => {
        const q = busqueda.value.toLowerCase().trim();
        if (!q) return items.value;
        return items.value.filter(item => coincide(item, q));
    });

    const desactivadosFiltrados = computed(() => {
        const q = busquedaDesactivados.value.toLowerCase().trim();
        if (!q) return itemsDesactivados.value;
        return itemsDesactivados.value.filter(item => coincide(item, q));
    });

    const cargar = async () => {
        cargando.value = true;
        cargandoDesactivados.value = true;
        try {
            const [resActivos, resDesact] = await Promise.all([
                api.get(resource),
                api.get(`${resource}?estado=0`)
            ]);
            items.value = resActivos.data || [];
            itemsDesactivados.value = resDesact.data || [];
        } catch (e) {
            console.error(`Error cargando ${resource}:`, e);
        } finally {
            cargando.value = false;
            cargandoDesactivados.value = false;
        }
    };

    const abrirModal = (item = null) => {
        error.value = '';
        fieldTouched.value = {};
        if (item) {
            editando.value = true;
            editandoId.value = item.id;
            form.value = { ...formInicial(), ...item };
        } else {
            editando.value = false;
            editandoId.value = null;
            form.value = formInicial();
        }
        // Calcula la validez real desde el inicio (sin mostrar errores en rojo
        // todavía) para que el botón Guardar arranque deshabilitado si hace falta.
        validarTodo();
    };

    /** @returns {Promise<boolean>} true si guardó correctamente */
    const guardar = async () => {
        error.value = '';
        const hayValidadores = Object.keys(validadores).length > 0;
        if (hayValidadores) {
            fieldTouched.value = Object.fromEntries(Object.keys(validadores).map(c => [c, true]));
            if (!validarTodo()) return false;
        } else if (!form.value.nombre || !form.value.nombre.trim()) {
            error.value = 'El nombre es obligatorio.';
            return false;
        }
        guardando.value = true;
        try {
            if (editando.value) {
                await api.put(`${resource}/${editandoId.value}`, form.value);
                // Doherty Threshold: ya sabemos qué cambió, así que actualizamos
                // la fila en memoria en vez de volver a pedir las 2 listas
                // completas (activos + inactivos) solo para reflejar 1 cambio.
                const idx = items.value.findIndex(i => i.id === editandoId.value);
                if (idx !== -1) {
                    items.value[idx] = { ...items.value[idx], ...form.value };
                }
                onNotify('Actualizado exitosamente', 'success');
            } else {
                // En creación sí recargamos: necesitamos los campos que asigna
                // el servidor (id, created_at, estado) que no tenemos localmente.
                const res = await api.post(resource, form.value);
                onNotify(res.data?.mensaje || 'Guardado exitosamente', 'success');
                await cargar();
            }
            return true;
        } catch (e) {
            error.value = e.response?.data?.mensaje || 'Error al guardar';
            return false;
        } finally {
            guardando.value = false;
        }
    };

    // El mismo endpoint DELETE decide del lado del backend si desactiva o
    // borra físicamente según el historial del registro; "desactivar" y
    // "eliminarDefinitivo" solo difieren en el texto de confirmación/aviso.
    // `accion` se pasa a onConfirm solo como pista opcional (ej. para elegir
    // ícono/color en SweedAlert2); los callbacks que no la necesitan la ignoran.
    const borrarInteligente = async (id, mensajeConfirm, mensajeFallback, accion) => {
        const confirmado = await onConfirm(mensajeConfirm, accion);
        if (!confirmado) return;
        try {
            const res = await api.delete(`${resource}/${id}`);
            onNotify(res.data?.mensaje || mensajeFallback, 'info');
            await cargar();
        } catch (e) {
            onNotify(e.response?.data?.mensaje || 'Error al procesar la solicitud', 'danger');
        }
    };

    const desactivar = (id, mensajeConfirm = '¿Desactivar este registro?') =>
        borrarInteligente(id, mensajeConfirm, 'Registro desactivado', 'desactivar');

    const eliminarDefinitivo = (id, mensajeConfirm = '¿Desea eliminar definitivamente este registro?') =>
        borrarInteligente(id, mensajeConfirm, 'Registro eliminado', 'eliminar');

    const reactivar = async (id, mensajeConfirm = '¿Desea reactivar este registro?') => {
        const confirmado = await onConfirm(mensajeConfirm, 'reactivar');
        if (!confirmado) return;
        try {
            await api.put(`${resource}/${id}/reactivar`);
            onNotify('Reactivado exitosamente', 'success');
            await cargar();
        } catch (e) {
            onNotify(e.response?.data?.mensaje || 'Error al reactivar', 'danger');
        }
    };

    return {
        items,
        itemsDesactivados,
        cargando,
        cargandoDesactivados,
        busqueda,
        busquedaDesactivados,
        filtrados,
        desactivadosFiltrados,
        editando,
        editandoId,
        guardando,
        error,
        form,
        fieldErrors,
        fieldTouched,
        isFormValid,
        validarCampo,
        displayError,
        cargar,
        abrirModal,
        guardar,
        desactivar,
        reactivar,
        eliminarDefinitivo
    };
}
