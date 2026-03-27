# Path Standards

## Rule

Never use absolute paths containing usernames in documentation, comments, or GitHub content.

## Correct

```
src/lib/gallery.ts
docs/architecture.md
```

## Incorrect

```
/home/matthew/Bast/projects/clients/Computer_Store_KS/src/lib/gallery.ts
/Users/username/project/src/lib/gallery.ts
```

## Why

- Absolute paths leak the developer's username and directory structure
- They break when someone else clones the repo
- GitHub Issues and comments should only use relative paths from the project root
