$(document).ready(function () {
    let currentData = [];
    let currentPage = 1;
    const rowsPerPage = 5;
    let sortColumn = 'doc_title';
    let sortDirection = 'asc';

    $('#uploadForm').on('change', function (e) {
        e.preventDefault();
        let files = e.target.files;
        let formData = new FormData();
        let folderName = '';

        if (!files.length) {
            // Если папка пуста, создаём пустой файл
            let emptyFile = new File([""], "empty.txt", { type: "text/plain" });
            formData.append('file', emptyFile);
            folderName = 'selected_folder';
        } else {
            // Используем первый файл и извлекаем имя папки
            formData.append('file', files[0]);
            let relativePath = files[0].webkitRelativePath;
            folderName = relativePath.split('/')[0];
        }

        formData.append('folder_name', folderName);

        $.ajax({
            url: '../php/upload2.php',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.error) {
                    $('#output').text('Ошибка: ' + response.error);
                    return;
                }
                // Формируем путь в стиле C:\folder_name
                let folderPath = 'C:\\' + response.folder_name;
                $('#output').text('Абсолютный путь к папке: ' + folderPath);
                // Получаем текст из textarea
                let docText = $('#mainText').val() || '';
                // Формируем JSON
                let jsonData = {
                    folderpath: folderPath,
                    doc_text: docText
                };

                console.log(jsonData)
                sendToServers(folderPath, docText);

            },
            error: function (xhr, status, error) {
                $('#output').text('Ошибка при загрузке: ' + error);
            }
        });
    });

    // Send data to both remote servers
    function sendToServers(folderPath, docText) {
        $('#processing').show();
        let jsonData = {
            task: 'semantic_analysis',
            folderpath: folderPath,
            doc_text: docText
        };

        let developerPromise = $.ajax({
            url: 'http://localhost:5050/api/task',
            type: 'POST',
            data: JSON.stringify(jsonData),
            contentType: 'application/json',
            dataType: 'json'
        });
        console.log(jsonData)

        let ourPromise = $.ajax({
            url: 'http://localhost:5051/api/task',
            type: 'POST',
            data: JSON.stringify(jsonData),
            contentType: 'application/json',
            dataType: 'json'
        });
        console.log(jsonData)

        Promise.all([developerPromise, ourPromise])
            .then(([developerResponse, ourResponse]) => {
                console.log('Developer Response:', developerResponse);
                console.log('Our Response:', ourResponse);
                combineAndDisplayData(developerResponse, ourResponse);
                $('#output').append('\nJSON отправлен на сервер: ' + JSON.stringify(jsonData));
                $('#processing').hide();
            })
            .catch(error => {
                console.error('Ошибка при отправке на серверы:', error);
                $('#output').append('\nОшибка при отправке JSON: ' + error);
                $('#processing').hide();
            });
    }

    // Combine data from both JSONs
    function combineAndDisplayData(developerData, ourData) {
        if (!developerData.documents || !ourData.documents) {
            $('#output').append('\nОшибка: Неверный формат ответа от серверов');
            return;
        }

        currentData = developerData.documents.map(devDoc => {
            let ourDoc = ourData.documents.find(doc => doc.id === devDoc.id);
            return {
                id: devDoc.id,
                doc_title: devDoc.doc_title || 'Unknown',
                doc_link: devDoc.doc_link || '#',
                developer_value: devDoc.developer_value || 0,
                cosine_value: ourDoc ? ourDoc.cosine_value : 0,
                arccosine_value: ourDoc ? ourDoc.arccosine_value : 0
            };
        });

        console.log('Combined Data:', currentData);
        updateTable();
        updateChart();
    }

    // Update table with pagination and sorting
    function updateTable() {
        let sortedData = [...currentData].sort((a, b) => {
            let valA = a[sortColumn];
            let valB = b[sortColumn];
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }
            if (sortDirection === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });

        let start = (currentPage - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedData = sortedData.slice(start, end);

        $('#tableBody').empty();
        if (paginatedData.length === 0) {
            $('#tableBody').append('<tr><td colspan="5">Нет данных для отображения</td></tr>');
        } else {
            paginatedData.forEach(doc => {
                $('#tableBody').append(`
                    <tr>
                        <td>${doc.doc_title}</td>
                        <td><a href="${doc.doc_link}" target="_blank">${doc.doc_link}</a></td>
                        <td>${doc.developer_value.toFixed(4)}</td>
                        <td>${doc.cosine_value.toFixed(4)}</td>
                        <td>${doc.arccosine_value.toFixed(4)}</td>
                    </tr>
                `);
            });
        }

        updatePagination(sortedData.length);
        updateChart();
    }

    // Update pagination
    function updatePagination(totalRows) {
        let totalPages = Math.ceil(totalRows / rowsPerPage);
        $('#pagination').empty();
        if (totalPages <= 1) return;

        $('#pagination').append(`<a href="#" data-page="${currentPage - 1}" ${currentPage === 1 ? 'style="display:none;"' : ''}>Предыдущая</a>`);
        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<a href="#" data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</a>`);
        }
        $('#pagination').append(`<a href="#" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'style="display:none;"' : ''}>Следующая</a>`);

        $('#pagination a').on('click', function (e) {
            e.preventDefault();
            let page = parseInt($(this).attr('data-page'));
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                updateTable();
            }
        });
    }

    // Initialize chart
    let chart = new Chart($('#comparisonChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Степень близости разработчика',
                    data: [],
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Референсная близость',
                    data: [],
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    // Update chart
    function updateChart() {
        let start = (currentPage - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedData = currentData.slice(start, end);

        chart.data.labels = paginatedData.map(doc => doc.doc_title);
        chart.data.datasets[0].data = paginatedData.map(doc => doc.developer_value);
        chart.data.datasets[1].data = paginatedData.map(doc => doc.cosine_value);
        chart.update();
    }

    // Handle sorting
    $('th[data-sort]').on('click', function () {
        let column = $(this).attr('data-sort');
        if (column === sortColumn) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        updateTable();
    });
});