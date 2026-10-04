import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Bootstrap 5 CSS (el JS se importa por vista: solo se usa Modal, vía `import { Modal } from 'bootstrap'`)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Tipografía autoalojada (antes: Google Fonts por <link> en index.html)
import './assets/fonts/fonts.css'

// Custom global styles
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')