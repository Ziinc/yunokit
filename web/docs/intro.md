---
sidebar_position: 1
slug: /
hide_title: true
sidebar_label: Introduction
title: Introduction
---

Supacontent is the a framework for Supabase-backed apps **for shipping content features fast**. Each core feature is optional can plug into your frontend and integrates seamlessly into existing Supabase project.

<!-- Supacontent ships with a CLI for handling migrations, as well as a React component library. -->

### Why?

**Integrate into existing Supabase projects**. Existing features and apps can directly query and join on data through the same familiar Supabase client.

**Stop re-inventing the wheel for eacn new project**. Focus on the value-added feature building, instead of re-creating boilerplate functionality.

**Migrations are automatically handled**. Spend your development hours on your UI instead of database and api wrangling.

<!--
**Out-of-the-box components**. UI? No problem. Integrate and ship our features as fast as a copy-paste. -->

### Getting Started

1. Install the npm package.

```bash
npm i -D @ziinc/supacontent
# or
npm install --save-dev @ziinc/supacontent
```

2. Generate migrations to your supabase project directory.

```bash
npx sc migrations
# or
npx supacontent migrations
```

3, Update your project's `config.toml` to include `supacontent` under the list of api schemas.

```toml
# supabase/config.toml
[api]
schemas = ["supacontent", ...]
```

4. Start up your local supabase stack.

```bash
supabase start
```
