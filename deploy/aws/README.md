# Deploy on AWS EC2 (free tier)

Run Monopoly Run on a small **Ubuntu EC2** instance with SQLite and selfies on the **EBS boot volume**. Same app as local dev — set `MONOPOLY_DATA_DIR` so data survives redeploys.

**Paths used in this guide**

| Path | Purpose |
|------|---------|
| `/opt/monopoly-run/CursorTest` | **App code** (git clone creates the `CursorTest` folder) |
| `/var/lib/monopoly-run` | **Data** — `.env`, SQLite, uploads (not in git) |

**Free tier (new accounts):** typically 12 months of **750 hours/month** on a **t2.micro** or **t3.micro** plus **30 GB EBS**. After that you pay a few dollars per month for a micro instance. Check [AWS Free Tier](https://aws.amazon.com/free/) for current terms.

## 1. Launch EC2

1. AWS Console → **EC2 → Launch instance**.
2. **Name:** `monopoly-run`
3. **AMI:** Ubuntu Server 22.04 or 24.04 LTS (64-bit x86).
4. **Instance type:** `t3.micro` or `t2.micro` (Free tier eligible).
5. **Key pair:** create or select one (required for SSH).
6. **Network:** allow **SSH (22)** from **My IP**; **HTTP (80)** and **HTTPS (443)** from **0.0.0.0/0** (or restrict later).
7. **Storage:** 20–30 GB gp3 (default is fine).
8. Launch.

Optional: **Elastic IP** → allocate and associate with the instance so the public IP stays the same after stop/start (one Elastic IP is free while attached to a running instance).

Connect:

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_PUBLIC_IP
```

## 2. Prepare the server

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential

# Node 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo useradd -r -m -d /opt/monopoly-run -s /bin/bash monopoly || true
sudo mkdir -p /opt/monopoly-run /var/lib/monopoly-run
sudo chown monopoly:monopoly /opt/monopoly-run /var/lib/monopoly-run
```

## 3. Install the app

`git clone` always creates a **subdirectory** named after the repo (`CursorTest`). Do **not** use `git clone … .` into `/opt/monopoly-run` unless that directory is completely empty and owned by you — on a fresh server, clone into the parent folder instead:

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  git clone https://github.com/markysamson/CursorTest.git
  cd CursorTest
  git checkout cursor/monopoly-run-app-9709
  npm ci
'
sudo chown -R monopoly:monopoly /opt/monopoly-run/CursorTest
```

All later commands use **`/opt/monopoly-run/CursorTest`** as the app directory.

### Production config (`.env` file)

The app reads **`/var/lib/monopoly-run/.env`** at startup (see the systemd unit). That file holds secrets and paths — it is **not** in git.

Create it from the template:

```bash
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/env.example /var/lib/monopoly-run/.env
sudo chown monopoly:monopoly /var/lib/monopoly-run/.env
sudo chmod 600 /var/lib/monopoly-run/.env
```

**Edit the file** and replace the placeholder values. On Ubuntu, `nano` is just a simple terminal text editor (like Notepad). You can use **`nano`**, **`vim`**, or edit locally and `scp` the file — whatever you prefer.

```bash
sudo nano /var/lib/monopoly-run/.env
```

In the editor, change **only** these lines (leave the rest as-is unless you know you need to):

| Variable | What to put |
|----------|-------------|
| `MONOPOLY_DATA_DIR` | Keep `"/var/lib/monopoly-run"` (database + selfies live here) |
| `AUTH_SECRET` | A long random string — run on the server: `openssl rand -hex 32` and paste the output between the quotes |
| `ADMIN_PASSWORD` | The password managers use at `/admin` (pick something strong; not `monopoly-admin`) |
| `PORT` | Keep `3000` (Caddy → localhost:3000). **Do not put your EC2 public IP in `.env`** — the app listens on `0.0.0.0` inside the VM only. |

Example after editing (your secret and password will differ):

```env
MONOPOLY_DATA_DIR="/var/lib/monopoly-run"
AUTH_SECRET="a1b2c3...64 hex chars from openssl..."
ADMIN_PASSWORD="YourEventManagerPassword2026"
PORT=3000
```

**If you use nano:** edit the lines → **Ctrl+O**, Enter to save → **Ctrl+X** to exit.

**Without an editor** (paste your generated secret and chosen admin password):

```bash
SECRET=$(openssl rand -hex 32)
sudo tee /var/lib/monopoly-run/.env >/dev/null <<EOF
MONOPOLY_DATA_DIR="/var/lib/monopoly-run"
AUTH_SECRET="$SECRET"
ADMIN_PASSWORD="CHOOSE-A-STRONG-PASSWORD"
PORT=3000
EOF
sudo chown monopoly:monopoly /var/lib/monopoly-run/.env
sudo chmod 600 /var/lib/monopoly-run/.env
```

Replace `CHOOSE-A-STRONG-PASSWORD` in that one-liner before running, or edit the file once with `nano` to set only the admin password.

Build and seed (first time — **required before systemd will stay up**):

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run/CursorTest
  npm run build:prod
'
```

Confirm the build exists:

```bash
ls -la /opt/monopoly-run/CursorTest/.next/BUILD_ID
```

If that file is missing, `monopoly-run` will crash with “Could not find a production build”.

`setup:prod` / `prisma migrate deploy` read **`/var/lib/monopoly-run/.env`** automatically (via `MONOPOLY_DATA_DIR` → `data.db`). You can still `source` that file first if you prefer.

If migrate says **`datasource.url property is required`**, your env file is missing or unreadable — check `MONOPOLY_DATA_DIR` in `/var/lib/monopoly-run/.env`, or add `DATABASE_URL="file:/var/lib/monopoly-run/data.db"`.

## 4. systemd

**Only after** `.next/BUILD_ID` exists (see step 3).

```bash
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/monopoly-run.service /etc/systemd/system/
sudo chmod +x /opt/monopoly-run/CursorTest/scripts/start-prod.sh
sudo systemctl daemon-reload
sudo systemctl enable --now monopoly-run
sudo systemctl status monopoly-run
curl -s http://127.0.0.1:3000/api/health
```

If the service **restart loops** (`activating (auto-restart)`), read the real error:

```bash
sudo journalctl -u monopoly-run -n 40 --no-pager
```

Common causes: **no production build** (run `npm run build` in `/opt/monopoly-run/CursorTest` as `monopoly`), **public IP in `.env`** as `HOSTNAME` / `HOST` / `MONOPOLY_BIND_HOST` (remove those lines), wrong **WorkingDirectory** in systemd (must be `CursorTest`), or wrong ownership on `/opt/monopoly-run/CursorTest` / `/var/lib/monopoly-run`.

## 5. Caddy (reverse proxy)

Caddy sits in front of the app on **port 3000** and exposes **80** (and **443** when using a domain).  
**`systemctl` showing caddy as “active” does not guarantee anything is listening on 443** — a bad or placeholder config often means no HTTPS port.

Install Caddy:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### Option A — Test with public IP first (HTTP on port **80** only)

Use this if you **do not have a domain yet**. You will **not** see port **443** open — that is expected. Browse **`http://YOUR_PUBLIC_IP`** (not https).

```bash
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/Caddyfile.http-ip /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo ss -tlnp | grep caddy
```

You should see Caddy on **`:80`**. Confirm locally: `curl -I http://127.0.0.1/`

Open in a browser: **`http://YOUR_PUBLIC_IP`** (same IP as in the EC2 console).  
**Limitation:** team phones often **block GPS** on plain `http://` (only `https://` or localhost). Manager login on a laptop over HTTP is usually fine for testing.

### Option A2 — No domain, but you need HTTPS (phones + GPS)

Use **[nip.io](https://nip.io)** — free wildcard DNS. Hostname **`YOUR.PUBLIC.IP.nip.io`** resolves to that IP with **no DNS setup** (e.g. IP `203.0.113.50` → `203.0.113.50.nip.io`).

On the instance, get your IP and edit the Caddyfile:

```bash
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/Caddyfile.nip-io /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile   # replace 203.0.113.50.nip.io with YOUR_IP.nip.io
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

After ~1 minute, use **`https://203.0.113.50.nip.io`** (your IP in the name). Caddy will obtain a Let’s Encrypt certificate. Security group must allow **80 and 443**.

### Option B — Production with your own domain (HTTPS on **443**)

1. Point DNS **A record** at the EC2 public IP (or Elastic IP).
2. Edit `deploy/aws/Caddyfile` under **`/opt/monopoly-run/CursorTest`**: replace **`YOUR_DOMAIN`** with e.g. `run.yourclub.org`.
3. Install config and **restart**:

```bash
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo ss -tlnp | grep caddy
```

After a minute, Caddy should listen on **`:80` and `:443`**. Open `https://YOUR_DOMAIN/admin`.

If certificate issuance fails, check: DNS propagated, security group allows **80 and 443** (Let’s Encrypt uses both), and logs: `sudo journalctl -u caddy -n 50 --no-pager`.

## 6. Use the app

- Manager: `https://your-domain/admin` (or `http://YOUR_PUBLIC_IP/admin` for Option A)
- Teams: `/team` on the same base URL (phones need **HTTPS** for GPS — use Option A2 or B)

## Updates

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run/CursorTest
  git pull
  npm ci
  set -a && source /var/lib/monopoly-run/.env && set +a
  npm run build:prod
'
sudo cp /opt/monopoly-run/CursorTest/deploy/aws/monopoly-run.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart monopoly-run
```

## Backups

```bash
sudo tar -czf ~/monopoly-backup-$(date +%F).tar.gz -C /var/lib monopoly-run
```

Optional: **EBS snapshot** in the EC2 console before a big event.

## Troubleshooting

Run on the server:

```bash
bash /opt/monopoly-run/CursorTest/deploy/aws/diagnose.sh
```

### Caddy “running” but no port 443 (or site unreachable)

Work through this order:

1. **App must respond first** — on the instance:
   ```bash
   curl -s http://127.0.0.1:3000/api/health
   ```
   If this fails, fix `monopoly-run`: `sudo journalctl -u monopoly-run -n 40 --no-pager`

2. **443 only appears with a working domain config** — the IP-only test file (`Caddyfile.http-ip`) listens on **80 only**. No 443 is normal until Option A2 or B.

3. **Placeholder domain** — if `/etc/caddy/Caddyfile` still says `run.example.com` or `YOUR_DOMAIN`, Caddy will not serve your site. Edit the file, then `sudo caddy validate --config /etc/caddy/Caddyfile` and `sudo systemctl restart caddy`.

4. **AWS Security group** — inbound TCP **80** and **443** from `0.0.0.0/0` (when testing publicly). If you use `ufw`: `sudo ufw allow 80,443/tcp`

5. **Check listeners:**
   ```bash
   sudo ss -tlnp | grep -E 'caddy|:3000'
   ```

6. **Caddy logs:**
   ```bash
   sudo journalctl -u caddy -n 50 --no-pager
   ```

| Issue | Fix |
|--------|-----|
| Cannot SSH | Security group must allow 22 from your IP; use `ubuntu` user and `.pem` key |
| systemd can’t find app | `WorkingDirectory` must be `/opt/monopoly-run/CursorTest`; re-copy `monopoly-run.service` |
| No :443 in `ss` | Use nip.io or a domain, or use **http://IP** on port 80 |
| Site unreachable from browser | Security group 80/443; app health on :3000; Caddy on :80 |
| Login loops | Use HTTPS; set `AUTH_SECRET` and restart `monopoly-run` |
| Empty map / boards | Run `npm run setup:prod` from `CursorTest` |
| `datasource.url property is required` | Create `/var/lib/monopoly-run/.env` with `MONOPOLY_DATA_DIR`; or set `DATABASE_URL="file:/var/lib/monopoly-run/data.db"` |
| `Location` table does not exist (seed) | Migrations and seed must use the same DB — pull latest, then `npm run setup:prod` (not seed alone). Remove stray `CursorTest/prisma/dev.db` or `CursorTest/dev.db` if created by mistake. |
| `EADDRNOTAVAIL` / public IP on port 3000 | Remove `HOSTNAME`, `HOST`, or `MONOPOLY_BIND_HOST` from `/var/lib/monopoly-run/.env` if set to your public IP. Pull latest and restart — app binds `0.0.0.0` only. |
| No production build in `.next` | As `monopoly`: `cd /opt/monopoly-run/CursorTest && npm run build:prod`. Check `.next/BUILD_ID` exists, then `sudo systemctl restart monopoly-run`. |
| Uploads 404 | `MONOPOLY_DATA_DIR=/var/lib/monopoly-run` and directory writable by `monopoly` user |
