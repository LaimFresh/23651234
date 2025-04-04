<template>
  <div class="car-index">
    <h1>Список автомобилей</h1>
    <router-link to="/cars/create" class="btn btn-primary">Добавить автомобиль</router-link>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Марка</th>
          <th>Цена</th>
          <th>Год выпуска</th>
          <th>Пробег</th>
          <th>Изображение</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="car in cars" :key="car.id">
          <td>{{ car.id }}</td>
          <td>{{ car.name }}</td>
          <td>{{ car.price }} $</td>
          <td>{{ car.year }}</td>
          <td>{{ car.mileage }} км</td>
          <td>
            <img
              v-if="car.image"
              :src="getAssetImage(car.image)"
              :alt="car.name"
              style="width: 100px; height: auto;"
            />
            <span v-else>Нет изображения</span>
          </td>
          <td>
            <router-link :to="{ name: 'CarShow', params: { id: car.id } }" class="btn btn-info">
              Просмотр
            </router-link>
            <router-link :to="{ name: 'CarEdit', params: { id: car.id } }" class="btn btn-warning">
              Редактировать
            </router-link>
            <button @click="deleteCar(car.id)" class="btn btn-danger">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Пагинация -->
    <div class="pagination">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn btn-secondary"
      >
        Предыдущая
      </button>
      <span>Страница {{ currentPage }} из {{ totalPages }}</span>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn btn-secondary"
      >
        Следующая
      </button>
    </div>
  </div>
</template>

<script>
import { carApi } from '@/services/api';

export default {
  data() {
    return {
      cars: [], // Список автомобилей
      currentPage: 1, // Текущая страница
      limit: 10, // Количество элементов на странице
      total: 0, // Общее количество автомобилей
      totalPages: 0, // Общее количество страниц
    };
  },
  created() {
    this.fetchCars(); // Получаем список автомобилей при создании компонента
  },
  methods: {
    fetchCars() {
      carApi.getCars(this.currentPage, this.limit)
        .then(response => {
          console.log('Response from server:', response); // Логируем ответ сервера
          if (!response.data || !response.data.meta) {
            throw new Error('Invalid response format from server');
          }
          this.cars = response.data.data;
          this.total = response.data.meta.total;
          this.totalPages = response.data.meta.totalPages;
        })
        .catch(error => {
          console.error('Ошибка при получении списка автомобилей:', error.message);
          alert('Произошла ошибка при загрузке данных. Попробуйте позже.');
        });
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.fetchCars(); // Обновляем данные при смене страницы
    },
    deleteCar(id) {
      if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
        return;
      }

      carApi.deleteCar(id)
        .then(() => {
          this.cars = this.cars.filter(car => car.id !== id);
          alert('Автомобиль успешно удален!');
        })
        .catch(error => {
          console.error('Ошибка при удалении автомобиля:', error);
          alert(`Произошла ошибка при удалении автомобиля: ${error.message}`);
        });
    },
    getAssetImage(imageName) {
      try {
        return require(`@/assets/${imageName}`);
      } catch (error) {
        console.warn(`Изображение не найдено: ${imageName}`);
        return '/path/to/default-image.jpg'; // Заглушка
      }
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}
.table img {
  width: 50px;
  height: auto;
  object-fit: cover;
  border-radius: 5px;
}
.btn {
  margin-right: 5px;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
.pagination button {
  margin: 0 5px;
  padding: 5px 10px;
  font-size: 14px;
}
.pagination span {
  margin: 0 10px;
  font-size: 16px;
}
</style>