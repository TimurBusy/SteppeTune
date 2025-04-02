
import os
import sys
import psycopg2
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from fingerprint_engine import FingerprintDB
from config import UPLOADS_DIR, DB_CONFIG

def get_track_id_by_filename(filename):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute("SELECT id FROM tracks WHERE musicName = %s", (filename,))
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result[0] if result else None

def migrate_all_tracks():
    db = FingerprintDB()

    if not os.path.exists(UPLOADS_DIR):
        print(f"❌ Папка {UPLOADS_DIR} не найдена")
        return

    files = [f for f in os.listdir(UPLOADS_DIR) if f.endswith(('.mp3', '.wav'))]
    print(f"🔍 Найдено {len(files)} треков")

    for f in files:
        abs_path = os.path.join(UPLOADS_DIR, f)
        print(f"🎧 Обрабатываем: {f}")

        track_id = get_track_id_by_filename(f)
        if not track_id:
            print(f"⚠️ Нет в базе данных: {f}")
            continue

        if db.is_duplicate(abs_path):
            print(f"⚠️ Уже есть в базе: {f}")
            continue

        hashes = db.extract_fingerprints(abs_path)
        if hashes:
            db.store_fingerprints(track_id, hashes)
            print(f"✅ Отпечатки добавлены для: {f}")
        else:
            print(f"❌ Ошибка извлечения для: {f}")

if __name__ == "__main__":
    migrate_all_tracks()
