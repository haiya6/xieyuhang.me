FROM node:19.9.0-alpine3.18 AS build-stage

WORKDIR /app

RUN npm install pnpm@9.5.0 -g
COPY pnpm-lock.yaml ./
RUN echo -e "\nignore-scripts[]=simple-git-hooks" >> .npmrc
RUN pnpm fetch

COPY . .

RUN pnpm install --offline
RUN pnpm build

FROM nginx:alpine AS production-stage

ENV TZ="Asia/Shanghai"

WORKDIR /app
COPY --from=build-stage /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
