FROM node:7-alpine

ENV NODE_CONFIG_DIR /src/crawler/config
ENV OP_DATA_DIR /data

RUN apk --no-cache add sqlite git openssh-client && \
    git clone --depth 1 -b static-api https://github.com/gaspaio/operaprices.git /src && \
    cd /src/crawler && \
    yarn install

COPY entrypoint.sh /entrypoint.sh
COPY ssh /root/.ssh
COPY gitconfig /root/.gitconfig
RUN chmod 500 /root/.ssh && chmod 400 /root/.ssh/*

WORKDIR /src

CMD [ "start" ]

ENTRYPOINT [ "sh", "/entrypoint.sh" ]

