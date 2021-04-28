FROM node:8.16.1-alpine as BUILD

RUN apk add g++ make python && apk add git

ADD package.json .
ADD package-lock.json .
RUN npm ci
ADD . .

RUN node --expose-gc $(which npm) run-script build
RUN mkdir -p /kaniko/build && mv /build /kaniko/build/
RUN mkdir -p /kaniko/nginx && cp /nginx.conf /kaniko/nginx/
FROM nginx

RUN apt-get update
RUN apt-get install -y vim

COPY --from=BUILD /kaniko/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=BUILD /kaniko/build/** /html
COPY --from=BUILD /run.sh /run.sh

CMD ["bash", "/run.sh"]
