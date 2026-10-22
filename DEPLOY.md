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

post-receive content (checks out `main` and rebuilds/restarts the containers; the build output is shown in the `git push` terminal)
```bash
#!/bin/bash
set -euo pipefail

WORK_TREE=/home/htl-application
REPO_DIR=/home/repos/htl-application.git
BRANCH=main

while read -r oldrev newrev ref; do
    if [[ $ref != refs/heads/$BRANCH ]]; then
        echo "Ref $ref received. Doing nothing: only $BRANCH is deployed on this server."
        continue
    fi

    echo "Deploying $BRANCH ($newrev)"
    git --work-tree="$WORK_TREE" --git-dir="$REPO_DIR" checkout -f "$BRANCH"

    # git exports GIT_DIR into hooks; don't let it leak into docker/buildx
    unset GIT_DIR
    cd "$WORK_TREE"
    docker compose -f docker-compose-prod.yml build backend frontend
    # recreates only containers whose image or config changed (mongo keeps running)
    docker compose -f docker-compose-prod.yml up -d
    # remove the replaced images, the server is short on storage
    docker image prune -f
done
```
Make it executable: `chmod +x /home/repos/htl-application.git/hooks/post-receive`. The pushing ssh user needs docker access (root or member of the `docker` group).

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

e.g.
scp /home/dduft/Downloads/htlsaalfelden.at/private.key  htl:/home/htl-application/frontend/ssl
scp /home/dduft/Downloads/htlsaalfelden.at/public.crt  htl:/home/htl-application/frontend/ssl

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
Done automatically by the post-receive hook. Manually:
```sh
docker compose -f docker-compose-prod.yml build backend
docker compose -f docker-compose-prod.yml build frontend
docker compose -f docker-compose-prod.yml up --force-recreate
```