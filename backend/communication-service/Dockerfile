# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set default environment variables (can be overridden at runtime)
ENV PORT=5000
# ENV DB_HOST=127.0.0.1
# ENV DB_USER=root
# ENV DB_PASSWORD=
# ENV DB_NAME=communication_db

# Expose the port the app runs on (defaults to 5000)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
