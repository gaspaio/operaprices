FROM node:7-alpine

RUN apk --no-cache add sqlite git && \
    git clone --depth 1 -b v2 https://github.com/gaspaio/operaprices.git /src && \
    cd /src/server && yarn install && \
    cd /src/client && yarn install && yarn build && rm -rf client/node_modules \
    apk del git

COPY entrypoint.sh /entrypoint.sh

WORKDIR /src

ENTRYPOINT [ "sh", "/entrypoint.sh" ]

