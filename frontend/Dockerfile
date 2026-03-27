FROM node:20-bookworm-slim

WORKDIR /app

# Install a simple static server
RUN npm install -g serve

# Copy package files and install deps
COPY frontend/package*.json ./
RUN npm install

# Copy source and build
COPY frontend/ .
RUN npm run build

# Expose port
EXPOSE 5173

# Serve built app
CMD ["serve", "-s", "dist", "-l", "5173"]