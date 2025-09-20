### Resolve Dependencies

```bash
nix develop --command pnpm install
```

### Develop

#### full

```bash
{ find src/client -type f
  echo src/style.css
} | entr -r nix develop --command bash -c "pnpm run prepare & pnpm run dev"
```

#### only backend

```bash
nix develop --command pnpm run prepare & nix develop --command pnpm run dev
```

### Preview

```bash
nix develop --command pnpm run build && nix develop --command pnpm run start
```
