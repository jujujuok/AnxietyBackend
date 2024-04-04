FROM node:lts-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build your TypeScript project
COPY . . 
RUN npm run build

# Expose application port
EXPOSE 8000

# Start your application
CMD ["node", "./dist/web/app.js"]