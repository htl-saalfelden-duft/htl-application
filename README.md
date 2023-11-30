# htl_application

## Deployment

```sh
ssh-copy-id -i id_rsa_world4you_htl htl

dnf install git-all

dnf module install nodejs:18/common
```

## Mongo-Replica-Set
Generate keyfile
```sh
openssl rand -base64 756 > <path-to-keyfile>
chmod 400 <path-to-keyfile>
```
Initialize Replica-Set

```sh
sudo docker-compose exec mongo1 sh

mongosh

>use admin;
>db.auth(username, password)
>rs.initiate( {
   _id : "rs0",
   members: [
      { _id: 0, host: localhost:27017" }
   ]} )

```



## Workflow

### Changed schema
Update Client
```
npm run prisma:g
```

### Added package
Rebuild container
```
sudo docker compose up --build -V
```

