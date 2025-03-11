const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Путь к базе данных
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database');
    }
});

// Создание таблиц
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            year INTEGER NOT NULL,
            mileage INTEGER NOT NULL,
            fuelType TEXT NOT NULL,
            transmission TEXT NOT NULL,
            color TEXT NOT NULL,
            status TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating cars table:', err.message);
        } else {
            console.log('Cars table created or already exists');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            zipCode TEXT NOT NULL,
            country TEXT NOT NULL,
            avatar TEXT NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error('Error creating customers table:', err.message);
        } else {
            console.log('Customers table created or already exists');
        }
    });
});

// Middleware
app.use(cors()); // Разрешаем все источники
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../autosalon-frontend/dist')));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Маршруты API для автомобилей
const { getAllCars, getCarById, addCar, updateCar, deleteCar } = require('./models/CarModel');
const { getAllCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer } = require('./models/CustomerModel');

// Получение списка автомобилей
app.get('/api/cars', async (req, res) => {
    try {
        const cars = await getAllCars();
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение конкретного автомобиля по ID
app.get('/api/cars/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const car = await getCarById(id);

        if (!car) {
            return res.status(404).json({ error: 'Автомобиль не найден' });
        }

        res.json(car);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/cars', (req, res) => {
    const newCar = req.body;
  
    // Добавление нового автомобиля в базу данных
    db.run(
      'INSERT INTO cars (name, price, description, image, year, mileage, fuelType, transmission, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newCar.name,
        newCar.price,
        newCar.description,
        newCar.image,
        newCar.year,
        newCar.mileage,
        newCar.fuelType,
        newCar.transmission,
        newCar.color,
        newCar.status,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
      }
    );
  });

// Обновление автомобиля
app.put('/api/cars/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedCar = req.body;
        const result = await updateCar(id, updatedCar);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Автомобиль не найден' });
        }

        res.json({ message: 'Автомобиль успешно обновлен' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление автомобиля
app.delete('/api/cars/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteCar(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Автомобиль не найден' });
        }

        res.json({ message: 'Автомобиль успешно удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Маршруты API для клиентов
// Получение списка клиентов
app.get('/api/customers', async (req, res) => {
    try {
        const customers = await getAllCustomers();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение конкретного клиента по ID
app.get('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const customer = await getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Добавление нового клиента
app.post('/api/customers', async (req, res) => {
    try {
        const newCustomer = req.body;
        await addCustomer(newCustomer);
        res.status(201).json({ message: 'Клиент успешно добавлен' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обновление клиента
app.put('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedCustomer = req.body;
        const result = await updateCustomer(id, updatedCustomer);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        res.json({ message: 'Клиент успешно обновлен' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление клиента
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await deleteCustomer(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        res.json({ message: 'Клиент успешно удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Закрытие соединения с базой данных при выходе
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Ошибка закрытия базы данных:', err.message);
        } else {
            console.log('Соединение с базой данных закрыто');
        }
        process.exit(0);
    });
});