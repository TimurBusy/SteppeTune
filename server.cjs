const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { spawnSync } = require('child_process');
const fs = require('fs');
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
app.use(cors());
const port = 5000;

const basePath = __dirname;
const pythonScript = path.join(basePath, 'fingerprint_handler.py');

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
app.put('/api/users/:id', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { name, bio, instagram, telegram } = req.body;

  const avatar = req.files?.avatar?.[0]?.filename || null;
  const cover = req.files?.cover?.[0]?.filename || null;

  try {
    let setParts = ['name = $1', 'bio = $2', 'instagram = $3', 'telegram = $4'];
    let values = [name, bio, instagram, telegram];
    let idx = 5;

    if (avatar) {
      setParts.push(`avatar = $${idx}`);
      values.push(avatar);
      idx++;
    }

    if (cover) {
      setParts.push(`cover = $${idx}`);
      values.push(cover);
      idx++;
    }

    values.push(id);
    const query = `UPDATE users SET ${setParts.join(', ')} WHERE id = $${idx} RETURNING *`;

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
        const user = await pool.query("SELECT id, name, avatar, bio, cover, instagram, telegram, email FROM users WHERE id = $1", [id]);


        if (user.rows.length === 0) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Ошибка получения профиля:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// ✅ Привязка MetaMask-кошелька к профилю
app.post('/api/users/wallet', authenticateToken, async (req, res) => {
  const { eth_address } = req.body;

  if (!eth_address || eth_address.length < 10) {
    return res.status(400).json({ message: "❌ Адрес MetaMask отсутствует или некорректен" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET eth_address = $1 WHERE id = $2 RETURNING eth_address",
      [eth_address, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    console.log(`🔗 Кошелёк привязан: ${eth_address} -> User ${req.user.id}`);
    res.status(200).json({ message: "✅ Кошелёк привязан", eth_address });
  } catch (err) {
    console.error("❌ Ошибка базы при привязке кошелька:", err);
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

app.get('/api/marketplace/tracks', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM tracks WHERE is_for_sale = true AND is_sold = false`
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("❌ Ошибка получения маркетплейс треков:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
});  

app.get('/api/public/tracks/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const tracks = await pool.query(
      "SELECT * FROM tracks WHERE owner_id = $1",
      [id]
    );

    if (tracks.rows.length === 0) {
      return res.status(404).json({ message: "Нет треков у пользователя" });
    }

    res.json(tracks.rows);
  } catch (error) {
    console.error("Ошибка загрузки публичных треков:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// ✅ Загрузка трека (изображение + музыка)
app.post('/api/tracks', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'musicName', maxCount: 1 }]), async (req, res) => {
    const { name, author_name, lang, timesPlayed, type, owner_id } = req.body;
  
    if (!name || !author_name || !req.files['img'] || !req.files['musicName'] || !owner_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    const audioFile = req.files["musicName"][0];
    const imgFile = req.files["img"][0];
    const audioPath = path.join(__dirname, "uploads", audioFile.filename);
    const imgPath = path.join(__dirname, "uploads", imgFile.filename);
  
    const fs = require('fs');
  
    // ⏳ Ждём появления файлов
    let waitCount = 0;
    while ((!fs.existsSync(audioPath) || fs.statSync(audioPath).size === 0) && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }
  
    // 🔍 Плагиат-проверка
    const checkResult = spawnSync('python', [pythonScript, 'check', audioPath], { encoding: 'utf-8' });
  
    if (checkResult.stdout.includes("DUPLICATE")) {
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imgPath);
      return res.status(409).json({ message: "❌ Плагиат: трек уже существует" });
    }
  
    // ☁️ Загрузка в IPFS через CLI `w3 up`
    const getIpfsCid = (filePath) => {
        const fs = require("fs");
        console.log("📁 Загружаем файл в IPFS:", filePath);
      
        if (!fs.existsSync(filePath)) {
          console.error("❌ Файл не найден:", filePath);
          return null;
        }
      
        const fileSize = fs.statSync(filePath).size;
        console.log("📏 Размер:", fileSize);
      
        try {
          const result = spawnSync(
            'cmd.exe',
            ['/c', 'w3', 'up', filePath, '--debug'],
            { encoding: 'utf-8' }
          );
      
          if (!result.stdout) {
            console.error("⛔ IPFS stdout is empty:", result.stderr || "Нет ошибок в stderr");
            return null;
          }
      
          console.log("🔧 Результат w3 up:\n", result.stdout);
      
          const lines = result.stdout.split('\n');
          for (let line of lines) {
            if (line.includes('https://') && line.includes('/ipfs/')) {
              const cidPart = line.split('/ipfs/')[1]?.trim();
              if (cidPart) {
                return `ipfs://${cidPart}`;
              }
            }
          }
      
          console.warn("⚠️ CID не найден в выводе");
          return null;
      
        } catch (e) {
          console.error("IPFS upload error:", e);
          return null;
        }
    };      

  
    const img_ipfs_base = getIpfsCid(imgPath);
    const music_ipfs_base = getIpfsCid(audioPath);

    // ✅ Добавляем имя файла вручную
    const img_ipfs = img_ipfs_base ? `${img_ipfs_base}/${imgFile.filename}` : null;
    const music_ipfs = music_ipfs_base ? `${music_ipfs_base}/${audioFile.filename}` : null;
  
    if (!img_ipfs || !music_ipfs) {
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imgPath);
      return res.status(500).json({ message: "❌ Ошибка загрузки в IPFS" });
    }
  
    // 🧠 Сохраняем в базу
    let trackId;
    try {
      const newTrack = await pool.query(
        `INSERT INTO tracks (name, author_name, img, img_ipfs, lang, timesPlayed, type, musicName, music_ipfs, owner_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [
          name,
          author_name,
          imgFile.filename,
          img_ipfs,
          lang,
          timesPlayed,
          type,
          audioFile.filename,
          music_ipfs,
          owner_id
        ]
      );
      trackId = newTrack.rows[0].id;
    } catch (error) {
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imgPath);
      return res.status(500).json({ message: "❌ Ошибка записи в базу" });
    }
  
    // 🔐 Добавляем fingerprint
    const addResult = spawnSync('python', [pythonScript, 'add', audioPath, trackId.toString()], { encoding: 'utf-8' });
  
    if (!addResult.stdout.includes("OK")) {
      await pool.query("DELETE FROM tracks WHERE id = $1", [trackId]);
      fs.unlinkSync(audioPath);
      fs.unlinkSync(imgPath);
      return res.status(500).json({ message: "❌ Ошибка fingerprint" });
    }
  
    // 🧹 Удаляем временные файлы
    fs.unlinkSync(audioPath);
    fs.unlinkSync(imgPath);
  
    return res.status(201).json({ message: "✅ Трек добавлен в IPFS и базу", trackId });
});

// server.cjs
app.post('/api/market/sell', async (req, res) => {
  const { track_id, price, song_id } = req.body;

  if (!track_id || !price || !song_id) {
    return res.status(400).json({ message: "❌ Отсутствуют обязательные поля (track_id, price, song_id)" });
  }

  try {
    await pool.query(
      `UPDATE tracks
       SET is_for_sale = true,
           price = $1,
           is_sold = false,
           buyer_id = NULL,
           song_id = $2
       WHERE id = $3`,
      [price, song_id, track_id]
    );

    return res.status(200).json({ message: "✅ Трек выставлен на продажу и зарегистрирован в контракте" });
  } catch (error) {
    console.error("❌ Ошибка при продаже:", error);
    return res.status(500).json({ message: "❌ Внутренняя ошибка сервера" });
  }
});

app.post('/api/market/remove', async (req, res) => {
    const { track_id } = req.body;
  
    if (!track_id) {
      return res.status(400).json({ message: "❌ Отсутствует track_id" });
    }
  
    try {
      await pool.query(
        `UPDATE tracks
         SET is_for_sale = false, price = NULL, is_sold = false, buyer_id = NULL
         WHERE id = $1`,
        [track_id]
      );
  
      return res.status(200).json({ message: "✅ Трек снят с продажи" });
    } catch (error) {
      console.error("❌ Ошибка при снятии с продажи:", error);
      return res.status(500).json({ message: "❌ Внутренняя ошибка сервера" });
    }
});
  
app.post('/api/market/complete-purchase', async (req, res) => {
  const { song_id, new_owner_address } = req.body;

  if (!song_id || !new_owner_address) {
    return res.status(400).json({ message: "❌ Отсутствует song_id или адрес нового владельца" });
  }

  try {
    const userRes = await pool.query(
      `SELECT id, name FROM users WHERE LOWER(eth_address) = LOWER($1) LIMIT 1`,
      [new_owner_address]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ message: "❌ Пользователь с таким eth_address не найден" });
    }

    const newOwnerId = userRes.rows[0].id;
    const newAuthorName = userRes.rows[0].name;

    // 🔁 Обновляем владельца и автора
    await pool.query(
      `UPDATE tracks
       SET owner_id = $1,
           author_name = $2,
           is_for_sale = false,
           is_sold = true,
           buyer_id = $1
       WHERE song_id = $3`,
      [newOwnerId, newAuthorName, song_id]
    );

    // 📦 Теперь получаем обновлённую строку
    const finalTrack = await pool.query(`SELECT * FROM tracks WHERE song_id = $1`, [song_id]);

    res.status(200).json({
      message: "✅ Покупка завершена. Владелец и автор обновлены.",
      track: finalTrack.rows[0]
    });
  } catch (err) {
    console.error("❌ Ошибка в /complete-purchase:", err);
    res.status(500).json({ message: "Ошибка сервера при завершении покупки" });
  }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


