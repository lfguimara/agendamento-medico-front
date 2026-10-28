# ---------- Estágio 1: build ----------
# Gera os arquivos estáticos (HTML, JS, CSS) com o Vite
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# O Vite embute a URL da API no JavaScript durante o build.
# Para outro ambiente: docker build --build-arg VITE_API_URL=https://api.exemplo.com .
ARG VITE_API_URL=http://localhost:3333
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Estágio 2: runtime ----------
# Só o nginx servindo os arquivos estáticos; roda sem root e escuta na 8080
FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# 127.0.0.1 e não "localhost": no Alpine, localhost resolve para IPv6 (::1) e o nginx escuta em IPv4
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
