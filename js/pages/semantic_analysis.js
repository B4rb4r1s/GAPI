$(document).ready(function () {
    let currentData = [];
    let currentPage = 1;
    const rowsPerPage = 5;
    let sortColumn = 'doc_title';
    let sortDirection = 'asc';

    // Handle folder upload
    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();
        let files = $('#folderInput')[0].files;
        let formData = new FormData();
        let folderName = '';

        if (!files.length) {
            let emptyFile = new File([""], "empty.txt", { type: "text/plain" });
            formData.append('file', emptyFile);
            folderName = 'selected_folder';
        } else {
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

                let folderPath = 'C:\\' + response.folder_name;
                $('#output').text('Абсолютный путь к папке: ' + folderPath);
                sendToServers(folderPath);
            },
            error: function (xhr, status, error) {
                $('#output').text('Ошибка при загрузке: ' + error);
            }
        });
    });

    // Handle text file upload
    $('#textUploadForm').on('submit', function (e) {
        e.preventDefault();
        let file = $('#textFileInput')[0].files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#mainText').val(e.target.result);
                $('#textFileStatus').text('Файл загружен: ' + file.name);
                let folderPath = $('#output').text().replace('Абсолютный путь к папке: ', '');
                if (folderPath !== 'Абсолютный путь к папке появится здесь...') {
                    sendToServers(folderPath);
                }
            };
            reader.readAsText(file);
        }
    });

    // Send data to both remote servers
    function sendToServers(folderPath) {
        $('#processing').show();
        let docText = $('#mainText').val() || '';
        let jsonData = {
            folderpath: folderPath,
            doc_text: docText
        };

        let developerPromise = $.ajax({
            url: 'https://remote-server.com/api',
            type: 'POST',
            data: JSON.stringify(jsonData),
            contentType: 'application/json',
            dataType: 'json'
        });

        let ourPromise = $.ajax({
            url: 'https://remote-server2.com/api',
            type: 'POST',
            data: JSON.stringify(jsonData),
            contentType: 'application/json',
            dataType: 'json'
        });

        Promise.all([developerPromise, ourPromise])
            .then(([developerResponse, ourResponse]) => {
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
        currentData = developerData.documents.map(devDoc => {
            let ourDoc = ourData.documents.find(doc => doc.id === devDoc.id);
            return {
                id: devDoc.id,
                doc_title: devDoc.doc_title,
                doc_link: devDoc.doc_link,
                developer_value: devDoc.developer_value,
                cosine_value: ourDoc ? ourDoc.cosine_value : 0,
                arccosine_value: ourDoc ? ourDoc.arccosine_value : 0
            };
        });

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
    let chart = new Chart($('#combinedChart'), {
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