FROM node:18-alpine

WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++ gcc

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"] 