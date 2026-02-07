FROM oven/bun:alpine AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_API_STEP1_URL=/api/step1
ARG VITE_API_STEP2_URL=/api/step2
ENV VITE_API_STEP1_URL=$VITE_API_STEP1_URL
ENV VITE_API_STEP2_URL=$VITE_API_STEP2_URL
RUN bun run build

FROM nginx:alpine
RUN apk add --no-cache nodejs npm && npm install -g json-server@0.17.4
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/db-step1.json /app/db-step2.json /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/docker-entrypoint.sh"]
