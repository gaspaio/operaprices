CRAWLER_IMG = docker_crawler

# local, dev, prod
ifeq (${ENV}, 'prod')
	NODE_ENV = production
else
	NODE_ENV = development
endif

S = crawler
DC_CMD = docker-compose -f docker/docker-compose.yml -f docker/${ENV}.yml
ANSIBLE_CMD = PYTHONUNBUFFERED=1 ANSIBLE_SSH_ARGS='-o StrictHostKeyChecking=no' ansible-playbook -v -i ansible/inventory -l ${ENV}

crawl:
	@docker run --rm -ti -v $(realpath data):/data -e "NODE_ENV=${NODE_ENV}" -e "OP_DB_NAME=${NODE_ENV}.db" ${CRAWLER_IMG} crawl

start:
	@${DC_CMD} up

build:
	@${DC_CMD} build --no-cache $S

deploy:
	@${DC_CMD} up --no-deps -d $S

devup:
	@vagrant up --provision

systemup:
	@${ANSIBLE_CMD} ansible/playbook.system.yml

crawlerup:
	@${ANSIBLE_CMD} ansible/playbook.app.yml

