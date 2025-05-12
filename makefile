
start:
	supabase start
	npm run dev --prefix=app

diff:
	supabase db diff -f $(f) -s public,extensions,supacontent --local
	

types:
	supabase gen types typescript --local > app/database.types.ts

deploy:
	@echo 'Deploying DB migrations now'
	@supabase db push
	@echo 'Deploying functions now'
	@find ./supabase/functions/* -type d ! -name '_*'  | xargs -I {} basename {} | xargs -I {} supabase functions deploy {}

.PHONY: start diff deploy