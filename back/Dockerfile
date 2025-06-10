FROM python:3.9

RUN apt-get update && apt-get install
RUN apt-get install nano apache2 -y
RUN pip install flask flask-cors

RUN chmod -R 755 /var/www/html/

WORKDIR /app

# CMD [ "apache2-foreground", "&&", "python", "run.py" ]
# CMD [ "python", "run.py" ]