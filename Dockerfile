FROM node:24-bookworm-slim
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8787 OFE_DATABASE=/app/var/ofe.sqlite
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY apps ./apps
COPY shared ./shared
RUN mkdir -p /app/var && chown node:node /app/var
EXPOSE 8787
CMD ["node", "server/container.cjs"]
