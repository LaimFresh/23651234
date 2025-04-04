import { createRouter, createWebHistory } from 'vue-router';

// Импорты для страниц
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import ContactsView from '../views/ContactsView.vue';
import CarIndex from '../views/CarIndex.vue';
import CarShow from '../views/CarShow.vue';
import CarCreate from '../views/CarCreate.vue';
import CarEdit from '../views/CarEdit.vue';
import CustomerIndex from '../views/CustomerIndex.vue';
import CustomerShow from '../views/CustomerShow.vue';
import CustomerCreate from '../views/CustomerCreate.vue';
import CustomerEdit from '../views/CustomerEdit.vue';


const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/contacts', component: ContactsView },
  { path: '/cars', name: 'CarIndex', component: CarIndex },
  { path: '/cars/:id', name: 'CarShow', component: CarShow, props: true },
  { path: '/cars/create', name: 'CarCreate', component: CarCreate },
  { path: '/cars/:id/edit', name: 'CarEdit', component: CarEdit, props: true },
  { path: '/customers', name: 'CustomerIndex', component: CustomerIndex },
  { path: '/customers/:id', name: 'CustomerShow', component: CustomerShow, props: true },
  { path: '/customers/create', name: 'CustomerCreate', component: CustomerCreate },
  { path: '/customers/:id/edit', name: 'CustomerEdit', component: CustomerEdit, props: true },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});


export default router;