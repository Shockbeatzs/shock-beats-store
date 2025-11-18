# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./ || true
COPY . .
RUN npm install --production
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node","index.js"]
