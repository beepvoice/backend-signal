FROM node:8.15.0-jessie-slim
ENV PORT 1937

WORKDIR /app
ADD . /app

RUN npm install

EXPOSE $PORT

CMD ["node", "index.js"]
