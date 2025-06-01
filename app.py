from flask import Flask, request, jsonify
from flask_cors import CORS
import os   

app = Flask(__name__)
# Разрешаем запросы со всех источников (для разработки; в продакшене ограничьте)
CORS(app)

@app.route('/api/task', methods=['POST'])
def handle_task():
    data = request.json

    task = data.get('task')
    file_path = data.get('file_path')
    print(f'[LOGGER] request task - {task}\n[LOGGER] request file_path - {file_path}', flush=True)
    file_path = file_path[14:]

    if not os.path.exists(file_path):
        print(f'[LOGGER ERROR] 404 - File not found', flush=True)
        return jsonify({
            "error": "File not found"
            }), 404
    
    if task == 'clean_text':
        print(f'[LOGGER] task - clean_text', flush=True)
        # Чтение переданного фала
        with open(file_path, 'r') as f:
            content = f.read()
            print(content)

        # Симуляция обработки и запись в OUTPUT
        output_path = f'INPUT/result_2.txt'
        with open(output_path, 'w') as f:
            f.write("Processed content\n")
            f.write(content)

        # "fileUrl": "/var/www/html/php/uploads/1.txt"
        # "fileUrl": "/var/www/html/OUTPUT/output.txt"
        return jsonify({
            "fileUrl": "INPUT/result_2.txt"
            })
    
    elif task == 'vector_text':
        # Симуляция обработки
        return jsonify({
            "original_mvf": [1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            "synonymous_mvf": [1,1,1,2,1,1,1,1,1,0,1,1,1,1,2,1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1],
            "developer_value": 0.89
            })
    
    elif task == 'semantic_analysis':
        # Симуляция обработки
        return jsonify({
            "documents": [
                {
                "document_id": "1",
                "document_name": "Document 1",
                "document_link": "C:\\Local_storage\\Document 1.docx",
                "developer_value": 0.89
                }
            ]
            })
    
    else:
        print(f'[LOGGER ERROR] 400 - Unknown task', flush=True)
        return jsonify({
            "error": "Unknown task"
            }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)