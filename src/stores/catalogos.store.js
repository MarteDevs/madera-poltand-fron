import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCatalogosStore = defineStore('catalogos', {
    state: () => ({
        minas: [],
        proveedores: [],
        articulos: [],
        supervisores: [],
        cargando: false
    }),
    actions: {
        async cargarCatalogos() {
            this.cargando = true;
            try {
                const [resMinas, resProv, resArt, resSup] = await Promise.all([
                    api.get('/minas'),
                    api.get('/proveedores'),
                    api.get('/articulos'),
                    api.get('/supervisores')
                ]);
                this.minas = resMinas.data;
                this.proveedores = resProv.data;
                this.articulos = resArt.data;
                this.supervisores = resSup.data;
            } catch (error) {
                console.error('Error cargando catálogos:', error);
            } finally {
                this.cargando = false;
            }
        }
    }
});