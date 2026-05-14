import { defineStore } from 'pinia';
import api from '../api/axios';

export const useIngresosStore = defineStore('ingresos', {
    state: () => ({
        pendientes: [],
        historial: [],
        detalleActual: [],
        cargando: false,
        cargandoHistorial: false,
        cargandoDetalle: false,
        error: null
    }),
    actions: {
        async cargarPendientes() {
            this.cargando = true;
            this.error = null;
            try {
                const res = await api.get('/ingresos/pendientes');
                this.pendientes = res.data;
            } catch (err) {
                this.error = err.response?.data?.mensaje || 'Error al cargar pendientes';
            } finally {
                this.cargando = false;
            }
        },
        async cargarHistorial() {
            this.cargandoHistorial = true;
            this.error = null;
            try {
                const res = await api.get('/ingresos');
                this.historial = res.data;
            } catch (err) {
                this.error = err.response?.data?.mensaje || 'Error al cargar historial';
            } finally {
                this.cargandoHistorial = false;
            }
        },
        async cargarDetalleIngreso(id) {
            this.cargandoDetalle = true;
            this.detalleActual = [];
            try {
                const res = await api.get(`/ingresos/${id}/detalle`);
                this.detalleActual = res.data;
            } catch (err) {
                this.detalleActual = [];
            } finally {
                this.cargandoDetalle = false;
            }
        },
        async crearIngreso(payload) {
            try {
                const res = await api.post('/ingresos', payload);
                // Refrescar pendientes e historial
                await Promise.all([this.cargarPendientes(), this.cargarHistorial()]);
                return { success: true, codigo: res.data.codigo_ingreso };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al registrar' };
            }
        },
        async exportarHistorialDetallado() {
            try {
                const res = await api.get('/ingresos/exportar/detallado');
                return { success: true, data: res.data };
            } catch (err) {
                console.error('Error exportando historial:', err);
                return { success: false, mensaje: 'Error al exportar detalle' };
            }
        },
        async actualizarIngreso(id, payload) {
            try {
                const res = await api.put(`/ingresos/${id}`, payload);
                await Promise.all([this.cargarPendientes(), this.cargarHistorial()]);
                return { success: true, mensaje: res.data.mensaje };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al actualizar' };
            }
        },
        async eliminarIngreso(id) {
            try {
                const res = await api.delete(`/ingresos/${id}`);
                await Promise.all([this.cargarPendientes(), this.cargarHistorial()]);
                return { success: true, mensaje: res.data.mensaje };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al eliminar' };
            }
        }
    }
});
