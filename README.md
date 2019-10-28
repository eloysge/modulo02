# modulo02

Curso RocketSeat - BootCamp - Modulo 02 - Introdução ao nodejs

1-Iniciando back-end do GoBarber
2-Continuando API do GoBarber

-configurando docker user:
sudo groupadd docker
sudo usermod -aG docker \$USER

-instalando containers docker:
docker run --name postgres -e POSTGRES_PASSWORD=sge159357 -p 5432:5432 -d -t postgres
docker run --name mongo -p 27017:27017 -d -t mongo
docker run --name redis -p 6379:6379 -d -t redis:alpine

-criando DB no postgress (Docker):
docker exec -i -t postgres /bin/sh
su postgres
psql
CREATE DATABASE gobarber;
\l
\q
exit

-criar estrutura das tabelas no postgres:
npx sequelize db:migrate

-verificar se o serviço esta rodando na porta 3333:
lsof -i :3333

-liberando firewall:
sudo ufw allow 5000

-instalação do pm2:
sudo npm install -g pm2

-adicionando servicos:
pm2 start build/server.js
pm2 start build/queue.js

-para iniciar automaticamente apos reboot:
pm2 startup systemd

-instalação do NGINX
sudo apt install nginx

-configuração do NGINX
sudo vim /etc/nginx/sites-available/default
