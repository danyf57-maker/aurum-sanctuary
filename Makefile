SHELL := /bin/bash
BASE ?= main

.PHONY: bootstrap dev lint typecheck test smoke build functions-build i18n-check guard-env guard-client-boundaries verify worktree worktree-remove preflight pr-draft

bootstrap:
	./scripts/bootstrap.sh

dev:
	npm run dev

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm run test

smoke: build
	npm run smoke

build:
	npm run build

functions-build:
	npm run functions:build

i18n-check:
	npm run test:e2e:i18n

guard-env:
	npm run guard:env

guard-client-boundaries:
	npm run guard:client-boundaries

verify:
	./scripts/verify.sh

worktree:
	@test -n "$(branch)" || (echo "Usage: make worktree branch=<branch> [base=$(BASE)] [bootstrap=1]"; exit 1)
	./scripts/worktree-create.sh --base "$(BASE)" $(if $(bootstrap),--bootstrap,) "$(branch)"

worktree-remove:
	@test -n "$(branch)" || (echo "Usage: make worktree-remove branch=<branch>"; exit 1)
	./scripts/worktree-remove.sh $(if $(delete_branch),--delete-branch,) "$(branch)"

preflight:
	./scripts/preflight.sh --base "$(BASE)"

pr-draft:
	./scripts/pr-draft.sh --base "$(BASE)"
