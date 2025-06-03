<?php
header('Content-Type: application/json');

if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {

    $fileName = basename($_FILES['file']['name']);
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $allowedExtensions = ['json', 'txt'];

    if (!in_array($fileExtension, $allowedExtensions)) {
        echo json_encode(['error' => 'Недопустимый формат файла. Разрешены только JSON и TXT']);
        exit;
    }

    $uploadDir = '/var/www/html/storage/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filePath = $uploadDir . $fileName;

    // Перемещение загруженного файла
    if (move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
        $absolutePath = realpath($filePath);
        $fileContent = file_get_contents($filePath);
        if ($fileExtension === 'json') {
            $jsonContent = json_decode($fileContent, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $fileContent = json_encode($jsonContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            } else {
                echo json_encode(['error' => 'Невалидный JSON файл']);
                exit;
            }
        }

        echo json_encode([
            'file_path' => $absolutePath,
            'file_content' => $fileContent
        ]);
    } else {
        echo json_encode(['error' => 'Ошибка при сохранении файла']);
    }
} else {
    echo json_encode(['error' => 'Файл не загружен или произошла ошибка']);
}
?>