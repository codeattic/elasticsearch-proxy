# elasticsearch-proxy

Proxy to log/audit users' requests between a Kibana instance and an Elasticsearch cluster.

## Install and run

Install third-party dependencies:

```bash
npm install
```    
    
Create globally-installed symbolic links:    
    
```bash
npm link
```    
    
By default _elasticsearch-proxy_ listens on port `9200` and forwards requests to Elasticsearch running on `http://elasticsearch:9200`.

Configure Kibana (see `kibana.yml`) to indicate where _elasticsearch-proxy_ is running: 
    
```yaml
elasticsearch.url: http://elasticsearch-proxy:9200
```
        
To start the proxy server:
        
```bash
elasticsearch-proxy            
```       
        
These are the environment variables (and their default values) that you can configure:

```bash
PROXY_ELASTICSEARCH_URL=http://elasticsearch:9200
PROXY_EXCLUDE_USERS=kibana
PROXY_LOGGER=console
PROXY_PORT=9200
```

## Docker

To build the docker image:

```bash
npm run-script docker
```
    
To start `elasticsearch-proxy` using docker:

```bash
docker run -d -P codeattic/elasticsearch-proxy
```

You can configure the proxy by modifing the environment variables described above or by changing the YAML configuration file at `/usr/share/elasticsearch-proxy/config/elasticsearch-proxy.yaml`:

```yaml
# Proxy port
port: 9200

# Elasticsearch URL
elasticsearchUrl: http://elasticsearch:9200

# Users to exclude from auditing
excludeUsers: [kibana]

# Logger
logger: console

# Auditing rules
rules:
  - include: ^/_msearch$
    request: jsonBulk
    response: jsonDocIds

  - include: ^/_mget$
    request: jsonDocIds
    response: jsonDocIds

  - include: /_search
    exclude: ^/.reporting
    request: json
    response: jsonDocIds
```

The environment variables override the corresponding settings from the configuration file.
