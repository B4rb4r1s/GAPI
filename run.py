import os
import time
import json
from datetime import datetime

# Функция обработки файла: подсчитывает слова и записывает результат в формате JSON
def process_file(input_path, output_path):
    # Читаем содержимое входного файла
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Разбиваем текст на слова (по пробелам) и подсчитываем их количество
        words = content.split()
        word_count = len(words)
    
    # Получаем текущее время в формате ISO 8601
    timestamp = datetime.now().isoformat()
    
    # Создаем словарь с данными для JSON по указанному шаблону
    result_data = {
        "status": "success",
        "result": "Task completed",
        "details": {
            "score": word_count,
            "message": "Processed successfully"
        },
        "timestamp": timestamp
    }
    
    # Записываем JSON в выходной файл
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result_data, f, indent=4)

# Множество для хранения имен уже обработанных файлов (с учетом подпапок)
processed = set()

# Бесконечный цикл мониторинга
while True:
    print('trigger is running')
    # Проходим по всем подпапкам от 1 до 16
    for folder_num in range(1, 17):
        input_folder = os.path.join('INPUT', str(folder_num))
        output_folder = os.path.join('OUTPUT', str(folder_num))
        
        # Проверяем, существуют ли папки
        if not os.path.exists(input_folder) or not os.path.exists(output_folder):
            continue
        
        # Получаем список всех .txt файлов в текущей подпапке INPUT
        current_files = [
            f for f in os.listdir(input_folder) 
            if os.path.isfile(os.path.join(input_folder, f)) and f.endswith('.txt')
        ]
        
        # Обрабатываем каждый новый файл
        for filename in current_files:
            # Ключ для отслеживания обработанных файлов (включает номер папки)
            file_key = f"{folder_num}/{filename}"
            if file_key not in processed:
                print(f'new file detected - {filename}')
                # Формируем полный путь к входному файлу
                input_path = os.path.join(input_folder, filename)
                # Формируем имя и путь для выходного файла с расширением .json
                result_filename = 'result_' + filename[:-4] + '.json'
                output_path = os.path.join(output_folder, result_filename)
                
                # Обрабатываем файл и добавляем его в множество обработанных
                process_file(input_path, output_path)
                print(f'results saved in {output_path}')
                processed.add(file_key)
    
    # Ждем n секунды перед следующей проверкой
    time.sleep(2)