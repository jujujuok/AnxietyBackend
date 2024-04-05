#clear all deprecated images
echo "###Clearing deprecated images###"
mkdir dockerImages
rm ./dockerImages/*
ssh root@212.132.100.147 "rm /root/anxiety/dockerImages/*"
cd dockerImages

#build and save images
echo "\n###Building and saving images###\n"
rm anxiety-api.tar
docker build -t anxiety-api ../anxiety
docker save anxiety-api:latest > anxiety-api.tar

rm product-warning-api.tar
docker build -t product-warning-api ../product-warning
docker save product-warning-api:latest > product-warning-api.tar

#copy images to server
echo "\n###Copying images to server###\n"
cd ..
scp dockerImages/* root@212.132.100.147:/root/anxiety/dockerImages

#load images on server
echo "\n###Loading images on server###\n"

## Shutdown and remove old images
ssh root@212.132.100.147 "cd /root/anxiety && docker compose down"
ssh root@212.132.100.147 "docker image remove anxiety-api:latest"
ssh root@212.132.100.147 "docker image remove product-warning-api:latest"

## Load new images
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/anxiety-api.tar"
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/product-warning-api.tar"

#run images on server
echo "\n###Running images on server###\n"
ssh root@212.132.100.147 "cd /root/anxiety && docker compose up -d"

echo "\n###Images updated###\n"