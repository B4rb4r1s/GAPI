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
    
    # Выполнение третьей задачи
    if task == 'semantic_analysis':
        data = request.json

        task = data.get('task')
        folderpath = data.get('folderpath')
        doc_text = data.get('doc_text')
        print(f'[LOGGER] request task - {task}\
              \n[LOGGER] request folderpath - {folderpath}\
              \n[LOGGER] request doc_text - {doc_text}', flush=True)
        
        # Симуляция обработки и возвраю ответа в json
        #   пример обработки оболочки
        return jsonify({
  "documents": [
    {"id": 1, "doc_title": "Document 1", "doc_link": "https://example.com/doc1", "cosine_value": 0.8234, "arccosine_value": 0.6759},
    {"id": 2, "doc_title": "Document 2", "doc_link": "https://example.com/doc2", "cosine_value": 0.9123, "arccosine_value": 0.6759},
    {"id": 3, "doc_title": "Document 3", "doc_link": "https://example.com/doc3", "cosine_value": 0.7345, "arccosine_value": 0.6759},
    {"id": 4, "doc_title": "Document 4", "doc_link": "https://example.com/doc4", "cosine_value": 0.8765, "arccosine_value": 0.6759},
    {"id": 5, "doc_title": "Document 5", "doc_link": "https://example.com/doc5", "cosine_value": 0.6543, "arccosine_value": 0.6759},
    {"id": 6, "doc_title": "Document 6", "doc_link": "https://example.com/doc6", "cosine_value": 0.7890, "arccosine_value": 0.6759},
    {"id": 7, "doc_title": "Document 7", "doc_link": "https://example.com/doc7", "cosine_value": 0.9123, "arccosine_value": 0.6759},
    {"id": 8, "doc_title": "Document 8", "doc_link": "https://example.com/doc8", "cosine_value": 0.6789, "arccosine_value": 0.6759},
    {"id": 9, "doc_title": "Document 9", "doc_link": "https://example.com/doc9", "cosine_value": 0.8214, "arccosine_value": 0.6759},
    {"id": 10, "doc_title": "Document 10", "doc_link": "https://example.com/doc10", "cosine_value": 0.7345, "arccosine_value": 0.6759},
    {"id": 11, "doc_title": "Document 11", "doc_link": "https://example.com/doc11", "cosine_value": 0.8765, "arccosine_value": 0.6759},
    {"id": 12, "doc_title": "Document 12", "doc_link": "https://example.com/doc12", "cosine_value": 0.6543, "arccosine_value": 0.6759},
    {"id": 13, "doc_title": "Document 13", "doc_link": "https://example.com/doc13", "cosine_value": 0.7890, "arccosine_value": 0.6759},
    {"id": 14, "doc_title": "Document 14", "doc_link": "https://example.com/doc14", "cosine_value": 0.9123, "arccosine_value": 0.6759},
    {"id": 15, "doc_title": "Document 15", "doc_link": "https://example.com/doc15", "cosine_value": 0.6789, "arccosine_value": 0.6759}
  ]
})
    
    else:
        print(f'[LOGGER ERROR] 400 - Unknown task', flush=True)
        return jsonify({
            "error": "Unknown task"
            }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)