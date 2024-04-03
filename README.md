# AnxietyBackend

## Start Backend locally

### Build docker images

```bash
cd anxietyBackend/anxiety
docker build -t anxiety-api .

cd ../product-warning
docker build -t product-warning-api .
```

### Start docker compose

```bash
cd ..
docker compose up
```

Add the `-d` flag to run in detached mode.
