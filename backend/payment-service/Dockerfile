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
ENV PORT=5001
# ENV DB_HOST=localhost
# ENV DB_USER=root
# ENV DB_PASSWORD=
# ENV DB_NAME=gigflow_payments
# ENV RAZORPAY_KEY_ID=
# ENV RAZORPAY_KEY_SECRET=
# ENV GIG_SERVICE_URL=http://localhost:8082
# ENV NOTIFICATION_SERVICE_URL=http://localhost:8083

# Expose the port the app runs on (defaults to 5001)
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
