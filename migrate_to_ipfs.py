import os
import psycopg2
import subprocess

UPLOADS_DIR = r'C:\Users\1\Desktop\figma\uploads'

# 🔧 Настройки подключения к БД
conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='1234',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# 📥 Загружаем все треки, где ещё нет IPFS
cursor.execute("SELECT id, img, musicname FROM tracks WHERE music_ipfs IS NULL")

def upload_via_cli(file_path):
    if not os.path.isfile(file_path):
        print(f"[!] Файл не найден: {file_path}")
        return None

    try:
        result = subprocess.run(
            [r'C:\Users\1\AppData\Roaming\npm\w3.cmd', 'up', file_path],
            capture_output=True,
            text=True,
            check=True
        )
        for line in result.stdout.splitlines():
            if "https://" in line and "/ipfs/" in line:
                return "ipfs://" + line.split("/ipfs/")[1]
        return None
    except subprocess.CalledProcessError as e:
        print(f"[!] Ошибка при загрузке {file_path}: {e.stderr}")
        return None

for row in cursor.fetchall():
    track_id, img_file, music_file = row
    print(f"[+] Обработка трека ID {track_id}")

    img_path = os.path.join(UPLOADS_DIR, img_file)
    music_path = os.path.join(UPLOADS_DIR, music_file)

    img_ipfs = upload_via_cli(img_path)
    music_ipfs = upload_via_cli(music_path)

    if img_ipfs and music_ipfs:
        cursor.execute("""
            UPDATE tracks
            SET img_ipfs = %s, music_ipfs = %s
            WHERE id = %s
        """, (img_ipfs, music_ipfs, track_id))
        conn.commit()
