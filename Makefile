SHELL := /bin/bash

.PHONY: bootstrap dev lint typecheck test smoke build functions-build i18n-check guard-env guard-client-boundaries verify

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
