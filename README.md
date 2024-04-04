# AnxietyBackend

## Start Backend locally

### Build docker images

```bash
cd anxietyBackend/anxiety
docker build -t anxiety-api .

cd ../product-warning
docker build -t product-warning-api .

...
```

### Start docker compose

```bash
cd ..
docker compose up
```

Add the `-d` flag to run in detached mode.

## Update Images on Server

### Build and save images locally

```bash
docker build -t anxiety-api anxietyBackend/anxiety
docker save anxiety-api > anxiety-api.tar
scp anxiety-api.tar root@212.132.100.147:/root/anxiety/dockerImages

docker build -t product-warning-api anxietyBackend/product-warning
docker save product-warning-api > product-warning-api.tar
scp product-warning-api.tar root@212.132.100.147:/root/anxiety/dockerImages

...
```

### Load images on server

`ssh 212.132.100.147 -l root`

```bash
cd anxiety/dockerImages

docker load < anxiety-api.tar
docker load < product-warning-api.tar
...

cd ..
docker compose up -d
```
