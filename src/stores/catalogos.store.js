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
                // Usamos Promise.all para descargar las 4 listas al mismo tiempo ¡Súper rápido!
                const [resMinas, resProv, resArt, resSup] = await Promise.all([
                    api.get('/catalogos/minas'),
                    api.get('/catalogos/proveedores'),
                    api.get('/catalogos/articulos'),
                    api.get('/catalogos/supervisores')
                ]);

                this.minas = resMinas.data;
                this.proveedores = resProv.data;
                this.articulos = resArt.data;
                this.supervisores = resSup.data;

            } catch (error) {
                console.error("Error cargando catálogos:", error);
                alert("Error al cargar las listas de datos.");
            } finally {
                this.cargando = false;
            }
        }
    }
});