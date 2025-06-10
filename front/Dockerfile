FROM php:7.4-apache

# Копируем файлы сайта в контейнер
# COPY . /var/www/html/
WORKDIR /app

# Устанавливаем права на чтение и запись
RUN chmod -R 755 /var/www/html/

# Запускаем Apache
CMD ["apache2-foreground"]