$(document).ready(function () {
    // Обработка загрузки файла
    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();

        // Очищаем textarea для загруженного файла
        $('#fileContent').val('');

        // Создаем FormData для отправки файла
        let formData = new FormData(this);

        // Отправка файла на сервер PHP
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
                // Получаем абсолютный путь и содержимое файла
                let filePath = response.file_path;
                let fileContent = response.file_content;

                // Выводим содержимое файла в textarea
                // $('#originalText').val(fileContent);

                // Выводим содержимое файла в textarea (предполагается, что у вас есть textarea с id="originalText")
                $('#originalText').val(fileContent);
                $('#modifiedText').val(filePath);

                // Отправка пути на удаленный сервер
                $.ajax({
                    url: 'http://localhost:5050/api/task',
                    type: 'POST',
                    data: JSON.stringify({ task: 'clean_text', file: filePath }),
                    contentType: 'application/json',
                    success: function (remoteResponse) {
                        console.log('Успешно отправлено на удаленный сервер:', remoteResponse);
                        // Предполагаем, что remoteResponse содержит JSON с fileUrl
                        if (remoteResponse.fileUrl) {
                            // Загружаем содержимое файла по URL
                            $.ajax({
                                url: remoteResponse.fileUrl,
                                type: 'GET',
                                success: function (fileContent) {
                                    // Выводим содержимое файла в modifiedText
                                    $('#modifiedText').val(fileContent);
                                    // Вызываем сравнение текстов после загрузки
                                    compareTexts();
                                },
                                error: function (xhr, status, error) {
                                    console.error('Ошибка при загрузке файла по URL:', error);
                                    $('#modifiedText').val('Ошибка при загрузке файла: ' + error);
                                }
                            });
                        } else {
                            console.error('URL файла не найден в ответе:', remoteResponse);
                            $('#modifiedText').val('Ошибка: URL файла не найден');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Ошибка при отправке на удаленный сервер:', error);
                        $('#modifiedText').val('Ошибка при отправке на сервер: ' + error);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error('Ошибка при загрузке файла:', error);
                $('#originalText').val('Ошибка при загрузке файла: ' + error);
            }
        });
    });
});

function compareTexts() {
    const originalText = document.getElementById('originalText').value;
    const modifiedText = document.getElementById('modifiedText').value;
    const comparisonDiv = document.getElementById('comparison');

    if (!originalText || !modifiedText) {
        comparisonDiv.innerHTML = '<p>Пожалуйста, заполните оба текстовых поля.</p>';
        return;
    }

    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(originalText, modifiedText);
    dmp.diff_cleanupSemantic(diffs);

    let htmlOutput = '';
    for (let i = 0; i < diffs.length; i++) {
        const op = diffs[i][0]; // Operation: -1 = delete, 0 = equal, 1 = insert
        let text = diffs[i][1]
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        if (op === -1) {
            // For deletions, replace spaces and newlines with visible markers
            text = text
                .replace(/ /g, '<span class="deleted-space">__</span>')
                .replace(/\n/g, '<span class="deleted-newline">¶</span>');
            htmlOutput += `<span class="deletion">${text}</span>`;
        } else if (op === 1) {
            // For insertions, replace spaces and newlines with visible markers
            text = text
                .replace(/ /g, '<span class="inserted-space">__</span>')
                .replace(/\n/g, '<span class="inserted-newline">¶</span>');
            htmlOutput += `<span class="insertion">${text}</span>`;
        } else {
            // For unchanged text, only convert newlines to <br>
            text = text.replace(/\n/g, '<br>');
            htmlOutput += text;
        }
    }

    comparisonDiv.innerHTML = htmlOutput;
}