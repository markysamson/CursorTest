# Deploy on Oracle Cloud Always Free

Run Monopoly Run on an **Always Free** Ampere VM (Ubuntu 22.04/24.04) with persistent SQLite and selfies on the boot volume.

## 1. Create the VM

1. In [Oracle Cloud](https://cloud.oracle.com/), create a **Compute → Instance**.
2. Shape: **Ampere** `VM.Standard.A1.Flex` (1 OCPU / 6 GB RAM is enough).
3. Image: **Ubuntu 22.04 or 24.04**.
4. Add your SSH public key.
5. Assign a **public IPv4** (or use a reserved public IP).
6. Security list / NSG: allow **22** (SSH, your IP), **80**, **443** (world).

## 2. Prepare the server

SSH in as `ubuntu` (or `opc` on Oracle Linux — these steps assume Ubuntu).

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# Node 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# App user and persistent data (survives redeploys)
sudo useradd -r -m -d /opt/monopoly-run -s /bin/bash monopoly || true
sudo mkdir -p /var/lib/monopoly-run
sudo chown monopoly:monopoly /var/lib/monopoly-run /opt/monopoly-run
```

## 3. Install the app

As root or with sudo:

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  git clone https://github.com/YOUR_ORG/YOUR_REPO.git .
  git checkout cursor/monopoly-run-app-9709
  npm ci
'
```

Copy production env (edit secrets before continuing):

```bash
sudo cp /opt/monopoly-run/deploy/oracle/env.example /var/lib/monopoly-run/.env
sudo chown monopoly:monopoly /var/lib/monopoly-run/.env
sudo chmod 600 /var/lib/monopoly-run/.env
sudo nano /var/lib/monopoly-run/.env
```

Build and seed (first time):

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  set -a && source /var/lib/monopoly-run/.env && set +a
  npm run setup:prod
  npm run build
'
```

## 4. systemd service

```bash
sudo cp /opt/monopoly-run/deploy/oracle/monopoly-run.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now monopoly-run
sudo systemctl status monopoly-run
```

Health check (on the VM):

```bash
curl -s http://127.0.0.1:3000/api/health
```

## 5. HTTPS with Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Edit `deploy/oracle/Caddyfile` — replace `run.example.com` with your domain — then:

```bash
sudo cp /opt/monopoly-run/deploy/oracle/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Point DNS **A record** at the instance public IP.

## 6. Use the app

- Manager: `https://your-domain/admin` (password from `ADMIN_PASSWORD`)
- Teams: `https://your-domain/team` (phones need **HTTPS** for GPS)

## Updates

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  git pull
  npm ci
  set -a && source /var/lib/monopoly-run/.env && set +a
  npm run setup:prod
  npm run build
'
sudo systemctl restart monopoly-run
```

## Backups

Before a big event, copy the data directory:

```bash
sudo tar -czf ~/monopoly-backup-$(date +%F).tar.gz -C /var/lib monopoly-run
```

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Login loops | Use HTTPS; ensure `AUTH_SECRET` is set and service restarted |
| Empty map / no boards | Run `npm run setup:prod` with env loaded |
| Uploads 404 | Confirm `MONOPOLY_DATA_DIR` is set and `/var/lib/monopoly-run/uploads` exists |
| Port not reachable | `curl localhost:3000/api/health`; check `ufw` / Oracle security list |
