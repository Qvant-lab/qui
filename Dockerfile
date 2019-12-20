FROM node:12.8.1-alpine as build-stage
WORKDIR /app
COPY . .
RUN yarn install && yarn build-storybook

FROM nginx:alpine
EXPOSE 80

COPY --from=build-stage /.out /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf
CMD ["nginx", "-g", "daemon off;"]
