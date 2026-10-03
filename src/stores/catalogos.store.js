import { defineStore } from 'pinia';
import api from '../api/axios';

let cargaEnProgreso = null;

export const useCatalogosStore = defineStore('catalogos', {
    state: () => ({
        minas: [],
        proveedores: [],
        articulos: [],
        supervisores: [],
        viajes: [],
        preciosProveedores: [],
        cargando: false,
        ultimaCarga: null,
        preciosMap: new Map()
    }),
    actions: {
        _rebuildPreciosMap() {
            this.preciosMap.clear();
            for (let i = 0; i < this.preciosProveedores.length; i++) {
                const p = this.preciosProveedores[i];
                this.preciosMap.set(`${p.articulo_id}_${p.proveedor_id}`, {
                    precio_proveedor: Number(p.precio_proveedor),
                    precio_mina: Number(p.precio_mina)
                });
            }
        },

        async cargarCatalogos(forzar = false) {
            const TTL = 10 * 60 * 1000; // 10 minutos de caché
            const ahora = Date.now();

            // Reutilizar datos en memoria si están dentro del TTL y no se fuerza
            if (!forzar && this.minas.length > 0 && this.ultimaCarga && (ahora - this.ultimaCarga < TTL)) {
                return;
            }

            // Si ya hay una carga en progreso, reutilizar la misma promesa (evita peticiones duplicadas)
            if (cargaEnProgreso) {
                return cargaEnProgreso;
            }

            this.cargando = true;
            cargaEnProgreso = (async () => {
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
                    if (results[5].status === 'fulfilled') {
                        this.preciosProveedores = results[5].value.data || [];
                        this._rebuildPreciosMap();
                    }
                    this.ultimaCarga = Date.now();
                } catch (error) {
                    console.error('Error cargando catálogos:', error);
                } finally {
                    this.cargando = false;
                    cargaEnProgreso = null;
                }
            })();

            return cargaEnProgreso;
        },

        getPrecio(articulo_id, proveedor_id) {
            if (!articulo_id) return { precio_proveedor: 0, precio_mina: 0 };
            
            // Búsqueda O(1) instantánea en Map
            const key = `${Number(articulo_id)}_${Number(proveedor_id)}`;
            if (this.preciosMap.has(key)) {
                return this.preciosMap.get(key);
            }
            
            const art = this.articulos.find(a => a.id === Number(articulo_id));
            return art ? { precio_proveedor: Number(art.precio_proveedor), precio_mina: Number(art.precio_mina) } : { precio_proveedor: 0, precio_mina: 0 };
        },

        async guardarPrecioProveedor(payload) {
            await api.post('/articulos/precios-proveedores', payload);
            const res = await api.get('/articulos/precios-proveedores');
            this.preciosProveedores = res.data || [];
            this._rebuildPreciosMap();
        },

        async clonarPrecios(payload) {
            await api.post('/articulos/precios-proveedores/clonar', payload);
            const res = await api.get('/articulos/precios-proveedores');
            this.preciosProveedores = res.data || [];
            this._rebuildPreciosMap();
        }
    }
});