#clear all deprecated images
##local
echo "###Clearing deprecated images###"
mkdir dockerImages
rm ./dockerImages/*
ssh root@212.132.100.147 "rm /root/anxiety/dockerImages/*"
cd dockerImages

##remote
ssh root@212.132.100.147 "cd /root/anxiety && docker compose down"
ssh root@212.132.100.147 "docker image remove risiko-radar-api:latest"
ssh root@212.132.100.147 "docker image remove product-warning-api:latest"
ssh root@212.132.100.147 "docker image remove nina-api:latest"
ssh root@212.132.100.147 "docker image remove autobahn-api:latest"

#build and save images
echo "\n###Building and saving images###\n"
rm risiko-radar-api.tar
docker build -t risiko-radar-api ../risiko-radar
docker save risiko-radar-api:latest > risiko-radar-api.tar

rm product-warning-api.tar
docker build -t product-warning-api ../product-warning
docker save product-warning-api:latest > product-warning-api.tar

rm nina-api.tar
docker build -t nina-api ../nina
docker save nina-api:latest > nina-api.tar

rm autobahn-api.tar
docker build -t autobahn-api ../autobahn
docker save autobahn-api:latest > autobahn-api.tar

#copy images to server
echo "\n###Copying images to server###\n"
cd ..
scp dockerImages/* root@212.132.100.147:/root/anxiety/dockerImages

#load images on server
echo "\n###Loading images on server###\n"
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/risiko-radar-api.tar"
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/product-warning-api.tar"
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/nina-api.tar"
ssh root@212.132.100.147 "docker load < /root/anxiety/dockerImages/autobahn-api.tar"

#run images on server
echo "\n###Running images on server###\n"
ssh root@212.132.100.147 "cd /root/anxiety && docker compose up -d"

echo "\n###Images updated###\n"