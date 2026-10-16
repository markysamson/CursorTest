# Deploy on AWS EC2 (free tier)

Run Monopoly Run on a small **Ubuntu EC2** instance with SQLite and selfies on the **EBS boot volume**. Same app as local dev — set `MONOPOLY_DATA_DIR` so data survives redeploys.

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
sudo mkdir -p /var/lib/monopoly-run
sudo chown monopoly:monopoly /var/lib/monopoly-run /opt/monopoly-run
```

## 3. Install the app

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  git clone https://github.com/markysamson/CursorTest.git .
  git checkout cursor/monopoly-run-app-9709
  npm ci
'
```

Production env:

```bash
sudo cp /opt/monopoly-run/deploy/aws/env.example /var/lib/monopoly-run/.env
sudo chown monopoly:monopoly /var/lib/monopoly-run/.env
sudo chmod 600 /var/lib/monopoly-run/.env
sudo nano /var/lib/monopoly-run/.env
```

Generate a secret: `openssl rand -hex 32`

Build and seed (first time):

```bash
sudo -u monopoly -H bash -c '
  cd /opt/monopoly-run
  set -a && source /var/lib/monopoly-run/.env && set +a
  npm run setup:prod
  npm run build
'
```

## 4. systemd

```bash
sudo cp /opt/monopoly-run/deploy/aws/monopoly-run.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now monopoly-run
sudo systemctl status monopoly-run
curl -s http://127.0.0.1:3000/api/health
```

## 5. HTTPS with Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Edit `deploy/aws/Caddyfile` — set your domain — then:

```bash
sudo cp /opt/monopoly-run/deploy/aws/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Point your domain’s **A record** at the instance (or Elastic IP).

## 6. Use the app

- Manager: `https://your-domain/admin`
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

```bash
sudo tar -czf ~/monopoly-backup-$(date +%F).tar.gz -C /var/lib monopoly-run
```

Optional: **EBS snapshot** in the EC2 console before a big event.

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Cannot SSH | Security group must allow 22 from your IP; use `ubuntu` user and `.pem` key |
| Site unreachable | Security group 80/443; `curl localhost:3000/api/health` on the instance |
| Login loops | Use HTTPS; set `AUTH_SECRET` and restart `monopoly-run` |
| Empty map / boards | Run `npm run setup:prod` with `.env` loaded |
| Uploads 404 | `MONOPOLY_DATA_DIR=/var/lib/monopoly-run` and directory writable by `monopoly` user |
