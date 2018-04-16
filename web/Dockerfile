FROM python:3.6.1

RUN apt-get update && apt-get install -y python-dev libldap2-dev libsasl2-dev libssl-dev gcc

COPY requirements.txt requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir /app