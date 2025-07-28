VERSION := $(shell node -p "require('./app/package.json').version")
SCHEMAS := app yunocontent yunocommunity

start:
	@trap './scripts/cleanup.sh' EXIT INT TERM; \
	./scripts/setup-migrations.sh $(SCHEMAS); \
	supabase start; \
	npm run dev --prefix=app & \
	wait $$!; \
	./scripts/cleanup.sh
start.ci:
	@trap './scripts/cleanup.sh' EXIT INT TERM; \
	./scripts/setup-migrations.sh $(SCHEMAS); \
	supabase start -D; \
	npm run dev --prefix=app &

stop:
	supabase stop

restart:
	$(MAKE) stop
	$(MAKE) start

db.reset:
	supabase db reset --local

check-version:
	@./scripts/check-version.sh

diff.app:
	@./scripts/db-diff.sh app $(f)
	@$(MAKE) types

diff.yunocontent:
	@./scripts/db-diff.sh yunocontent $(f)
	@$(MAKE) types

diff.yunocommunity:
	@./scripts/db-diff.sh yunocommunity $(f)
	@$(MAKE) types

types:
	supabase gen types typescript --local --schema public,yunocontent,yunocommunity  > app/database.types.ts
	supabase gen types typescript --local --schema public,yunocontent,yunocommunity > supabase/functions/_shared/database.types.ts

deploy:
	@echo 'Deploying DB migrations now'
	@supabase db push
	@echo 'Deploying functions now'
	@find ./supabase/functions/* -type d ! -name '_*'  | xargs -I {} basename {} | xargs -I {} supabase functions deploy {}

.PHONY: start start.ci diff deploy restart types db.reset stop check-version

