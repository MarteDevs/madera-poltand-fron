import axios from 'axios';

// Creamos una instancia configurada apuntando a tu backend
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // La URL de tu Node.js
    headers: {
        'Content-Type': 'application/json'
    }
});

// INTERCEPTOR: Antes de que cualquier petición salga hacia el backend...
api.interceptors.request.use(
    (config) => {
        // Buscamos el token en el almacenamiento del navegador (localStorage)
        const token = localStorage.getItem('token');

        // Si existe, se lo pegamos como un "Pase VIP" a la cabecera
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;