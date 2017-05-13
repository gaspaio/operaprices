CRAWLER_IMG = docker_crawler

ENV = development
DC_CMD = docker-compose -f docker/${ENV}.yml

crawl:
	@docker run --rm -ti -v $(realpath data):/data -e "NODE_ENV=${ENV}" -e "OP_DB_NAME=${ENV}.db" ${CRAWLER_IMG} crawl

start:
	@${DC_CMD} up

build:
	@${DC_CMD} rm
	@${DC_CMD} build --no-cache

