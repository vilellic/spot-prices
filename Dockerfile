FROM alpine:latest

RUN apk add npm

WORKDIR /spot
COPY . /spot

RUN ln -s /data data

RUN npm install
RUN npx tsc

CMD node build/spot.js
