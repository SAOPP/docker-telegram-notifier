# Docker Telegram Notifier [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/soulassassin85/docker-telegram-notifier.svg)](https://hub.docker.com/r/soulassassin85/docker-telegram-notifier/builds)

A Telegram integration to notify Docker events from <b>multiple</b> docker hosts and <b>one</b> telegram bot. This service notifies about container `start`, `stop`, `restart` events, changes of Docker healthcheck status, and to which host and ip-address it connects, on which architecture and version the docker engine runs. If you wish you can add more event notifications in `templates.js` file see the section on templates.

## How to Run

[Set up a telegram bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and get the `Bot Token`. then add the bot to a group and make it admin and [extract the Chat ID](https://stackoverflow.com/a/32572159/882223).

Run a container as follows:

```sh
# local
docker run -d --env TELEGRAM_NOTIFIER_BOT_TOKEN=token --env TELEGRAM_NOTIFIER_CHAT_ID=chat_id --env DOCKER_HOSTNAME=raspberry --env DOCKER_IP_ADDRESS=192.168.0.2 --volume /var/run/docker.sock:/var/run/docker.sock:ro soulassassin85/docker-telegram-notifier

# remote
docker run -d --env TELEGRAM_NOTIFIER_BOT_TOKEN=token --env TELEGRAM_NOTIFIER_CHAT_ID=chat_id --env DOCKER_HOSTNAME=raspberry --env DOCKER_IP_ADDRESS=192.168.0.2 --env DOCKER_HOST=tcp://192.168.0.19:2375 soulassassin85/docker-telegram-notifier

# Docker Compose
curl -O https://raw.githubusercontent.com/soulassassin85/docker-telegram-notifier/master/docker-compose.yml
docker-compose up -d
```
## The main difference of this fork

You can receive a docker events notification from multiple docker-telegram-notifier instances to your 1 telegram bot.

Added two variables ```DOCKER_HOSTNAME``` and ```DOCKER_IP_ADDRESS``` to specify the HOST and its IP-ADDRESS subsequently these variables are passed to the telegram message  template, as well as to the connection string to the remote or local docker instance.

The architecture tag was added to the connection string on which the docker engine runs: like amd64, arm and etc.

It looks like this:

<img src="https://github.com/SAOPP/docker-telegram-notifier/blob/master/20210120-102335.png">

## Container tags

The ```master branch``` aka ```latest``` tag<br>
The ```develop branche``` aka ```dev``` tag

## Blacklist and Whitelist

You can suppress notifications from certain containers by adding a label `--label telegram-notifier.monitor=false` to them. If you want to receive notifications only from whitelisted containers, set `--env ONLY_WHITELIST=true` environment variable on the notifier instance, and `--label telegram-notifier.monitor=true` label on the containers you want to monitor.

## Remote docker instance

By default notifier connects to a local docker instance (don't forget to specify `--volume /var/run/docker.sock:/var/run/docker.sock:ro` for this case). But if you have monitoring and the service on the same host, you will not receive notifications if the host goes down. So I recommend to have monitoring separately.

Notifier accepts usual `DOCKER_HOST` and `DOCKER_CERT_PATH` environment variables to specify remote instance. For http endpoint you need to specify only `--env DOCKER_HOST=tcp://example.com:2375` (make sure to keep such instances behind the firewall). For https, you'll also need to mount a volume with https certificates that contains `ca.pem`, `cert.pem`, and `key.pem`: `--env DOCKER_HOST=tcp://example.com:2376 --env DOCKER_CERT_PATH=/certs --volume $(pwd):/certs`
Tutorial on how to generate docker certs can be found [here](https://docs.docker.com/engine/security/https/)

Also with the help of additional variables you can distinguish your hosts:
```
DOCKER_HOSTNAME=MyServer
DOCKER_IP_ADDRESS=192.168.0.20
```
These variables are arbitrary and serve to add additional clarifying information that you will see in messages from telegram bot.

## Supported Architectures

This image only supports work in the ```amd64``` environment.

## Templates of bot messages

The message templates are located in [templates.js](./templates.js) file and you can customize them if you want.

The default template now looks like this:

for start of container
```
<b>Host:</b> ${utils.getEnvVar("DOCKER_HOSTNAME")}
<b>IP:</b> ${utils.getEnvVar("DOCKER_IP_ADDRESS")}
<b>Container:</b> ${e.Actor.Attributes.name}\n
<b>Image:</b> ${e.Actor.Attributes.image}\n
<b>Has been started</b>
---
Host: adguard-pve
IP: 192.168.0.19
Container: adguard
Image: adguard/adguardhome:edge
Has been started
```
for stop of container
```
<b>Host:</b> ${utils.getEnvVar("DOCKER_HOSTNAME")}
<b>IP:</b> ${utils.getEnvVar("DOCKER_IP_ADDRESS")}
<b>Container:</b> ${e.Actor.Attributes.name}
<b>Image:</b> ${e.Actor.Attributes.image}
<b>Has been stopped</b>\n<b>Exit Code:</b>
${e.Actor.Attributes.exitCode}
---
Host: adguard-pve
IP: 192.168.0.19
Container: adguard
Image: adguard/adguardhome:edge
Has been stopped
Exit Code: 0
```
As I find free time, I plan to finalize the templates, including notifications about healthy and unhealthy status. You can suggest your own version.

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

## Run For Local Testing

When working with the code it is convenient and faster to build and run containers locally instead of having to build and deploy it to some hosting. To do this run following steps:

1. In the project root directory build image: `docker build . --tag=docker-test`
2. Run it: ```docker run -d --env TELEGRAM_NOTIFIER_BOT_TOKEN=XXXXX --env TELEGRAM_NOTIFIER_CHAT_ID=YYYYYY --env DOCKER_HOSTNAME=some-hostname --env DOCKER_IP_ADDRESS=127.0.0.1 --volume /var/run/docker.sock:/var/run/docker.sock:ro docker-test```
3. Run any other docker container, for example: `docker run hello-world`

## Credits

[arefaslani](https://github.com/arefaslani) for original idea.<br>
[poma](https://github.com/poma) for reworking the original version and move it to alpine image.<br>
[DB Tech](https://www.youtube.com/c/DBTechYT/about) for making a video review of this notifier, thanks buddy.<br>
[monkeber](https://github.com/monkeber) for help and implementation of idea with variables according to my thoughts, thanks homie.
