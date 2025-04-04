import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import './1.css';
import { createPinia } from 'pinia'; // Импортируем Pinia

// Создаем экземпляр приложения
const app = createApp(App);

// Инициализируем Pinia
const pinia = createPinia();
app.use(pinia);

// Подключаем маршрутизатор
app.use(router);

// Монтируем приложение
app.mount('#app');