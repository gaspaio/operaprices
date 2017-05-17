CRAWLER_IMG = docker_crawler

# ENV: prod, dev
# S: system, web, crawler, app

# dev, prod
ifeq (${ENV}, 'prod')
	NODE_ENV = production
else
	NODE_ENV = development
endif

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
prodsh:
	@ssh -i ansible/secrets/prod root@104.196.180.35
up:
	@${ANSIBLE_CMD} -t $S ansible/playbook.yml

