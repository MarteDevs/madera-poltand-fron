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
                const [resMinas, resProv, resArt, resSup, resViajes, resPrecios] = await Promise.all([
                    api.get('/minas'),
                    api.get('/proveedores'),
                    api.get('/articulos'),
                    api.get('/supervisores'),
                    api.get('/viajes'),
                    api.get('/articulos/precios-proveedores')
                ]);
                this.minas = resMinas.data;
                this.proveedores = resProv.data;
                this.articulos = resArt.data;
                this.supervisores = resSup.data;
                this.viajes = resViajes.data;
                this.preciosProveedores = resPrecios.data || [];
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