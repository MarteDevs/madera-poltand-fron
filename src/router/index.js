import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiereAuth: true }
    },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiereAuth: true } },
    { path: '/requerimientos', name: 'requerimientos', component: () => import('../views/RequerimientosView.vue'), meta: { requiereAuth: true } },
    { path: '/ingresos', name: 'ingresos', component: () => import('../views/IngresosView.vue'), meta: { requiereAuth: true } },
    { path: '/analisis', name: 'analisis', component: () => import('../views/AnalisisView.vue'), meta: { requiereAuth: true } },
    { path: '/articulos', name: 'articulos', component: () => import('../views/ArticulosView.vue'), meta: { requiereAuth: true } },
    { path: '/minas', name: 'minas', component: () => import('../views/MinasView.vue'), meta: { requiereAuth: true } },
    { path: '/proveedores', name: 'proveedores', component: () => import('../views/ProveedoresView.vue'), meta: { requiereAuth: true } },
    { path: '/supervisores', name: 'supervisores', component: () => import('../views/SupervisoresView.vue'), meta: { requiereAuth: true } },
    { path: '/viajes', name: 'viajes', component: () => import('../views/ViajesView.vue'), meta: { requiereAuth: true } },
    { path: '/usuarios', name: 'usuarios', component: () => import('../views/UsuariosView.vue'), meta: { requiereAuth: true, requiereAdmin: true } },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiereAuth && !authStore.estaAutenticado) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.estaAutenticado) {
    next({ name: 'dashboard' })
  } else if (to.meta.requiereAdmin && authStore.usuario && authStore.usuario.rol_id !== 1 && authStore.usuario.rol_id !== 2) {
    // Si intenta entrar a una vista de Admin y es Operador (rol_id 3), lo regresamos al dashboard
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
