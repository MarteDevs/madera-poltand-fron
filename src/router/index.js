import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RequerimientosView from '../views/RequerimientosView.vue'
import IngresosView from '../views/IngresosView.vue'
import ArticulosView from '../views/ArticulosView.vue'
import MinasView from '../views/MinasView.vue'
import ProveedoresView from '../views/ProveedoresView.vue'
import SupervisoresView from '../views/SupervisoresView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiereAuth: true }
    },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiereAuth: true } },
    { path: '/requerimientos', name: 'requerimientos', component: RequerimientosView, meta: { requiereAuth: true } },
    { path: '/ingresos', name: 'ingresos', component: IngresosView, meta: { requiereAuth: true } },
    { path: '/articulos', name: 'articulos', component: ArticulosView, meta: { requiereAuth: true } },
    { path: '/minas', name: 'minas', component: MinasView, meta: { requiereAuth: true } },
    { path: '/proveedores', name: 'proveedores', component: ProveedoresView, meta: { requiereAuth: true } },
    { path: '/supervisores', name: 'supervisores', component: SupervisoresView, meta: { requiereAuth: true } },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiereAuth && !authStore.estaAutenticado) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.estaAutenticado) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
