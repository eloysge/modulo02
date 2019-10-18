# modulo02

Curso RocketSeat - BootCamp - Modulo 02 - Introdução ao nodejs

1-Iniciando back-end do GoBarber
2-Continuando API do GoBarber

configurando docker user:
sudo groupadd docker
sudo usermod -aG docker \$USER

instalando containers docker:
docker run --name postgres -e POSTGRES_PASSWORD=sge159357 -p 5432:5432 -d -t postgres
docker run --name mongo -p 27017:27017 -d -t mongo
docker run --name redis -p 6379:6379 -d -t redis:alpine

criando DB no postgress (Docker):
docker exec -i -t postgres /bin/sh
su postgres
psql
CREATE DATABASE gobarber;
\l
\q
exit
