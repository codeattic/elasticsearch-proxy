FROM node:7.7
LABEL maintainer "juan.hernandez@codeattic.net"

EXPOSE 9200

ADD [".", "/usr/share/elasticsearch-proxy"]

WORKDIR /usr/share/elasticsearch-proxy
CMD ["node", "./lib/cli.js"]
