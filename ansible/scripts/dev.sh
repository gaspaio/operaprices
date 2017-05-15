#!/bin/sh

sudo mkdir -p /root/.ssh/
sudo cat /vagrant/ansible/secrets/dev.public > /root/.ssh/authorized_keys
sudo chown -R root:root /root/.ssh
sudo chmod 600 /root/.ssh/*
sudo chmod 700 /root/.ssh

