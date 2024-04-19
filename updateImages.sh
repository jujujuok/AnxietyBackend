#clear all deprecated images
##local
echo "###Clearing deprecated images###"
mkdir dockerImages
rm ./dockerImages/*
ssh root@212.132.100.147 "rm /root/dockerImages/*"
cd dockerImages

##remote
ssh root@212.132.100.147 "cd /root && docker compose down"
ssh root@212.132.100.147 "docker image remove anxiety-api:latest"
ssh root@212.132.100.147 "docker image remove product-warning-api:latest"
ssh root@212.132.100.147 "docker image remove nina-api:latest"
ssh root@212.132.100.147 "docker image remove autobahn-api:latest"
ssh root@212.132.100.147 "docker image remove dwd-api:latest"

#build and save images
echo "\n###Building and saving images###\n"
rm anxiety-api.tar
docker build -t anxiety-api ../anxiety
docker save anxiety-api:latest > anxiety-api.tar

rm product-warning-api.tar
docker build -t product-warning-api ../product-warning
docker save product-warning-api:latest > product-warning-api.tar

rm nina-api.tar
docker build -t nina-api ../nina
docker save nina-api:latest > nina-api.tar

rm autobahn-api.tar
docker build -t autobahn-api ../autobahn
docker save autobahn-api:latest > autobahn-api.tar

rm dwd-api.tar
docker build -t dwd-api ../dwd
docker save dwd-api:latest > dwd-api.tar

#copy images to server
echo "\n###Copying images to server###\n"
cd ..
scp dockerImages/* root@212.132.100.147:/root/dockerImages

#load images on server
echo "\n###Loading images on server###\n"
ssh root@212.132.100.147 "docker load < /root/dockerImages/anxiety-api.tar"
ssh root@212.132.100.147 "docker load < /root/dockerImages/product-warning-api.tar"
ssh root@212.132.100.147 "docker load < /root/dockerImages/nina-api.tar"
ssh root@212.132.100.147 "docker load < /root/dockerImages/autobahn-api.tar"
ssh root@212.132.100.147 "docker load < /root/dockerImages/dwd-api.tar"


#run images on server
echo "\n###Running images on server###\n"
ssh root@212.132.100.147 "cd /root && docker compose up -d"

echo "\n###Images updated###\n"