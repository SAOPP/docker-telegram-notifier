# Docker Telegram Notifier [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/soulassassin85/docker-telegram-notifier.svg)](https://hub.docker.com/r/soulassassin85/docker-telegram-notifier/builds)

A Telegram integration to notify Docker events. This service notifies about container `start`, `stop`, `restart` events, and changes of Docker healthcheck status. If you wish you can add more event notifications in `templates.js` file.

## How to Run

[Set up a telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and get the `Bot Token`. then add the bot to a group and make it admin and [extract the Chat ID](https://stackoverflow.com/a/32572159/882223).

Run a container as follows:

```sh
# Docker
docker run -d --env TELEGRAM_NOTIFIER_BOT_TOKEN=token --env TELEGRAM_NOTIFIER_CHAT_ID=chat_id --volume /var/run/docker.sock:/var/run/docker.sock:ro soulassassin85/docker-telegram-notifier

# Docker Compose
curl -O https://raw.githubusercontent.com/soulassassin85/docker-telegram-notifier/master/docker-compose.yml
docker-compose up -d
```
## The main difference of this fork

You can receive a docker events notification from multiple docker-telegram-notifier instances to your 1 telegram bot.

Added two variables DOCKER_HOSTNAME and DOCKER_IP_ADDRESS to specify the HOST and its IP-ADDRESS subsequently these variables are passed to the telegram message  template, as well as to the connection string to the remote or local docker instance.

The architecture tag was added to the connection string on which the docker engine runs: like amd64, arm and etc.

It looks like this:

<img src="https://github.com/SAOPP/docker-telegram-notifier/blob/master/20210120-102335.png">

## Blacklist and Whitelist

You can suppress notifications from certain containers by adding a label `--label telegram-notifier.monitor=false` to them. If you want to receive notifications only from whitelisted containers, set `--env ONLY_WHITELIST=true` environment variable on the notifier instance, and `--label telegram-notifier.monitor=true` label on the containers you want to monitor.

## Remote docker instance

By default notifier connects to a local docker instance (don't forget to specify `--volume /var/run/docker.sock:/var/run/docker.sock:ro` for this case). But if you have monitoring and the service on the same host, you will not receive notifications if the host goes down. So I recommend to have monitoring separately.

Notifier accepts usual `DOCKER_HOST` and `DOCKER_CERT_PATH` environment variables to specify remote instance. For http endpoint you need to specify only `--env DOCKER_HOST=tcp://example.com:2375` (make sure to keep such instances behind the firewall). For https, you'll also need to mount a volume with https certificates that contains `ca.pem`, `cert.pem`, and `key.pem`: `--env DOCKER_HOST=tcp://example.com:2376 --env DOCKER_CERT_PATH=/certs --volume $(pwd):/certs`
Tutorial on how to generate docker certs can be found [here](https://docs.docker.com/engine/security/https/)

## Supported Architectures

This image only supports work in the amd64 environment.

## docker-compose

Here is example of stack:

```
version: 2

services:

# local docker instance
  telegram-notifier-local:
    image: soulassassin85/docker-telegram-notifier
    container_name: telegram-notifier-local
    hostname: telegram-notifier-local
    environment:
      - TZ=Europe/Kiev
      - DOCKER_HOSTNAME=portainer-pve
      - DOCKER_IP_ADDRESS=192.168.0.30
      - TELEGRAM_NOTIFIER_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
      - TELEGRAM_NOTIFIER_CHAT_ID=YOUR_CHAT_ID_HERE
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped

# remote docker instance #1
  telegram-notifier-adguard:
    image: soulassassin85/docker-telegram-notifier
    container_name: telegram-notifier-adguard
    hostname: telegram-notifier-adguard
    environment:
      - TZ=Europe/Kiev
      - DOCKER_HOSTNAME=adguard-pve
      - DOCKER_IP_ADDRESS=192.168.0.19
      - DOCKER_HOST=tcp://192.168.0.19:2375
      - TELEGRAM_NOTIFIER_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
      - TELEGRAM_NOTIFIER_CHAT_ID=YOUR_CHAT_ID_HERE
    restart: unless-stopped

# remote docker instance #2
  telegram-notifier-rpi-zb-gw-stage:
    image: soulassassin85/docker-telegram-notifier
    container_name: telegram-notifier-rpi-zb-gw-stage
    hostname: telegram-notifier-rpi-zb-gw-stage
    environment:
      - TZ=Europe/Kiev
      - DOCKER_HOSTNAME=rpi-zb-gw-stage
      - DOCKER_IP_ADDRESS=192.168.0.27
      - DOCKER_HOST=tcp://192.168.0.27:2375
      - TELEGRAM_NOTIFIER_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
      - TELEGRAM_NOTIFIER_CHAT_ID=YOUR_CHAT_ID_HERE
    restart: unless-stopped
```
For docker-compose examples see comments in [docker-compose.yml](./docker-compose.yml) file also.

## Credits

[arefaslani](https://github.com/arefaslani) for original idea.<br>
[poma](https://github.com/poma) for reworking the original version and move it to alpine image.<br>
[monkeber](https://github.com/monkeber) for help and implementation of idea with variables according to my thoughts, thanks homie.
