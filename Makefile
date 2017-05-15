CRAWLER_IMG = docker_crawler

# local, dev, prod
ifeq (${ENV}, 'prod')
	NODE_ENV = production
else
	NODE_ENV = development
endif

S = crawler
DC_CMD = docker-compose -f docker/docker-compose.yml -f docker/${ENV}.yml

crawl:
	@docker run --rm -ti -v $(realpath data):/data -e "NODE_ENV=${NODE_ENV}" -e "OP_DB_NAME=${NODE_ENV}.db" ${CRAWLER_IMG} crawl

start:
	@${DC_CMD} up

build:
	@${DC_CMD} build --no-cache $S

devup:
	@vagrant up --provision

systemup:
	@PYTHONUNBUFFERED=1 ANSIBLE_SSH_ARGS='-o StrictHostKeyChecking=no' ansible-playbook -v -i ansible/inventory -l ${ENV} ansible/playbook.system.yml

deploy:
	@${CD_CMD} up --no-deps -d S

