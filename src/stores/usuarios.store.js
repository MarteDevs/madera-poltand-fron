import { defineStore } from 'pinia';
import api from '../api/axios';

export const useUsuariosStore = defineStore('usuarios', {
    state: () => ({
        usuarios: [],
        cargando: false,
        error: null
    }),
    actions: {
        async fetchUsuarios() {
            this.cargando = true;
            this.error = null;
            try {
                const res = await api.get('/usuarios');
                this.usuarios = res.data;
            } catch (error) {
                this.error = error.response?.data?.mensaje || 'Error al obtener usuarios';
            } finally {
                this.cargando = false;
            }
        },
        async crearUsuario(formData) {
            try {
                const res = await api.post('/usuarios', formData);
                await this.fetchUsuarios();
                return { success: true, mensaje: res.data.mensaje };
            } catch (error) {
                return { success: false, mensaje: error.response?.data?.mensaje || 'Error al crear usuario' };
            }
        },
        async actualizarUsuario(id, formData) {
            try {
                const res = await api.put(`/usuarios/${id}`, formData);
                await this.fetchUsuarios();
                return { success: true, mensaje: res.data.mensaje };
            } catch (error) {
                return { success: false, mensaje: error.response?.data?.mensaje || 'Error al actualizar usuario' };
            }
        },
        async eliminarUsuario(id) {
            try {
                const res = await api.delete(`/usuarios/${id}`);
                await this.fetchUsuarios();
                return { success: true, mensaje: res.data.mensaje };
            } catch (error) {
                return { success: false, mensaje: error.response?.data?.mensaje || 'Error al eliminar usuario' };
            }
        }
    }
});
