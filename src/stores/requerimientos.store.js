import { defineStore } from 'pinia';
import api from '../api/axios';

export const useRequerimientosStore = defineStore('requerimientos', {
    state: () => ({
        historial: [],
        cargando: false,
        error: null
    }),
    actions: {
        async cargarHistorial() {
            this.cargando = true;
            this.error = null;
            try {
                const res = await api.get('/requerimientos/historial');
                this.historial = res.data;
            } catch (err) {
                this.error = err.response?.data?.mensaje || 'Error al cargar requerimientos';
            } finally {
                this.cargando = false;
            }
        },
        async crearRequerimiento(payload) {
            try {
                const res = await api.post('/requerimientos', payload);
                await this.cargarHistorial();
                return { success: true, codigo: res.data.codigo_req };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al crear' };
            }
        },
        async getDetalles(id) {
            try {
                const res = await api.get(`/requerimientos/${id}/detalles`);
                return res.data;
            } catch {
                return [];
            }
        },
        async getHistorialDetallado() {
            try {
                const res = await api.get('/requerimientos/historial/detallado');
                return res.data;
            } catch {
                return [];
            }
        },
        async actualizarRequerimiento(id, payload) {
            try {
                await api.put(`/requerimientos/${id}`, payload);
                await this.cargarHistorial();
                return { success: true };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al actualizar' };
            }
        },
        async eliminarRequerimiento(id) {
            try {
                await api.delete(`/requerimientos/${id}`);
                await this.cargarHistorial();
                return { success: true };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al eliminar' };
            }
        },
        async getSiguienteCodigo(fecha) {
            try {
                const params = fecha ? { fecha } : {};
                const res = await api.get('/requerimientos/siguiente-codigo', { params });
                return res.data.codigo;
            } catch (err) {
                return null;
            }
        },
        async forzarCierreRequerimiento(id) {
            try {
                await api.put(`/requerimientos/${id}/forzar-cierre`);
                await this.cargarHistorial();
                return { success: true };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al forzar cierre' };
            }
        }
    }
});
