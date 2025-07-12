# Yunokit


<p align="center" width="100%"> 


![](./shared/static/branding.png)

</p>

> _Be supa content with your content_
>
> _Ziinc, 2022, Bali unofficial offsite, where the first iteration of this app was written for the LW Hackathon_

Yunokit is a suite of integrations for Supabase apps.

- Content Management System


## Developer

Repo structure:

- app: webapp for Yunokit
- design: design assets
- shared: shared logic and assets between webapp and docapp
- web: documentation and static content app
- supabase: db schema, migrations
  - supabase/schemas/app.sql: schema for app db
  - supabase/schemas/yuno\*.sql: schema for respective Yunokit module

- All developer documentation should be written in /web


```bash
make start
make stop
make restart
make types
make deploy
# generate a migration
make diff f=my_migration
```
