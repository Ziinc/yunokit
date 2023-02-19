---
sidebar_position: 3
---

# CLI

The `npm` package ships with a command line interface, for handling the development integration with your supabase project.

Supacontent uses the `sc` namespace.

#### `sc migrations`

Generate migrations to the `supabase/migrations` directory. Existing migrations within the directory are checked based on their filename pattern and new migrations will be created within the directory.

All created migrations will have the `<timestamp>_supacontent_` prefix pattern after the timestamp for easy identification.

Options:

- `-d`, `--directory`: Specify a custom output directory. Defaults to `<working-dir>/supabase/migrations`. Directory will be created if it does not exist.
