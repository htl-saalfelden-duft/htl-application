#!/bin/bash
docker compose exec backend sh -c "node dist/prisma/seed.js"