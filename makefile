VERSION := $(shell node -p "require('./app/package.json').version")

start:
	@cleanup() { \
		rm -f supabase/migrations/*.sql 2>/dev/null || true; \
               rm -f supabase/functions/migrations/yunocontent/*.sql 2>/dev/null || true; \
               rm -f supabase/functions/migrations/yunocontent/index.txt 2>/dev/null || true; \
               rm -f supabase/functions/migrations/yunofeedback/*.sql 2>/dev/null || true; \
               rm -f supabase/functions/migrations/yunofeedback/index.txt 2>/dev/null || true; \
	}; \
	trap cleanup EXIT INT TERM; \
	cp -f supabase/migrations/app/*.sql supabase/migrations/ 2>/dev/null || true; \
       cp -f supabase/migrations/yunocontent/*.sql supabase/migrations/ 2>/dev/null || true; \
       cp -f supabase/migrations/yunofeedback/*.sql supabase/migrations/ 2>/dev/null || true; \
       mkdir -p supabase/functions/migrations/yunocontent && cp -f supabase/migrations/yunocontent/*.sql supabase/functions/migrations/yunocontent/ 2>/dev/null || true; \
       mkdir -p supabase/functions/migrations/yunofeedback && cp -f supabase/migrations/yunofeedback/*.sql supabase/functions/migrations/yunofeedback/ 2>/dev/null || true; \
       ls supabase/migrations/yunocontent/*.sql 2>/dev/null | xargs -n1 basename | sort > supabase/functions/migrations/yunocontent/index.txt 2>/dev/null || true; \
       ls supabase/migrations/yunofeedback/*.sql 2>/dev/null | xargs -n1 basename | sort > supabase/functions/migrations/yunofeedback/index.txt 2>/dev/null || true; \
	supabase start; \
	npm run dev --prefix=app & \
	wait $$!; \
	cleanup
stop:
	supabase stop

restart:
	$(MAKE) stop
	$(MAKE) start

db.reset:
	supabase db reset --local

check-version:
	@echo 'Checking if version has been bumped for migration changes...'; \
	if ! git rev-parse --verify main >/dev/null 2>&1; then \
		echo 'Warning: main branch not found, skipping version check'; \
		exit 0; \
	fi; \
       migration_changes=$$(git diff --name-only main...HEAD | grep -E '^supabase/migrations/(app|yunocontent|yunofeedback)/.*\.sql$$' || true); \
	if [ -n "$$migration_changes" ]; then \
		echo 'Migration files changed:'; \
		echo "$$migration_changes"; \
		current_version=$$(node -p "require('./app/package.json').version"); \
		main_version=$$(git show main:app/package.json | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')).version" 2>/dev/null || echo "unknown"); \
		if [ "$$current_version" = "$$main_version" ]; then \
			echo "ERROR: Migration files have been modified but version has not been bumped."; \
			echo "Current version: $$current_version"; \
			echo "Please update the version in app/package.json"; \
			exit 1; \
		else \
			echo "Version check passed: $$main_version -> $$current_version"; \
		fi; \
	else \
		echo 'No migration files changed, version check not required'; \
	fi

diff.app:
	supabase db diff -f $(f) -s public,extensions --local; \
	latest_migration=$$(ls -t supabase/migrations/*$(f)*.sql 2>/dev/null | head -1); \
	if [ -n "$$latest_migration" ] && [ ! -f "supabase/migrations/app/$$(basename $$latest_migration)" ]; then \
		cp "$$latest_migration" supabase/migrations/app/; \
	fi;
	$(MAKE) types

diff.yunocontent:
        supabase db diff -f $(f) -s yunocontent --local;
        latest_migration=$$(ls -t supabase/migrations/*$(f)*.sql 2>/dev/null | head -1); \
        if [ -n "$$latest_migration" ] && [ ! -f "supabase/migrations/yunocontent/$$(basename $$latest_migration)" ]; then \
                cp "$$latest_migration" supabase/migrations/yunocontent/; \
        fi;
        $(MAKE) types

diff.yunofeedback:
       supabase db diff -f $(f) -s yunofeedback --local;
       latest_migration=$$(ls -t supabase/migrations/*$(f)*.sql 2>/dev/null | head -1); \
       if [ -n "$$latest_migration" ] && [ ! -f "supabase/migrations/yunofeedback/$$(basename $$latest_migration)" ]; then \
               cp "$$latest_migration" supabase/migrations/yunofeedback/; \
       fi;
       $(MAKE) types

types:
       supabase gen types typescript --local --schema public,yunocontent,yunofeedback  > app/database.types.ts
       supabase gen types typescript --local --schema public,yunocontent,yunofeedback > supabase/functions/_shared/database.types.ts

deploy:
	@echo 'Deploying DB migrations now'
	@supabase db push
	@echo 'Deploying functions now'
	@find ./supabase/functions/* -type d ! -name '_*'  | xargs -I {} basename {} | xargs -I {} supabase functions deploy {}

.PHONY: start diff deploy restart types db.reset stop check-version

