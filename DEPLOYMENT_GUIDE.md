# Deployment Guide — Ash Transportation Management System

Deploys the NestJS backend + React admin website to a single AWS EC2
instance, fronted by Nginx, kept alive by PM2. The mobile app talks to the
same backend over the public URL/IP — no separate deployment needed for it.

---

## 1. Launch the EC2 instance

1. AWS Console → EC2 → **Launch Instance**
2. AMI: **Ubuntu Server 22.04 LTS**
3. Instance type: **t3.small** minimum (t3.micro works for very light use)
4. Storage: 20 GB gp3
5. Security Group — open these inbound ports:
   - `22` (SSH) — restrict to your IP
   - `80` (HTTP)
   - `443` (HTTPS, once you add a TLS certificate)
   - Do **not** open `3000` or `27017` publicly — Nginx proxies to the app,
     and MongoDB should never face the internet directly
6. Create/download a key pair, launch the instance, note its public IP

---

## 2. Initial server setup

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Build tools some native modules need
sudo apt install -y build-essential

# PM2 (process manager) and Nginx
sudo npm install -g pm2
sudo apt install -y nginx

node -v && npm -v && pm2 -v && nginx -v
```

---

## 3. Install MongoDB (or use MongoDB Atlas instead)

**Option A — MongoDB on the same EC2 instance** (simplest for a single
truck-yard deployment):

```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

MongoDB will listen on `127.0.0.1:27017` by default — leave it that way,
don't expose it externally.

**Option B — MongoDB Atlas** (managed, off-instance): create a free/paid
cluster at mongodb.com/atlas, whitelist your EC2's public IP, and use the
connection string it gives you as `MONGODB_URI` below. This is the safer
choice if you want automatic backups without managing them yourself.

---

## 4. Deploy the backend

```bash
cd /home/ubuntu
git clone <your-repo-url> ash-backend    # or scp the ash-backend folder up
cd ash-backend
npm install --omit=dev
cp .env.example .env
nano .env
```

Set in `.env`:
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ash_transportation   # or your Atlas URI
JWT_ACCESS_SECRET=<generate with: openssl rand -hex 32>
JWT_REFRESH_SECRET=<generate a different one the same way>
CORS_ORIGIN=https://yourdomain.com
ADMIN_EMAIL=you@yourcompany.com
ADMIN_PASSWORD=<a strong password — change after first login>
```

Build and seed:

```bash
npm run build
npm run seed          # creates the first admin user
```

Start under PM2:

```bash
pm2 start dist/main.js --name ash-backend
pm2 save
pm2 startup           # follow the printed command to enable PM2 on reboot
```

Check it's alive:

```bash
curl http://localhost:3000/api/v1/docs
pm2 logs ash-backend
```

---

## 5. Build and deploy the website

```bash
cd /home/ubuntu
git clone <your-repo-url> ash-website    # or scp it up
cd ash-website
npm install
cp .env.example .env
nano .env
```

Set:
```
REACT_APP_API_BASE_URL=https://yourdomain.com/api/v1
```

Build the static files:

```bash
npm run build
sudo mkdir -p /var/www/ash-website
sudo cp -r build/* /var/www/ash-website/
```

---

## 6. Configure Nginx

Create `/etc/nginx/sites-available/ash-tms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Admin website (static React build)
    root /var/www/ash-website;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Backend API — proxied to the NestJS app on port 3000
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/ash-tms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Visit `http://yourdomain.com` (or the EC2 public IP if you haven't pointed
a domain at it yet) — the website should load and log in successfully.

---

## 7. Add HTTPS (strongly recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot edits the Nginx config to add TLS and sets up auto-renewal. After
this, update `CORS_ORIGIN` in the backend `.env` and
`REACT_APP_API_BASE_URL` in the website `.env` to use `https://`, then
`pm2 restart ash-backend` and rebuild the website.

---

## 8. Point the Android app at production

In the mobile app's `src/api/apiClient.js`, change:

```js
export const BASE_URL = 'https://yourdomain.com/api/v1';
```

and rebuild the APK (`cd android && ./gradlew assembleRelease`).

---

## 9. Ongoing operations

| Task | Command |
|---|---|
| View backend logs | `pm2 logs ash-backend` |
| Restart backend after a code change | `git pull && npm install && npm run build && pm2 restart ash-backend` |
| Redeploy website after a change | `git pull && npm install && npm run build && sudo cp -r build/* /var/www/ash-website/` |
| Check process status | `pm2 status` |
| MongoDB backup (local install) | `mongodump --db ash_transportation --out /home/ubuntu/backups/$(date +%F)` |
| Rotate JWT secrets | Update `.env`, `pm2 restart ash-backend` — this invalidates all existing sessions |

## 10. Basic hardening checklist

- [ ] SSH restricted to your IP only, key-based auth only (disable password login)
- [ ] `ufw` enabled, allowing only 22/80/443
- [ ] MongoDB bound to localhost only (never `0.0.0.0`), or using Atlas with IP allowlisting
- [ ] Strong, unique `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` (never the `.env.example` defaults)
- [ ] Admin password changed immediately after the first login
- [ ] Automated MongoDB backups (cron + `mongodump`, or Atlas's built-in backups)
- [ ] `pm2 startup` configured so the backend survives a server reboot
