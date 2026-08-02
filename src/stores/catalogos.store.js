import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCatalogosStore = defineStore('catalogos', {
    state: () => ({
        minas: [],
        proveedores: [],
        articulos: [],
        supervisores: [],
        viajes: [],
        cargando: false
    }),
    actions: {
        async cargarCatalogos() {
            this.cargando = true;
            try {
                const [resMinas, resProv, resArt, resSup, resViajes] = await Promise.all([
                    api.get('/minas'),
                    api.get('/proveedores'),
                    api.get('/articulos'),
                    api.get('/supervisores'),
                    api.get('/viajes')
                ]);
                this.minas = resMinas.data;
                this.proveedores = resProv.data;
                this.articulos = resArt.data;
                this.supervisores = resSup.data;
                this.viajes = resViajes.data;
            } catch (error) {
                console.error('Error cargando catálogos:', error);
            } finally {
                this.cargando = false;
            }
        }
    }
});