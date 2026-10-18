#!/usr/bin/env bash
# Add 2GB swap so `next build` survives on t3.micro (1GB RAM). Run once as ubuntu with sudo.
set -euo pipefail

if swapon --show | grep -q /swapfile; then
  echo "Swap already active:"
  swapon --show
  exit 0
fi

if [[ ! -f /swapfile ]]; then
  if fallocate -l 2G /swapfile 2>/dev/null; then
    :
  else
    dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  fi
  chmod 600 /swapfile
  mkswap /swapfile
fi

swapon /swapfile
if ! grep -q '^/swapfile ' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "Swap enabled:"
free -h
