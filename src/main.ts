import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import App from './App.vue';
import router from './router';
import './style.css';

// PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';

// Google Analytics tracking setup
import { setupScrollTracking, setupEngagementTracking, setupClickTracking } from './utils/analytics';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(ToastService);

app.mount('#app');

// Initialize analytics tracking after app is mounted
setTimeout(() => {
  // Setup automatic scroll depth tracking
  setupScrollTracking();
  
  // Setup user engagement tracking
  setupEngagementTracking();
  
  // Setup click tracking on the entire app
  setupClickTracking('#app');
}, 1000);
