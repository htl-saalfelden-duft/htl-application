#!/bin/bash
sudo docker-compose exec --user root backend sh -c "npm run prisma:g"
