FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy all files from your project
COPY . .

# Install dependencies and build the application
RUN npm ci
RUN npm run build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port the app will run on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]