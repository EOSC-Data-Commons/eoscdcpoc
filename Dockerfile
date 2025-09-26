FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create a minimal image with just the build artifacts
FROM alpine:latest
COPY --from=build /app/dist/spa /webapp
