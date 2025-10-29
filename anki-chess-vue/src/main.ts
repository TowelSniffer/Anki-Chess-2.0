// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Import Pinia
import App from '@/App.vue';

// Import your store
import { useChessStore } from '@/stores/chessStore';

// Create the Vue app
const app = createApp(App);

// Create and use the Pinia instance
const pinia = createPinia();
app.use(pinia);

// Mount the app
app.mount('#app');

// --- IMPORTANT ---
// Initialize your store *after* Pinia is created
const chessStore = useChessStore();
chessStore.initializeStore();
