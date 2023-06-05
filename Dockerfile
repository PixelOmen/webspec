FROM python:3.10.11-bullseye
EXPOSE 80
COPY . /app
RUN pip install pipenv
WORKDIR /app/backend/db
RUN pipenv install --system --deploy
WORKDIR /app
RUN pipenv install --system --deploy
CMD ["python", "app.py"]