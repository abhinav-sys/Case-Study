# Frontend Dockerfile (React)
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la /app/build || (echo "ERROR: Build directory not found!" && exit 1)
RUN ls -la /app/build/index.html || (echo "ERROR: index.html not found in build!" && exit 1)
RUN echo "Build verification: Files in /app/build:" && ls -la /app/build/

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html/ || (echo "ERROR: Files not copied to nginx!" && exit 1)
RUN echo "Nginx html directory contents:" && ls -la /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

