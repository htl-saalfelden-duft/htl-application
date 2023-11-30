#!/bin/bash
sudo docker-compose exec backend sh -c "npx prisma db push"