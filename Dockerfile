# Multi-stage build: React (Vite) → Nginx static host
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Optional override at build time, e.g. ws://host:5000
# Leave empty to use same-origin /ws (Nginx proxy) in production.
ARG VITE_WS_URL=
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# —— Production static server ——
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
