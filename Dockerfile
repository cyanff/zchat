FROM node:lts-alpine AS builder

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
RUN npm prune --prod

FROM builder AS deployer

WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
COPY .env.production .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "--env-file=.env.production", "build" ]