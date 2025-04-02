import sys
import os

# 👇 Добавляем текущую папку в PYTHONPATH, чтобы видеть fingerprint_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fingerprint_engine import FingerprintDB

def main():
    if len(sys.argv) < 3:
        print("ERROR: Неверные аргументы.\n")
        print("  ▶ python fingerprint_handler.py check path/to/file")
        print("  ▶ python fingerprint_handler.py add path/to/file track_id")
        sys.exit(1)

    mode = sys.argv[1]
    file_path = sys.argv[2]

    if not os.path.exists(file_path):
        print("ERROR: Файл не найден:", file_path)
        sys.exit(1)

    db = FingerprintDB()

    if mode == "check":
        if db.is_duplicate(file_path):
            print("DUPLICATE")
        else:
            print("OK")

    elif mode == "add":
        if len(sys.argv) < 4:
            print("ERROR: Укажи track_id для режима add")
            sys.exit(1)

        track_id = int(sys.argv[3])
        hashes = db.extract_fingerprints(file_path)

        if hashes:
            db.store_fingerprints(track_id, hashes)
            print("OK")
        else:
            print("ERROR: Отпечатки не извлечены")

    else:
        print("ERROR: Неизвестный режим:", mode)
        sys.exit(1)

if __name__ == "__main__":
    main()
