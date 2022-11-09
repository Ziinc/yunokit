# SupaContent

> _Be supa content with your content - Ziinc, 2022, Bali_

A self-hostable headless CMS that leverages the Supabase stack.

> **Warning: Highly experimental**. Only released for the Supabase Launch Week 5 Hackathon.

### Developer

```bash
# cd ./app
bun dev                     # run admin dev server
bun run build               # build app
bun test                    # run tests

# cd ./web
npm start
npm build

# cd ./cli
bun run build               # compile with tsc
bun test                    # run unit tests with bun
bun cli ...                 # interact with bult cli
bun cli migrate up          # migrate upwards
bun supabase db reset       # reset the local database
bun types                   # update local typings
```

<!-- #### Issues And Workarounds

Bun issues:

- unit testing doesn't work, no assertions, no setup/teardown. Use jest/ts-jest instead
- bun cannot directly run scripts that rely on n-api child_process, delegate to node.

Studio issues:

- does not display other schemas available inside of the database (schemas from custom migrations)

JS client issues:

- cannot access custom schema through client
  - cannot pass additional settings/headers to the underlying postgrest request (for switching schema)
  - workaround: namespace cli-managed tables on the public schema
- errors relating to RLS policies are very vague and non-specific
  - e.g. "more than one row returned by a subquery used as an expression"
  - does not actually indicate/point out that it is an RLS issue
- authenticating with user/pass on node is undocumented and not user friendly (needed kang ming to give some deep insider knowledge on the client auth)
- random ts error on v2 upgrade for client().from()
- querying docs need schema examples, how am I supposed to visualize the querying ?!?!
  - https://supabase.com/docs/reference/javascript/next/select#query-foreign-tables
- usage with vscode results in ts errors due to vscode tsdk being a different version from that which is used in node modules. -->
