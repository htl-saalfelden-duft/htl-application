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