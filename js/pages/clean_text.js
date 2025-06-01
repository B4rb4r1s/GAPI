$(document).ready(function () {
    // Обработка изменения файла в input
    $('#file-upload').on('change', function (e) {
        // Получаем выбранный файл
        let file = e.target.files[0];
        if (!file) {
            console.error('Файл не выбран');
            return;
        }

        // Создаем FormData для отправки файла
        let formData = new FormData();
        formData.append('file', file);

        // Отправка файла на сервер
        $.ajax({
            url: '../php/upload.php', // Укажите ваш URL для обработки файла
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

                // Получаем содержимое файла из ответа
                let fileContent = response.file_content;
                let filePath = response.file_path;

                // Выводим содержимое файла в textarea (предполагается, что у вас есть textarea с id="originalText")
                $('#originalText').val(fileContent);
                $('#modifiedText').val(filePath);

                // Дополнительно: отправка пути файла на удаленный сервер (как в вашем предыдущем коде)
                $.ajax({
                    url: 'https://remote-server.com/api',
                    type: 'POST',
                    data: JSON.stringify({ file_path: filePath }),
                    contentType: 'application/json',
                    success: function (remoteResponse) {
                        console.log('Успешно отправлено на удаленный сервер:', remoteResponse);
                        // Обработка remoteResponse, если нужно (например, загрузка файла по fileUrl)
                        if (remoteResponse.fileUrl) {
                            $.ajax({
                                url: remoteResponse.fileUrl,
                                type: 'GET',
                                success: function (fileContent) {
                                    $('#modifiedText').val(fileContent);
                                    // Вызов функции сравнения, если требуется
                                    // compareTexts();
                                },
                                error: function (xhr, status, error) {
                                    console.error('Ошибка при загрузке файла по URL:', error);
                                    $('#modifiedText').val('Ошибка при загрузке файла: ' + error);
                                }
                            });
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