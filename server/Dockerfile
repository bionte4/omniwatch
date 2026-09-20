# OmniWatch WebSocket backend
FROM node:22-alpine

WORKDIR /app

# Lightweight install: only runtime dependency for the WS server
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY server ./server
COPY src/data ./src/data

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

EXPOSE 5000

CMD ["node", "server/websocket.js"]
