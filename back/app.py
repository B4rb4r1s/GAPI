from flask import Flask, request, jsonify
from flask_cors import CORS
import os   

app = Flask(__name__)
# Разрешаем запросы со всех источников (для разработки; в продакшене ограничьте)
CORS(app)

@app.route('/api/task', methods=['POST'])
def handle_task():

    # Получение запроса от Оболочки
    data = request.json
    task = data.get('task')
    
    # Выполнение первой задачи
    if task == 'clean_text':
        file_path = data.get('file_path')

        # Отделение относительного пути Оболочки ('/var/www/html/') 
        file_path = file_path[14:]
        
        print(f'[LOGGER] request task - {task}\
              \n[LOGGER] request file_path - {file_path}', flush=True)
        
        # Обработка ошибки 404
        if not os.path.exists(file_path):
            print(f'[LOGGER ERROR] 404 - File not found', flush=True)
            return jsonify({
                "code": "404",
                "message": "File not found"
                }), 404
        
        # Чтение переданного фала
        with open(file_path, 'r') as f:
            content = f.read()
            print(content)

        # Симуляция обработки и запись в STORAGE
        output_path = f'storage/result_{file_path.split("/")[-1]}.txt'
        with open(output_path, 'w') as f:
            f.write("Processed content\n")
            f.write(content)

        # Возврат ответа в json в поле fileUrl (как в оболочке - clean_text.js)
        return jsonify({
            "fileUrl": '../'+output_path
            })
    

    # Выполнение второй задачи
    elif task == 'vector_text':

        data = request.json

        task = data.get('task')
        original_file_path = data.get('original_file_path')
        modified_file_path = data.get('modified_file_path')
        print(f'[LOGGER] request task - {task}\
              \n[LOGGER] request original_file_path - {original_file_path}\
              \n[LOGGER] request modified_file_path - {modified_file_path}', flush=True)
        
        # Симуляция обработки и возвраю ответа в json
        return jsonify({
            "original_mvf":     [1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            "synonymous_mvf":   [1,1,1,2,1,1,1,1,1,0,1,1,1,1,2,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1],
            "developer_value":  0.89
            })
    
    
    # Выполнение третьей задачи
    elif task == 'semantic_analysis':
        data = request.json

        task = data.get('task')
        folderpath = data.get('folderpath')
        doc_text = data.get('doc_text')
        print(f'[LOGGER] request task - {task}\
              \n[LOGGER] request folderpath - {folderpath}\
              \n[LOGGER] request doc_text - {doc_text}', flush=True)
        
        # Симуляция обработки и возвраю ответа в json
        #   пример обработки разработчика
        return jsonify({
  "documents": [
    {"id": 1, "doc_title": "Document 1", "doc_link": "https://example.com/doc1", "developer_value": 0.8234},
    {"id": 2, "doc_title": "Document 2", "doc_link": "https://example.com/doc2", "developer_value": 0.9123},
    {"id": 3, "doc_title": "Document 3", "doc_link": "https://example.com/doc3", "developer_value": 0.7345},
    {"id": 4, "doc_title": "Document 4", "doc_link": "https://example.com/doc4", "developer_value": 0.8765},
    {"id": 5, "doc_title": "Document 5", "doc_link": "https://example.com/doc5", "developer_value": 0.6543},
    {"id": 6, "doc_title": "Document 6", "doc_link": "https://example.com/doc6", "developer_value": 0.7890},
    {"id": 7, "doc_title": "Document 7", "doc_link": "https://example.com/doc7", "developer_value": 0.9123},
    {"id": 8, "doc_title": "Document 8", "doc_link": "https://example.com/doc8", "developer_value": 0.6789},
    {"id": 9, "doc_title": "Document 9", "doc_link": "https://example.com/doc9", "developer_value": 0.8214},
    {"id": 10, "doc_title": "Document 10", "doc_link": "https://example.com/doc10", "developer_value": 0.7345},
    {"id": 11, "doc_title": "Document 11", "doc_link": "https://example.com/doc11", "developer_value": 0.8765},
    {"id": 12, "doc_title": "Document 12", "doc_link": "https://example.com/doc12", "developer_value": 0.6543},
    {"id": 13, "doc_title": "Document 13", "doc_link": "https://example.com/doc13", "developer_value": 0.7890},
    {"id": 14, "doc_title": "Document 14", "doc_link": "https://example.com/doc14", "developer_value": 0.9123},
    {"id": 15, "doc_title": "Document 15", "doc_link": "https://example.com/doc15", "developer_value": 0.6789}
  ]
})
    
    else:
        print(f'[LOGGER ERROR] 400 - Unknown task', flush=True)
        return jsonify({
            "error": "Unknown task"
            }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)