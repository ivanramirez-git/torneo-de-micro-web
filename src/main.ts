import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import router from './router'
import './style.css'
import { trackPageView, trackEngagement, trackPerformance } from './utils/analytics'

// PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue)
app.use(ConfirmationService)
app.use(ToastService)

// Initialize analytics tracking
const stopEngagement = trackEngagement('your-engagement-event-id')
trackPageView()
trackPerformance('your-performance-event-id')

// Clean up on app unmount
app.unmount = () => {
    stopEngagement()
}

app.mount('#app')