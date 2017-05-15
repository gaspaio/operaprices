CRAWLER_IMG = docker_crawler

# local, dev, prod
ifeq (${ENV}, 'prod')
	NODE_ENV = production
else
	NODE_ENV = development
endif

DC_CMD = docker-compose -f docker/${ENV}.yml

crawl:
	@docker run --rm -ti -v $(realpath data):/data -e "NODE_ENV=${NODE_ENV}" -e "OP_DB_NAME=${NODE_ENV}.db" ${CRAWLER_IMG} crawl

start:
	@${DC_CMD} up

build:
	@${DC_CMD} build --no-cache

systemup:
	@PYTHONUNBUFFERED=1 ANSIBLE_SSH_ARGS='-o StrictHostKeyChecking=no' ansible-playbook -v -i ansible/inventory -l ${ENV} ansible/playbook.system.yml
# ssh -i ansible/secrets/dev.private -o StrictHostKeyChecking=no root@192.168.33.10
