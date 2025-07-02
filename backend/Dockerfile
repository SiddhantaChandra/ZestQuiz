# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Install specific npm version
RUN npm install -g npm@11.3.0

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

RUN npm install

COPY . .

# Build and verify the build output
RUN npm run build && \
    ls -la dist/ && \
    test -f dist/main.js || exit 1

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Install specific npm version
RUN npm install -g npm@11.3.0

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

RUN npm install --only=production

# Copy the built dist and necessary source files
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/src ./src

# Verify dist/main.js exists
RUN test -f dist/main.js || exit 1

# Simple fix: Run migrations and start the app
CMD npx prisma migrate deploy && node dist/main.js