import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        usuario: JSON.parse(localStorage.getItem('usuario')) || null
    }),
    getters: {
        estaAutenticado: (state) => !!state.token,
        esAdmin: (state) => state.usuario?.rol_id === 1 || state.usuario?.rol_id === 2
    },
    actions: {
        async login(username, password) {
            try {
                const response = await api.post('/auth/login', { username, password });
                this.token = response.data.token;
                this.usuario = response.data.usuario;
                localStorage.setItem('token', this.token);
                localStorage.setItem('usuario', JSON.stringify(this.usuario));
                return { success: true };
            } catch (error) {
                return {
                    success: false,
                    mensaje: error.response?.data?.mensaje || 'Error de conexión'
                };
            }
        },
        logout() {
            this.token = null;
            this.usuario = null;
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
    }
});