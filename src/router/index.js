import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

import LoginView from '../views/LoginView.vue'
import RequerimientosView from '../views/RequerimientosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/requerimientos',
      name: 'requerimientos',
      component: RequerimientosView,
      meta: { requiereAuth: true }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

// GUARDIÁN DE RUTAS
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    
    if (to.meta.requiereAuth && !authStore.estaAutenticado) {
        next({ name: 'login' })
    } 
    else if (to.name === 'login' && authStore.estaAutenticado) {
        next({ name: 'requerimientos' })
    } 
    else {
        next()
    }
})

export default router
