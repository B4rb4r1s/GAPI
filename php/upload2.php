<?php
header('Content-Type: application/json');

// Проверяем, отправлено ли имя папки
if (empty($_POST['folder_name'])) {
    echo json_encode(['error' => 'Имя папки не отправлено']);
    exit;
}

// Получаем имя папки
$folderName = $_POST['folder_name'];

// Проверяем, отправлен ли файл (для валидности запроса)
if (empty($_FILES['file'])) {
    echo json_encode(['error' => 'Файл не отправлен']);
    exit;
}

// Возвращаем имя папки
echo json_encode(['folder_name' => $folderName]);
?>