import Swal from 'sweetalert2';

// Confirmaciones y avisos con el mismo diseño del resto de la app en vez del
// confirm()/alert() nativo del navegador (inconsistente y sin estilo).
// Extraído de ViajesView, que ya usaba este patrón.

const CONFIRM_CONFIG = {
  desactivar: { title: '¿Desactivar?', icon: 'warning', confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, desactivar' },
  reactivar: { title: '¿Reactivar?', icon: 'question', confirmButtonColor: '#198754', confirmButtonText: 'Sí, reactivar' },
  eliminar: { title: '¿Eliminar definitivamente?', icon: 'warning', confirmButtonColor: '#dc3545', confirmButtonText: 'Sí, eliminar' }
};

/** @returns {Promise<boolean>} true si el usuario confirmó */
export async function confirmarConSwal(mensaje, accion = 'desactivar') {
  const cfg = CONFIRM_CONFIG[accion] || CONFIRM_CONFIG.desactivar;
  const result = await Swal.fire({
    title: cfg.title,
    text: mensaje,
    icon: cfg.icon,
    showCancelButton: true,
    confirmButtonColor: cfg.confirmButtonColor,
    cancelButtonColor: '#6c757d',
    confirmButtonText: cfg.confirmButtonText,
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
}

export function notificarConSwal(mensaje, tipo = 'success') {
  if (tipo === 'danger') {
    Swal.fire('Error', mensaje, 'error');
    return;
  }
  Swal.fire({
    icon: tipo === 'info' ? 'info' : 'success',
    title: tipo === 'info' ? 'Listo' : 'Éxito',
    text: mensaje,
    timer: 1500,
    showConfirmButton: false
  });
}
