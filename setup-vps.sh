#!/bin/bash

# HHM-Shop-LMS VPS Setup Script
# Ubuntu 22.04 LTS

set -e

echo "--- Rendszer frissítése ---"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

echo "--- Szükséges csomagok telepítése ---"
apt-get install -y ca-certificates curl gnupg lsb-release ufw

echo "--- Docker GPG kulcs hozzáadása ---"
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "--- Docker repository beállítása ---"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "--- Docker és Docker Compose telepítése ---"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "--- Docker Compose alias létrehozása (opcionális) ---"
ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

echo "--- Tűzfal beállítása (UFW) ---"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo "--- Docker állapot ellenőrzése ---"
systemctl enable docker
systemctl start docker

echo "--- VPS Setup Kész! ---"
docker --version
docker compose version
ufw status