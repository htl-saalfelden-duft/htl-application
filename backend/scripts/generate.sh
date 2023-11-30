#!/bin/bash
sudo docker-compose exec --user 1000 backend sh -c "su npm run prisma:g"
