# Move lint-staged configuration to .lintstagedrc.json

## Context

The project currently has lint-staged configuration in package.json. It should be moved to a separate `.lintstagedrc.json` file for better organization.

## Current State

In package.json, there is a `lint-staged` field:

```json
"lint-staged": {
  "*.ts": [
    "nx affected:lint --files"
  ]
}
```

## Task

1. Create a new file `.lintstagedrc.json` in the project root
2. Move the lint-staged configuration from package.json to `.lintstagedrc.json`
3. Remove the `lint-staged` field from package.json

## Expected Result

After the change:

1. New file `.lintstagedrc.json` should contain:

```json
{
  "*.ts": ["nx affected:lint --files"]
}
```

2. The `lint-staged` field should be removed from package.json

## Notes

- lint-staged automatically reads configuration from `.lintstagedrc.json` file
- The configuration format remains the same (JSON)
- No changes needed to husky hooks or other scripts
