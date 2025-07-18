---
sidebar_position: 1
slug: /
hide_title: true
sidebar_label: Introduction
title: Introduction
---

YunoContent is a Content Management System with a batteries-included admin dashboard. Each core feature integrates seamlessly into existing Supabase stack.

### Micro-apps

Yunokit connects to your Supabase projects and installs micro-apps on dedicated schemas. Each schema exposes a full data API, letting you add features with a single click. Manage these micro-apps through the Yunokit admin panel without building custom interfaces. Think of them as PostgreSQL extensions for entire features.

### Why?

**Admin dashboard**. Built-in admin dashboard for managing content, assets, and more.

**Integrate into existing Supabase projects**. Existing features and apps can directly query and join on data through the same familiar Supabase client.

**Stop re-inventing the wheel for each new project**. Focus on the value-added feature building, instead of re-creating boilerplate functionality.

**Migrations are automatically handled**. Spend your development hours on your UI instead of database schema building.


<!--
**Out-of-the-box components**. UI? No problem. Integrate and ship our features as fast as a copy-paste. -->

### Getting Started

1. Pull and run the docker image.

```bash
docker pull ziinc/yunocontent:latest
docker run -d --name yunocontent -p 8000:8000 ziinc/yunocontent:latest
```

2. Update your project's `config.toml` to include `yunocontent` under the list of api schemas.

```toml
# supabase/config.toml
[api]
schemas = ["yunocontent", ...]
```

Then start your local project:
```bash
supabase start
```
