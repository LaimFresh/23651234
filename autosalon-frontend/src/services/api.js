import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://two3651234.onrender.com/api', // Адрес вашего бэкенда
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Методы для работы с автомобилями (оставляем без изменений)
export const carApi = {
  getCars(page = 1, limit = 10) {
    return apiClient.get('/cars', {
      params: { page, limit }, // Передаем параметры пагинации
    });
  },
  getCar(id) {
    return apiClient.get(`/cars/${id}`);
  },
  createCar(car) {
    return apiClient.post('/cars', car);
  },
  updateCar(id, car) {
    return apiClient.put(`/cars/${id}`, car);
  },
  deleteCar(id) {
    return apiClient.delete(`/cars/${id}`);
  },
};

// Методы для работы с клиентами
export const customerApi = {
  getAllCustomers(page = 1, limit = 10) {
    return apiClient.get('/customers', {
      params: { page, limit }, // Передаем параметры пагинации
    });
  },
  getCustomerById(id) {
    return apiClient.get(`/customers/${id}`);
  },
  createCustomer(customer) {
    return apiClient.post('/customers', customer);
  },
  updateCustomer(id, customer) {
    return apiClient.put(`/customers/${id}`, customer);
  },
  deleteCustomer(id) {
    return apiClient.delete(`/customers/${id}`);
  },
};