<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">Автосалон</router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Главная</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/about" class="nav-link">О нас</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/contacts" class="nav-link">Контакты</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/cars" class="nav-link">Машины</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/customers" class="nav-link">Клиенты</router-link>
            </li>
          </ul>
          <!-- Панель пользователя -->
          <ul class="navbar-nav ms-auto">
            <template v-if="isAuthenticated">
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ user.username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="#" @click.prevent="logout">Выйти</a></li>
                </ul>
              </li>
            </template>
           
          </ul>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      user: {
        username: '',
        role: '',
      },
    };
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Расшифровываем токен (JWT) для получения данных пользователя
          const decoded = JSON.parse(atob(token.split('.')[1]));
          this.user.username = decoded.username || 'Пользователь';
          this.user.role = decoded.role || 'user';
          this.isAuthenticated = true;
        } catch (error) {
          console.error('Ошибка при расшифровке токена:', error);
          this.logout();
        }
      } else {
        this.isAuthenticated = false;
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      this.user = { username: '', role: '' };
      this.$router.push('/login'); // Перенаправляем на страницу входа
    },
  },
  created() {
    this.checkAuth(); // Проверяем авторизацию при загрузке приложения
  },
};
</script>

<style>
.dropdown-menu {
  min-width: 150px;
}
.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #000;
}
.navbar-nav .nav-link {
  padding: 0.5rem 1rem;
}
#app {
  font-family: Arial, sans-serif;
}
.navbar {
  margin-bottom: 20px;
}
.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}
.nav-link {
  font-size: 1.1rem;
  margin-left: 15px;
}
.nav-link:hover {
  color: #fff !important;
  text-decoration: underline;
}
</style>