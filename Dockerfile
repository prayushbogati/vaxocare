FROM node:26-alpine3.23 as builder 
WORKDIR /vaxocare
COPY ./package*.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /vaxocare/dist /usr/share/nginx/html 