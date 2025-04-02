import os
import numpy as np
import psycopg2
import hashlib
import librosa
from config import DB_CONFIG

MAX_FINGERPRINTS = 7000  # 💡 ограничение общего количества хэшей

class FingerprintDB:
    def __init__(self):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.cursor = self.conn.cursor()

    def extract_fingerprints(self, file_path):
        try:
            y, sr = librosa.load(file_path, sr=None, mono=True)

            n_fft = 2048
            hop_length = 1024
            S = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length))
            fingerprints = []

            for t in range(S.shape[1]):
                # выбираем 2 самых сильных частотных пика
                peak_indices = np.argpartition(S[:, t], -2)[-2:]
                for freq_bin in peak_indices:
                    hash_input = f"{freq_bin}|{t}"
                    h = hashlib.sha1(hash_input.encode()).hexdigest()
                    time_offset = t * hop_length / sr
                    fingerprints.append((h, int(time_offset)))

                if len(fingerprints) >= MAX_FINGERPRINTS:
                    break

            return fingerprints
        except Exception as e:
            print(f"❌ Ошибка при извлечении отпечатков: {e}")
            return []

    def is_duplicate(self, file_path, threshold=0.4):  # 🔧 можно менять порог
        hashes = self.extract_fingerprints(file_path)
        if not hashes:
            return False

        match_counts = {}
        total = len(hashes)

        for h, _ in hashes:
            self.cursor.execute(
                "SELECT track_id FROM fingerprints WHERE hash = %s",
                (h,)
            )
            rows = self.cursor.fetchall()
            for row in rows:
                track_id = row[0]
                match_counts[track_id] = match_counts.get(track_id, 0) + 1

        if not match_counts:
            print(f"🔍 Совпадений: 0/{total} (0%)")
            return False

        most_similar_id = max(match_counts, key=match_counts.get)
        similarity = match_counts[most_similar_id] / total

        # безопасный вывод без эмодзи
        print(f"[MATCHES] {match_counts[most_similar_id]}/{total} ({similarity:.0%}) — matched with track ID {most_similar_id}")


        return similarity >= threshold

    def store_fingerprints(self, track_id, hashes):
        for h, offset in hashes:
            self.cursor.execute(
                "INSERT INTO fingerprints (track_id, hash, time_offset) VALUES (%s, %s, %s)",
                (track_id, h, int(offset))
            )
        self.conn.commit()
