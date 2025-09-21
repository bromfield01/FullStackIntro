FROM node:20 as build
ARG VITE_BACKEND_URL=https://symmetrical-disco-x96j6v4jgp926qqj-3001.app.github.dev/api/v1
WORKDIR /build
COPY package.json .
COPY package-lock.json .
RUN  npm install
COPY . .

RUN npm run build

FROM nginx as final
WORKDIR /usr/share/nginx/html
COPY --from=build /build/dist .


