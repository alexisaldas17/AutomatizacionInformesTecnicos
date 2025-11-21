FROM node:22-alpine AS build

WORKDIR /app

# Copia solo package.json primero para aprovechar cache
COPY package*.json ./
RUN npm install

# Copia el resto del código
COPY . .

# Genera el build
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]