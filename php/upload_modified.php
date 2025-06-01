<?php
header('Content-Type: application/json');

if (isset($_POST['text']) && isset($_POST['original_path'])) {
    $text = $_POST['text'];
    $originalPath = $_POST['original_path'];

    // Get the directory from the original file path
    $uploadDir = dirname($originalPath) . '/';
    $originalFileName = basename($originalPath);
    $modifiedFileName = 'modified_' . $originalFileName;
    $modifiedFilePath = $uploadDir . $modifiedFileName;

    // Save the modified text to a new file
    if (file_put_contents($modifiedFilePath, $text) !== false) {
        echo json_encode([
            'file_path' => realpath($modifiedFilePath)
        ]);
    } else {
        echo json_encode(['error' => 'Ошибка при сохранении файла']);
    }
} else {
    echo json_encode(['error' => 'Текст или путь к исходному файлу не предоставлены']);
}
?>