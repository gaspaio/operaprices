FROM node:7-alpine

RUN apk --no-cache add sqlite git && \
    git clone --depth 1 -b v2 https://github.com/gaspaio/operaprices.git /src && \
    cd /src/server && \
    yarn install && \
    apk del git

COPY entrypoint.sh /entrypoint.sh

WORKDIR /src

CMD [ "sh", "/entrypoint.sh" ]

