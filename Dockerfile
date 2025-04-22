FROM node:22-slim as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY next.config.js ./next.config.js
COPY tsconfig.json ./tsconfig.json

COPY src ./src

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
