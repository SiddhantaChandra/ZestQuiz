# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

# Install specific npm version
RUN npm install -g npm@11.3.0

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Explicitly run the build and verify dist exists
RUN npm run build && ls -la dist/

# Production stage
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Install specific npm version
RUN npm install -g npm@11.3.0

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production

# Copy the built dist from development stage
COPY --from=development /usr/src/app/dist ./dist
# Copy the source files needed for proper module resolution
COPY --from=development /usr/src/app/src ./src
# Verify dist exists
RUN ls -la dist/

# Simple fix: Run migrations and start the app
CMD npx prisma migrate deploy && node dist/main.js