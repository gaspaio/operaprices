# ENV: prod, dev
# S: system, crawler
# T: image version for build and pushes

ANSIBLE_CMD = PYTHONUNBUFFERED=1 ANSIBLE_SSH_ARGS='-o StrictHostKeyChecking=no' ansible-playbook -v -i ansible/inventory -l ${ENV}

crawl:
	@cd crawler && yarn crawler:crawl:dev

webpush:
	@./scripts/webpush.sh
build:
	@docker build --force-rm --no-cache -t eu.gcr.io/operaprices/crawler:$T docker/crawler
push:
	@gcloud docker -- push eu.gcr.io/operaprices/crawler:$T
prodsh:
	@ssh -i ansible/secrets/prod root@operaprices.rodolforipado.net
up:
	@${ANSIBLE_CMD} -t $S ansible/playbook.yml

vminit:
	vagrant up
	${ANSIBLE_CMD} -t system ansible/playbook.yml
vmstart: vminit dbup
	scp -i ansible/secrets/dev.private data/development.db root@192.168.33.10:/data/
	${ANSIBLE_CMD} -t crawler ansible/playbook.yml

dbup:
	[ -f data/development.db ] && mv data/development.db data/development.db.bak || true
	scp -i ansible/secrets/prod root@operaprices.rodolforipado.net:/data/production.db data/development.db
jsonup:
	rm -r client/static/json/*
	scp -r -i ansible/secrets/prod root@operaprices.rodolforipado.net:/data/json/* client/static/json/

dbexport:
	@./scripts/dbexport.sh
sqlsh:
	@sqlite3 data/development.db
