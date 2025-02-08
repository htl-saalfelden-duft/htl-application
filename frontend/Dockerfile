FROM nginx:alpine

COPY ./build/ /usr/share/nginx/html

COPY ./docker/generate-config.sh .

COPY ./docker/custom-nginx.template /etc/nginx/conf.d/

COPY ./ssl/private.key /etc/ssl/private.key
COPY ./ssl/public.crt /etc/ssl/public.crt

RUN chmod +x generate-config.sh

EXPOSE 80

ENTRYPOINT [ "/bin/sh", "generate-config.sh"]