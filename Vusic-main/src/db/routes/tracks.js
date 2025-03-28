const express = require("express");
const router = express.Router();
const db = require("../index"); // Подключаем существующую базу данных

// Получить все треки
router.get("/", async (req, res) => {
    try {
        const tracks = await db.query("SELECT * FROM tracks");
        res.json(tracks.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Получить треки определенного пользователя
router.get("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tracks = await db.query("SELECT * FROM tracks WHERE owner_id = $1", [id]);
        res.json(tracks.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Добавить новый трек
router.post("/", async (req, res) => {
    try {
        const { name, author_name, img, lang, timesPlayed, type, musicName, owner_id } = req.body;
        const newTrack = await db.query(
            "INSERT INTO tracks (name, author_name, img, lang, timesPlayed, type, musicName, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [name, author_name, img, lang, timesPlayed, type, musicName, owner_id]
        );
        res.status(201).json(newTrack.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
