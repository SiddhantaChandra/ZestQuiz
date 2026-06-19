# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

RUN npm install -g npm@11.3.0 typescript @nestjs/cli

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN nest build
RUN npx tsc -p tsconfig.seed.json

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN npm install -g npm@11.3.0

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --omit=dev
RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

CMD sh -c "npx prisma migrate deploy && node dist/main.js"