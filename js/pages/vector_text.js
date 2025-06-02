// Store file paths
let originalFilePath = '';
let modifiedFilePath = '';

// Function to save modified text as a file
function saveModifiedText() {
    const modifiedText = $('#modifiedText').val();
    if (!modifiedText) {
        alert('Модифицированный текст пуст');
        return;
    }

    const formData = new FormData();
    formData.append('text', modifiedText);
    formData.append('original_path', originalFilePath);

    $.ajax({
        url: '../php/upload_modified.php',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.error) {
                console.error('Ошибка:', response.error);
                $('#modifiedText').val('Ошибка при сохранении: ' + response.error);
                return;
            }
            modifiedFilePath = response.file_path;
            alert('Файл успешно сохранен: ' + modifiedFilePath);
        },
        error: function (xhr, status, error) {
            console.error('Ошибка при сохранении файла:', error);
            $('#modifiedText').val('Ошибка при сохранении файла: ' + error);
        }
    });
}

// Function to check synonymy
function checkSynonymy() {
    if (!originalFilePath || !modifiedFilePath) {
        alert('Оба файла должны быть загружены и сохранены');
        return;
    }

    $.ajax({
        url: 'http://localhost:5050/api/task',
        type: 'POST',
        data: JSON.stringify({
            task: 'vector_text',
            original_file_path: originalFilePath,
            modified_file_path: modifiedFilePath
        }),
        contentType: 'application/json',
        success: function (response) {
            console.log('Успешно отправлено на удаленный сервер:', response);
            // Mock response for demonstration (replace with actual response handling)
            $('#original-mvf').text(response.orginal_mvf.join(', '));
            $('#synonymous-mvf').text(response.synonymous_mvf.join(', '));
            $('#developer-value').text(response.developer_value);
        },
        error: function (xhr, status, error) {
            console.error('Ошибка при отправке на удаленный сервер:', error);
            $('#vector-results').html('Ошибка при получении результатов: ' + error);
        }
    });
}

// Modify the existing file upload handler to store originalFilePath
$(document).ready(function () {
    $('#file-upload').on('change', function (e) {
        let file = e.target.files[0];
        if (!file) {
            console.error('Файл не выбран');
            return;
        }

        let formData = new FormData();
        formData.append('file', file);

        $.ajax({
            url: '../php/upload.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.error) {
                    console.error('Ошибка:', response.error);
                    $('#originalText').val('Ошибка: ' + response.error);
                    return;
                }

                originalFilePath = response.file_path;
                $('#originalText').val(response.file_content);
                $('#modifiedText').val(response.file_content);
            },
            error: function (xhr, status, error) {
                console.error('Ошибка при загрузке файла:', error);
                $('#originalText').val('Ошибка при загрузке файла: ' + error);
            }
        });
    });
});