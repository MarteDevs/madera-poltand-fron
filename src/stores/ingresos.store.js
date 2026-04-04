import { defineStore } from 'pinia';
import api from '../api/axios';

export const useIngresosStore = defineStore('ingresos', {
    state: () => ({
        pendientes: [],
        cargando: false,
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
        async crearIngreso(payload) {
            try {
                const res = await api.post('/ingresos', payload);
                await this.cargarPendientes();
                return { success: true, codigo: res.data.codigo_ingreso };
            } catch (err) {
                return { success: false, mensaje: err.response?.data?.mensaje || 'Error al registrar' };
            }
        }
    }
});
