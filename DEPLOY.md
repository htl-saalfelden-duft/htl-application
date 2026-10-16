## Deployment

Add ssh key
```sh
ssh-copy-id -i id_rsa_world4you_htl htl

```

Install git
```sh
dnf install git-all
```

Install NodeJS
```sh
dnf module install nodejs:18/common
```

## Git Repository
In home-folder
```bash
mkdir repos
mkdir repos/htl-application.git

cd repos/htl-application.git
git init --bare
git symbolic-ref HEAD refs/heads/main

git clone repos/htl-application
cd htl-application
git checkout master


vim repos/htl-application.git/hooks/post-receive
```

post-receive content
```sh
#!/bin/sh

while read oldrev newrev ref
do
    # only checking out the master (or whatever branch you would like to deploy)
    if [[ $ref =~ .*/master$ ]];
    then
        echo "Master ref received.  Deploying master branch to production"
        git --work-tree=/home/htl-application --git-dir=/home/repos/htl-application.git/ checkout -f

        # rm /var/www/virtual/duft1/html/* -R

        # cp -a /home/htl-application/frontend/dist/frontend/. /var/www/virtual/duft1/html/

        # cp /home/htl-application/.htaccess /var/www/virtual/duft1/html/.htaccess

        # cd /home/htl-application/backend

        # yarn install

        # /home/duft1/bin/nest build

        # supervisorctl restart infoscreen
    else
        echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
    fi
done
```

## Installing docker
```sh
sudo dnf --refresh update
sudo dnf upgrade

sudo dnf install yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo systemctl start docker
sudo systemctl enable docker

sudo systemctl status docker
```

## Prerequisites
    private.key and public.crt in frontent/ssl folder

## Run docker-containers

run in production
```sh
 docker compose -f docker-compose-prod.yml up -V --build
```

## Upload files to provider
```sh
scp file htl:/home/htl-application
```

## Release: build the frontend locally
The production machine does not have enough storage to build the frontend, so `frontend/Dockerfile` only copies the committed `frontend/build/` folder into nginx. Before every deployment that contains frontend changes, build on the development machine and commit the result:
```sh
cd frontend
npm run build            # uses .env.production -> REACT_APP_API_URL=https://anmeldung.htlsaalfelden.at/api
cd ..
git add -A frontend/build   # -A also stages the deleted old bundles
git commit -m "New frontend build"
```
Check that `frontend/build/static/js/main.*.js` contains `anmeldung.htlsaalfelden.at/api` and not `localhost`.

After deploying a release that changes `backend/prisma/schema.prisma` (new collections, unique indexes), push the schema. The production image contains no `schema.prisma`, so run it on the server host in the checked-out `backend/` folder. Mongo is published on `localhost:27017` there (use the credentials from `backend/.env`). Pin the Prisma version to the one in `backend/package.json`; an unpinned `npx prisma` downloads the latest major version:
```sh
cd /home/htl-application/backend
DATABASE_URL="mongodb://<MONGODB_USER>:<MONGODB_PASSWORD>@localhost:27017/htlApplication?authSource=admin&replicaSet=rs0&directConnection=true" \
  npx prisma@6.2.1 db push --skip-generate
```

After deploying a release that adds lookup data or settings (e.g. trial days: `TrialDayRegistrationStatus`, `Setting applicationOpen`), run the seed in the backend container:
```sh
cd backend && npm run db:seed:prod
```
The seed only creates missing entries. A new `applicationOpen` setting starts as `false` (application form locked for applicants); unlock it as admin under Admin → Einstellungen.

## Rebuild Images
```sh
docker compose -f docker-compose-prod.yml build backend
docker compose -f docker-compose-prod.yml build frontend
docker compose -f docker-compose-prod.yml up --force-recreate
```