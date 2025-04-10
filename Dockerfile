# Stage 1: Build the application
FROM node:23-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG ENVIRONMENT=devnet
ENV ENVIRONMENT=${ENVIRONMENT}

RUN npm run build


# Stage 2: Create the production image
FROM node:23-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD [ "node", "dist/index.js" ]