---
sidebar_position: 1
slug: /
hide_title: true
sidebar_label: Introduction
title: Introduction
---

Supacontent is the a content-centric feature framework for Supabase apps. Each feature is pluggable and integrates with any existing Supabase project.

Supacontent ships with an npm package that provides a cli for working with the framework.

### Why?

**Integration into existing supabase projects**. Existing features and apps can directly query data through the same familiar Supabase client interface.

**No more re-inventing the wheel for eacn new project**. Focus on the value-added feature buildling, instead of boilerplate functionality.

**Migrations are automatically handled**. Spend your development hours on your UI instead of database/api wrangling.

### Getting Started

1. Install the npm package

```bash
npm i @ziinc/supacontent
```

2. Start up your local supabase stack

```bash
supabase start
1. Create =`.env` file in your working directory. Add in the Supabase service role key and database URI from Step 2.
```

```
SUPACONTENT_API_KEY=XXXXXXX
SUPACONTENT_DATABASE_URI=postgresql://....
```

4. Run migrations

```bash
npx supacontent migrate up
```
🚧 WIP
