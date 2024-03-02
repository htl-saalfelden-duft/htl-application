# htl_application

Instructions for docker from https://www.tomray.dev/nestjs-docker-compose-postgres

## Mongo-Replica-Set
Generate keyfile
```sh
openssl rand -base64 756 > <path-to-keyfile>
chmod 400 <path-to-keyfile>
```
Initialize Replica-Set manually

```sh
sudo docker-compose exec mongo1 sh

mongosh

>use admin;
>db.auth(username, password)
>rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})

```



## Workflow

### Changed schema
Update Client
```sh
npm run db:prisma:g
```

### Added npm-package
Rebuild container
```sh
docker compose up --build -V
```
### Updating indices
```sh
npm run db:push
```

### Seeding DB
```sh
npm run db:seed
```

### Nest generate
```
npx nest generate mo school-class
```

