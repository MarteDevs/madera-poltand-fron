import { defineStore } from 'pinia';
import api from '../api/axios';

export const useCatalogosStore = defineStore('catalogos', {
    state: () => ({
        minas: [],
        proveedores: [],
        articulos: [],
        supervisores: [],
        viajes: [],
        preciosProveedores: [],
        cargando: false
    }),
    actions: {
        async cargarCatalogos() {
            this.cargando = true;
            try {
                const results = await Promise.allSettled([
                    api.get('/minas'),
                    api.get('/proveedores'),
                    api.get('/articulos'),
                    api.get('/supervisores'),
                    api.get('/viajes'),
                    api.get('/articulos/precios-proveedores')
                ]);
                if (results[0].status === 'fulfilled') this.minas = results[0].value.data || [];
                if (results[1].status === 'fulfilled') this.proveedores = results[1].value.data || [];
                if (results[2].status === 'fulfilled') this.articulos = results[2].value.data || [];
                if (results[3].status === 'fulfilled') this.supervisores = results[3].value.data || [];
                if (results[4].status === 'fulfilled') this.viajes = results[4].value.data || [];
                if (results[5].status === 'fulfilled') this.preciosProveedores = results[5].value.data || [];
            } catch (error) {
                console.error('Error cargando catálogos:', error);
            } finally {
                this.cargando = false;
            }
        },

        getPrecio(articulo_id, proveedor_id) {
            if (!articulo_id) return { precio_proveedor: 0, precio_mina: 0 };
            const match = this.preciosProveedores.find(
                p => p.articulo_id === Number(articulo_id) && p.proveedor_id === Number(proveedor_id)
            );
            if (match) {
                return { precio_proveedor: Number(match.precio_proveedor), precio_mina: Number(match.precio_mina) };
            }
            const art = this.articulos.find(a => a.id === Number(articulo_id));
            return art ? { precio_proveedor: Number(art.precio_proveedor), precio_mina: Number(art.precio_mina) } : { precio_proveedor: 0, precio_mina: 0 };
        },

        async guardarPrecioProveedor(payload) {
            await api.post('/articulos/precios-proveedores', payload);
            const res = await api.get('/articulos/precios-proveedores');
            this.preciosProveedores = res.data || [];
        },

        async clonarPrecios(payload) {
            await api.post('/articulos/precios-proveedores/clonar', payload);
            const res = await api.get('/articulos/precios-proveedores');
            this.preciosProveedores = res.data || [];
        }
    }
});