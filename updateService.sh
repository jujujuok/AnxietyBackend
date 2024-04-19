#clear all deprecated images
##local
echo "###Clearing deprecated images###"
mkdir dockerImages
rm ./dockerImages/*
ssh root@212.132.100.147 "rm /root/dockerImages/*"
cd dockerImages

##remote
ssh root@212.132.100.147 "cd /root && docker compose down $1"
ssh root@212.132.100.147 "docker image remove $1-api:latest"

#build and save image
echo "\n###Building and saving image###\n"
rm $1-api.tar
docker build -t $1-api ../$1
docker save $1-api:latest > $1-api.tar

#copy image to server
echo "\n###Copying image to server###\n"
cd ..
scp dockerImages/$1-api.tar root@212.132.100.147:/root/dockerImages

ssh root@212.132.100.147 "docker load < /root/dockerImages/$1-api.tar"

echo "\n###Running image on server###\n"
ssh root@212.132.100.147 "cd /root && docker compose up -d $1"

echo "\n###Images updated###\n"