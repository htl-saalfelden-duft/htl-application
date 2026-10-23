.PHONY: help up down logs prod-up start-frontend build-frontend test-frontend lint-backend test-backend prisma-generate db-push db-seed nest add-frontend add-backend

BE = docker compose exec --user 1000 backend sh -c

help: ## Show available targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-16s %s\n", $$1, $$2}'

up: ## Start backend, mongo and mongo-express (rebuilds images)
	docker compose up --build -V

down: ## Stop all services
	docker compose down

logs: ## Follow backend logs
	docker compose logs -f backend

prod-up: ## Start the production stack
	docker compose -f docker-compose-prod.yml up -V --build

start-frontend: ## Start the frontend dev server (outside Docker, port 4200)
	cd frontend && npm start

build-frontend: ## Production build of the frontend (frontend/build is committed)
	cd frontend && npm run build

test-frontend: ## Run frontend tests
	cd frontend && npm test

lint-backend: ## Lint the backend (eslint --fix)
	$(BE) "npm run lint"

test-backend: ## Run backend tests
	$(BE) "npm run test"

prisma-generate: ## Regenerate the Prisma client after editing schema.prisma
	docker compose exec --user root backend sh -c "npm run prisma:g"

db-push: ## Push the Prisma schema to MongoDB
	docker compose exec backend sh -c "npx prisma db push"

db-seed: ## Seed the database
	docker compose exec backend sh -c "npx prisma db seed"

nest: ## Run nest in backend, e.g. make nest ARGS="g module foo"
	$(BE) "npx nest $(ARGS)"

add-frontend: ## Add a frontend package, e.g. make add-frontend PKG=lodash
	cd frontend && npm install $(PKG)

add-backend: ## Add a backend package, e.g. make add-backend PKG=lodash (then: make up)
	docker compose exec backend sh -c "npm install $(PKG)"
