#!/bin/bash
docker compose exec backend sh -c "npx prisma db seed"