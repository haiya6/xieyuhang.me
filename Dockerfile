FROM node:19.9.0-alpine3.18 as build-stage

WORKDIR /app

COPY . .

RUN npm install pnpm@9.5.0 -g
RUN pnpm install
RUN pnpm build

FROM nginx:alpine as production-stage

WORKDIR /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8001

CMD ["nginx", "-g", "daemon off;"]
