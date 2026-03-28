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

# Expose the port the app runs on (defaults to 5000)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
