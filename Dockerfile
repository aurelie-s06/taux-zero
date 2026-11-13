# Image de mise en ligne de Taux Zéro (Next.js en mode « standalone » + SQLite)

# 1. Dépendances
FROM node:24-alpine AS dependances
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependances /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Image finale : seulement le nécessaire pour lancer le serveur
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/data/taux-zero.sqlite

# La base vit dans /data : c'est là que l'hébergeur doit monter un volume persistant
RUN mkdir -p /data && chown node:node /data

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Le serveur ne tourne pas en administrateur
USER node
EXPOSE 3000
CMD ["node", "server.js"]
