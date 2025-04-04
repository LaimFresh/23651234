const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Загрузка переменных окружения
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'public', 'static')));
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MySQL
// Подключение к MySQL
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'bvmeqovnx74dgjg8fx95-mysql.services.clever-cloud.com', // Host из Railway
    user: process.env.MYSQL_USER || 'ue4jayvcpjd23i90',     // User из Railway
    password: process.env.MYSQL_PASSWORD || 'HKkh8FyE8yNboQydEZBP', // Password из Railway
    database: process.env.MYSQL_DATABASE || 'bvmeqovnx74dgjg8fx95', // Database из Railway
    port: process.env.MYSQL_PORT || 3306,       // Port из Railway
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
// Проверка подключения при старте
pool.getConnection()
  .then(conn => {
    console.log('✅ Успешное подключение к MySQL!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к MySQL:', err.message);
  });
// Инициализация базы данных
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cars (
                id INT AUTO_INCREMENT PRIMARY KEY,
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
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
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
        `);

        console.log('Database tables initialized');
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
}
// Функция для заполнения таблицы cars
async function seedCars() {
    try {
        const cars = [];
        for (let i = 1; i <= 100; i++) {
            cars.push([
                `Car ${i}`,
                Math.floor(Math.random() * 100000) + 10000,
                `Description for Car ${i}`,
                `car${i}.jpg`,
                2010 + Math.floor(Math.random() * 10),
                Math.floor(Math.random() * 100000),
                ['Petrol', 'Diesel', 'Electric'][Math.floor(Math.random() * 3)],
                ['Automatic', 'Manual'][Math.floor(Math.random() * 2)],
                ['Red', 'Blue', 'Black', 'White'][Math.floor(Math.random() * 4)],
                ['Available', 'Sold'][Math.floor(Math.random() * 2)],
            ]);
        }

        // Очистка таблицы cars
        await pool.query('DELETE FROM cars');
        console.log('Cars table cleared');

        // Вставка данных
        const query = `
            INSERT INTO cars (name, price, description, image, year, mileage, fuelType, transmission, color, status)
            VALUES ?
        `;
        await pool.query(query, [cars]);
        console.log('Cars seeded successfully');
    } catch (error) {
        console.error('Error seeding cars:', error.message);
        throw error;
    }
}

// Функция для заполнения таблицы customers
async function seedCustomers() {
    try {
        const customers = [];
        for (let i = 1; i <= 100; i++) {
            customers.push([
                `First${i}`,
                `Last${i}`,
                `email${i}@example.com`,
                `+123456789${i}`,
                `Address ${i}`,
                `City ${i}`,
                `State ${i}`,
                `Zip${i}`,
                `Country ${i}`,
                `avatar${i}.jpg`,
            ]);
        }

        // Очистка таблицы customers
        await pool.query('DELETE FROM customers');
        console.log('Customers table cleared');

        // Вставка данных
        const query = `
            INSERT INTO customers (firstName, lastName, email, phone, address, city, state, zipCode, country, avatar)
            VALUES ?
        `;
        await pool.query(query, [customers]);
        console.log('Customers seeded successfully');
    } catch (error) {
        console.error('Error seeding customers:', error.message);
        throw error;
    }
}

// Функция для запуска сидера
async function runSeeder() {
    try {
        // Проверяем и заполняем таблицу cars
        const [carRows] = await pool.query('SELECT COUNT(*) AS count FROM cars');
        if (carRows[0].count === 0) {
            await seedCars();
        } else {
            console.log('Cars table already contains data. Skipping seeding.');
        }

        // Проверяем и заполняем таблицу customers
        const [customerRows] = await pool.query('SELECT COUNT(*) AS count FROM customers');
        if (customerRows[0].count === 0) {
            await seedCustomers();
        } else {
            console.log('Customers table already contains data. Skipping seeding.');
        }

        console.log('Seeder completed.');
    } catch (error) {
        console.error('Error during seeding:', error.message);
    }
}
// Маршруты API для автомобилей
app.get('/api/cars', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Текущая страница (по умолчанию 1)
        const limit = parseInt(req.query.limit) || 10; // Количество элементов на странице (по умолчанию 10)
        const offset = (page - 1) * limit;

        // Подсчитываем общее количество автомобилей
        const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM cars');
        const total = countRows[0].total;

        // Получаем автомобили с учетом пагинации
        const [rows] = await pool.query('SELECT * FROM cars LIMIT ? OFFSET ?', [limit, offset]);

        res.json({
            data: rows,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching cars:', error.message);
        res.status(500).json({ error: 'Failed to fetch cars', details: error.message });
    }
});
app.get('/api/cars/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM cars WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(rows[0]); // Возвращаем первый элемент массива
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch car', details: error.message });
    }
});
app.post('/api/cars', async (req, res) => {
    const { name, price, description, image, year, mileage, fuelType, transmission, color, status } = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO cars (name, price, description, image, year, mileage, fuelType, transmission, color, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, price, description, image, year, mileage, fuelType, transmission, color, status]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add car', details: error.message });
    }
});

app.put('/api/cars/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCar = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE cars SET name = ?, price = ?, description = ?, image = ?, year = ?, mileage = ?, fuelType = ?, transmission = ?, color = ?, status = ? WHERE id = ?',
            [
                updatedCar.name,
                updatedCar.price,
                updatedCar.description,
                updatedCar.image,
                updatedCar.year,
                updatedCar.mileage,
                updatedCar.fuelType,
                updatedCar.transmission,
                updatedCar.color,
                updatedCar.status,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json({ message: 'Car updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update car', details: error.message });
    }
});

app.delete('/api/cars/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM cars WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }

        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete car', details: error.message });
    }
});

// Маршруты API для клиентов
app.get('/api/customers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Текущая страница (по умолчанию 1)
        const limit = parseInt(req.query.limit) || 10; // Количество элементов на странице (по умолчанию 10)
        const offset = (page - 1) * limit;

        // Подсчитываем общее количество клиентов
        const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM customers');
        const total = countRows[0].total;

        // Получаем клиентов с учетом пагинации
        const [rows] = await pool.query('SELECT * FROM customers LIMIT ? OFFSET ?', [limit, offset]);
        // Опечатка: OFFSET написано как OFSET (не хватает буквы F)
        res.json({
            data: rows,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching customers:', error.message);
        res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }
});
app.get('/api/customers/:id', async (req, res) => {
    const { id } = req.params; // Получаем ID из параметров запроса
    try {
        // Выполняем SQL-запрос для получения клиента по ID
        const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

        // Если клиент не найден, возвращаем ошибку 404
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Возвращаем данные клиента
        res.json(rows[0]); // Возвращаем первый элемент массива
    } catch (error) {
        // Логируем ошибку и возвращаем статус 500
        console.error('Error fetching customer:', error.message);
        res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
    }
});
app.post('/api/customers', async (req, res) => {
    const newCustomer = req.body;

    try {
        const [result] = await pool.query(
            'INSERT INTO customers (firstName, lastName, email, phone, address, city, state, zipCode, country, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                newCustomer.firstName,
                newCustomer.lastName,
                newCustomer.email,
                newCustomer.phone,
                newCustomer.address,
                newCustomer.city,
                newCustomer.state,
                newCustomer.zipCode,
                newCustomer.country,
                newCustomer.avatar,
            ]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add customer', details: error.message });
    }
});

app.put('/api/customers/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCustomer = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE customers SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zipCode = ?, country = ?, avatar = ? WHERE id = ?',
            [
                updatedCustomer.firstName,
                updatedCustomer.lastName,
                updatedCustomer.email,
                updatedCustomer.phone,
                updatedCustomer.address,
                updatedCustomer.city,
                updatedCustomer.state,
                updatedCustomer.zipCode,
                updatedCustomer.country,
                updatedCustomer.avatar,
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update customer', details: error.message });
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete customer', details: error.message });
    }
});

// Fallback для Vue Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
    try {
        await initializeDatabase(); // Инициализируем базу данных и создаем админа
        await runSeeder();          // Запускаем сидер
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
})();