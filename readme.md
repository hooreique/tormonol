## Prepare Keys

```bash
mkdir -p ~/.config/tormonol
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 \
  -out       ~/.config/tormonol/authorized.pri.pem \
  -outpubkey ~/.config/tormonol/authorized.pub.pem
```

## Prepare Fonts

Font Source: https://www.nerdfonts.com/font-downloads

```bash
mkdir -p ~/Downloads/Hack
curl --location --output ~/Downloads/Hack.tar.xz \
  https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/Hack.tar.xz
tar -xvf ~/Downloads/Hack.tar.xz -C ~/Downloads/Hack
```

```bash
woff2_compress ~/Downloads/Hack/HackNerdFont-Regular.ttf
woff2_compress ~/Downloads/Hack/HackNerdFont-Italic.ttf
woff2_compress ~/Downloads/Hack/HackNerdFont-Bold.ttf
woff2_compress ~/Downloads/Hack/HackNerdFont-BoldItalic.ttf
```

```bash
cp ~/Downloads/Hack/HackNerdFont-*.woff2 ~/ws/tormonol/static/fonts/
```

```bash
rm -rf ~/Downloads/Hack ~/Downloads/Hack.tar.xz
```

## Getting Started

### Resolve Dependencies

```bash
nix develop --command pnpm install
```

### Develop

#### full

```bash
{ find src/client -type f
  echo src/*.html
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

## Deployment

### Clone

```bash
mkdir -p ~/ws/tormonol
git clone git@github.com:hooreique/tormonol.git ~/ws/tormonol
```

### Prepare Keys on Server

See [Prepare Keys](#prepare-keys).

### Prepare Fonts on Server

See [Prepare Fonts](#prepare-fonts).

### Write Caddyfile

```bash
cp ~/ws/tormonol/meta/Caddyfile.template ~/ws/tormonol/meta/Caddyfile
nvim ~/ws/tormonol/meta/Caddyfile
```

### Enable Linger

```bash
loginctl show-user $USER | grep Linger
loginctl enable-linger $USER
loginctl show-user $USER | grep Linger
```

### Register Services

```bash
cp ~/ws/tormonol/meta/tormonol.service \
   ~/ws/tormonol/meta/caddy.service ~/.config/systemd/user/
systemctl --user enable tormonol caddy
systemctl --user status tormonol caddy
```

### Run (or Refresh) Services

```bash
systemctl --user restart tormonol caddy
```

### Uninstall

```bash
systemctl --user stop tormonol caddy
systemctl --user disable tormonol caddy
rm ~/.config/systemd/user/tormonol.service ~/.config/systemd/user/caddy.service
# rm -rf ~/ws/tormonol
# rm -rf ~/.config/tormonol
# loginctl disable-linger $USER
# loginctl show-user $USER | grep Linger
```
