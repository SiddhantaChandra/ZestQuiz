# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Install specific npm version and typescript globally
RUN npm install -g npm@11.3.0 typescript @nestjs/cli

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./

RUN npm install

COPY . .

# Debug and build
RUN echo "Contents of directory before build:" && \
    ls -la && \
    echo "Running NestJS build..." && \
    nest build && \
    echo "Contents of dist after build:" && \
    ls -la dist/ && \
    echo "Checking for main.js..." && \
    find dist/ -name "main.js" && \
    echo "Build complete!"

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

# Copy the built dist
COPY --from=development /usr/src/app/dist ./dist

# Debug dist contents
RUN echo "Contents of dist in production:" && \
    ls -la dist/ && \
    find dist/ -name "main.js" && \
    echo "Setup complete!"

# Simple fix: Run migrations and start the app
CMD npx prisma migrate deploy && node dist/main.js