FROM python:3.13-slim

WORKDIR /app

RUN pip install --upgrade pip setuptools

COPY pyproject.toml /app
RUN pip install .

COPY src /app/src
RUN pip install .
