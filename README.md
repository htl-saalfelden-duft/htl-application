# htl_application

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
```sh
npm run prisma:g
```

### Added npm-package
Rebuild container
```sh
sudo docker compose up --build -V
```

### Seeding DB
```sh
npm run db:seed
```

### Nest generate
```
npx nest generate mo school-class
```

