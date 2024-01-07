#!/bin/bash
docker compose exec --user root backend sh -c "npm run prisma:g"
