const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

console.log("🔹 Используемый логин PostgreSQL:", process.env.DB_USER);
console.log("🔹 Используемый хост:", process.env.DB_HOST);
console.log("🔹 Используемая БД:", process.env.DB_NAME);

const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const app = express();
const port = 5000;



app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
});

app.use(cors());
app.use(express.json());

// ✅ Настройка `multer` для загрузки файлов в `uploads/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя
    }
});

const upload = multer({ storage });

// ✅ Делаем `uploads/` доступной для загрузки файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/uploads/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);
    const fileExt = path.extname(req.params.filename).toLowerCase();

    const mimeTypes = {
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav"
    };

    const contentType = mimeTypes[fileExt] || "application/octet-stream";

    if (!mimeTypes[fileExt]) {
        console.error("❌ Неподдерживаемый формат:", fileExt);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", contentType);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("❌ Ошибка при отправке файла:", err);
            res.status(err.status).end();
        }
    });
});


// ✅ Регистрация
// ✅ Добавляем колонку `avatar` в `users`
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultAvatar = "avatar2.jpg"; // 🖼 Дефолтное фото

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, defaultAvatar]
        );

        res.json({ message: "User registered successfully!", user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
    }
});

// ✅ Обновление профиля с загрузкой фото
app.put('/api/users/:id', upload.single('avatar'), async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const avatar = req.file ? req.file.filename : null;

    try {
        let query = 'UPDATE users SET name = $1 WHERE id = $2 RETURNING *';
        let values = [name, id];

        if (avatar) {
            query = 'UPDATE users SET name = $1, avatar = $2 WHERE id = $3 RETURNING *';
            values = [name, avatar, id];
        }

        const updatedUser = await pool.query(query, values);

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error("Ошибка обновления профиля:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// ✅ Получение профиля
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await pool.query("SELECT id, name, avatar FROM users WHERE id = $1", [id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Ошибка получения профиля:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// ✅ Логин
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) return res.status(401).json({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: "Invalid password" });

        // ✅ Создаём JWT-токен
        const token = jwt.sign(
            { id: user.rows[0].id, email: user.rows[0].email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        console.log("✅ Успешный вход:", user.rows[0]); // Логируем в консоль

        res.json({ 
            message: "Login successful", 
            token, 
            userId: user.rows[0].id 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Login failed" });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Нет доступа" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Неверный токен" });
        req.user = user;
        next();
    });
}

app.get('/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [req.user.id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Ошибка авторизации:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// ✅ Получение треков по userId
app.get('/api/tracks/user/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    if (req.user.id !== parseInt(id)) {
        return res.status(403).json({ message: "Доступ запрещён" });
    }

    try {
        const userTracks = await pool.query("SELECT * FROM tracks WHERE owner_id = $1", [id]);

        if (userTracks.rows.length === 0) {
            return res.status(404).json({ message: "Нет треков у пользователя" });
        }

        res.json(userTracks.rows);
    } catch (error) {
        console.error("Ошибка получения треков:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// ✅ Получение ВСЕХ треков (для главной страницы)
app.get('/api/tracks', authenticateToken, async (req, res) => {
    try {
        const allTracks = await pool.query("SELECT * FROM tracks");

        if (allTracks.rows.length === 0) {
            return res.status(404).json({ message: "Нет доступных треков" });
        }

        res.json(allTracks.rows);
    } catch (error) {
        console.error("Ошибка получения всех треков:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});


// ✅ Загрузка трека (изображение + музыка)
app.post('/api/tracks', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'musicName', maxCount: 1 }]), async (req, res) => {
    const { name, author_name, lang, timesPlayed, type, owner_id } = req.body;

    if (!name || !author_name || !req.files['img'] || !req.files['musicName'] || !owner_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const newTrack = await pool.query(
            `INSERT INTO tracks (name, author_name, img, lang, timesPlayed, type, musicName, owner_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, author_name, req.files['img'][0].filename, lang, timesPlayed, type, req.files['musicName'][0].filename, owner_id]
        );

        res.status(201).json(newTrack.rows[0]);
    } catch (error) {
        console.error("Ошибка при добавлении трека:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


