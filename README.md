# PrintRelay

A modern, full-stack printing agent that streamlines document printing via CUPS. Users can upload files, select printers, specify the number of copies, and send print jobs directly to any CUPS-configured printer.

Built with React, TypeScript, and Express.js, PrintRelay provides a clean web interface with dark mode support, packaged in a Docker container for easy deployment.

---

## Features

### Core Functionality
- **🖨️ CUPS Integration** - Direct integration with CUPS printing system
- **📋 Printer Selection** - Dropdown to select from available CUPS printers
- **📄 Document Upload** - Drag-and-drop or click to upload files for printing
- **🔢 Copy Control** - Specify number of copies with manual input or increment/decrement buttons
- **💾 Persistent Configuration** - Selected printer is saved and restored on reload
- **✅ Real-time Feedback** - Status messages keep users informed throughout the print process

### User Experience
- **🌓 Dark Mode** - Automatic theme detection based on system preferences with manual toggle
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **♿ Accessible** - ARIA labels and semantic HTML for screen reader compatibility
- **⚡ Fast & Lightweight** - Optimized performance with minimal dependencies

### Technical
- **🐳 Docker Ready** - Multi-stage Dockerfile for easy deployment
- **🔒 API Authentication** - Secure API key protection for print endpoint
- **🔄 Auto-dismiss Notifications** - Success and error messages automatically clear after 5 seconds
- **🎨 Modern UI** - Tailwind CSS styling with smooth transitions and hover effects
- **📦 Full-Stack** - React frontend with Express backend in a single deployable container

---

## Prerequisites

- **Docker** - For containerized deployment (recommended)
- **CUPS** - Common UNIX Printing System configured on the host
- **Node.js 18+** - Only if running without Docker

---

## Quick Start with Docker

> **Note:** This guide uses `docker compose` (modern Docker CLI plugin). If you have the older standalone tool, use `docker-compose` (with hyphen) instead.

Choose between using **pre-built images** (fastest) or **building from source** (most up-to-date):

### Option A: Pre-Built Image (Fastest ⚡)

No build required - just pull and run the latest published image:

**Using Docker Compose:**
```bash
# Download the pre-built compose file
wget https://raw.githubusercontent.com/Taylor8484/Print-Relay/main/docker-compose.prebuilt.yml

# Start PrintRelay
docker compose -f docker-compose.prebuilt.yml up -d
```

**Using Docker CLI:**
```bash
# Create config directory
mkdir -p printer-config

# Pull and run the latest image
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:latest
```

### Option B: Build from Source

For the latest unreleased changes or local development:

**1. Clone the Repository**
```bash
git clone https://github.com/Taylor8484/Print-Relay
cd Print-Relay
```

**2. Deploy with Docker Compose**
```bash
docker compose up -d
```

**That's it!** Docker Compose will build and start PrintRelay with:
- Persistent printer configuration
- CUPS integration
- mDNS network discovery
- Automatic container restart

**Alternative: Deploy with Docker CLI**
```bash
# Build the image
docker build -t printrelay .

# Run the container with persistent config
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  printrelay
```

**Note:** Using `--network=host` enables mDNS discovery across your local network.

### 3. Access the Application

**On the same machine:**
- `http://localhost:5000`

**From other devices on your network:**
- `http://printrelay.local:5000` (via mDNS/Bonjour)
- `http://<server-ip>:5000` (if mDNS doesn't work)

---

## Updating PrintRelay

When new versions of PrintRelay are released, you can update your installation to get the latest features and bug fixes. Your printer configuration will be preserved across updates.

### If Using Pre-Built Images (Fastest)

Simply pull the latest image and restart:

```bash
# Pull the latest image
docker pull ghcr.io/taylor8484/print-relay:latest

# Restart the container
docker compose -f docker-compose.prebuilt.yml up -d

# Or with Docker CLI
docker stop printrelay && docker rm printrelay
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:latest
```

### If Building from Source

### Method 1: Automated Update (Recommended)

The easiest way to update is using the included update script:

```bash
cd /path/to/Print-Relay
./update.sh
```

This script will:
1. Pull the latest code from GitHub
2. Stop the current container
3. Rebuild the Docker image
4. Start the updated container
5. Verify the deployment

### Method 2: Docker Compose (Manual)

If you're using Docker Compose:

```bash
cd /path/to/Print-Relay

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify it's running
docker compose ps
docker compose logs -f
```

### Method 3: Docker CLI (Manual)

If you're using Docker commands directly:

```bash
cd /path/to/Print-Relay

# Pull latest changes
git pull origin main

# Stop and remove old container
docker stop printrelay
docker rm printrelay

# Rebuild the image
docker build -t printrelay .

# Start new container with persistent config
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  printrelay

# Check logs
docker logs -f printrelay
```

### Configuration Persistence

Your printer selection and settings are stored in the `./printer-config/` directory on your host machine. This directory is automatically:

- Created when you first run PrintRelay
- Mounted as a volume in the Docker container
- Preserved when you update or restart the container

**Important:** Do not delete the `printer-config` directory or your saved printer selection will be lost.

### Checking Your Current Version

To see what version you're running:

```bash
# Check your current git commit
cd /path/to/Print-Relay
git log -1 --oneline

# Check latest available version
git fetch origin
git log origin/main -1 --oneline
```

### Rolling Back an Update

If an update causes issues, you can roll back to a previous version:

```bash
# View commit history
git log --oneline

# Roll back to a specific commit
git checkout <commit-hash>

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or return to latest version
git checkout main
git pull origin main
```

### Troubleshooting Updates

**Update script fails:**
- Ensure you have git installed: `git --version`
- Make sure you're in the PrintRelay directory
- Check file permissions: `chmod +x update.sh`

**Container won't start after update:**
- Check logs: `docker compose logs` or `docker logs printrelay`
- Verify CUPS is running: `systemctl status cups`
- Ensure ports aren't in use: `sudo lsof -i :5000`

**Configuration lost after update:**
- Check if `printer-config` directory exists in your PrintRelay folder
- Verify the volume mount in your docker-compose.yml or run command
- Re-mount the volume and restart: `docker compose down && docker compose up -d`

---

## Remote Access & Deployment Beyond Local Network

⚠️ **Security First:** PrintRelay currently has no built-in authentication. When deploying for remote access over the internet, you **must** implement security measures to prevent unauthorized access to your printers.

### Option 1: Cloudflare Tunnel (Recommended for Internet Access)

Cloudflare Tunnel (formerly Argo Tunnel) is ideal for exposing PrintRelay over the internet without opening firewall ports. It provides automatic HTTPS, DDoS protection, and optional Zero Trust authentication.

#### Installation

Choose the installation method for your Linux distribution:

**Debian/Ubuntu:**
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

**RHEL/CentOS/Fedora:**
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
sudo rpm -i cloudflared-linux-x86_64.rpm
```

**Arch Linux:**
```bash
yay -S cloudflared
# or
paru -S cloudflared
```

**Other distributions (using binary):**
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

#### Setup Steps

1. **Authenticate with Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```
   This opens a browser window. Log in and authorize the tunnel.

2. **Create a tunnel:**
   ```bash
   cloudflared tunnel create printrelay
   ```
   Note the tunnel ID shown in the output.

3. **Configure the tunnel** (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: <tunnel-id-from-step-2>
   credentials-file: /home/YOUR_USERNAME/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: print.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```
   Replace `YOUR_USERNAME` and `<tunnel-id>` with your values.

4. **Route DNS to your tunnel:**
   ```bash
   cloudflared tunnel route dns printrelay print.yourdomain.com
   ```

5. **Run the tunnel:**
   ```bash
   cloudflared tunnel run printrelay
   ```

6. **Make it persistent (run as a service):**
   ```bash
   sudo cloudflared service install
   sudo systemctl enable cloudflared
   sudo systemctl start cloudflared
   ```

7. **Add Cloudflare Access for authentication (HIGHLY recommended):**
   - Go to [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/)
   - Navigate to Access → Applications → Add an application
   - Choose "Self-hosted"
   - Application domain: `print.yourdomain.com`
   - Configure authentication method:
     - **One-time PIN** (email-based, free)
     - **Google/GitHub OAuth** (social login)
     - **Okta/Azure AD** (enterprise SSO)
   - Create access policies (e.g., allow specific email addresses)

**Benefits:**
- ✅ No port forwarding required
- ✅ Automatic HTTPS with Cloudflare SSL
- ✅ DDoS protection included
- ✅ Zero Trust authentication available
- ✅ Free tier supports this use case
- ✅ Works behind NAT/CGNAT
- ✅ No need to expose your home IP address

**Considerations:**
- Requires Cloudflare account and domain (free tier available)
- Traffic routes through Cloudflare (slight latency, ~10-50ms)
- Subject to Cloudflare's terms of service

### Option 2: Reverse Proxy with Authentication

If you have a static IP or port forwarding available, you can use a traditional reverse proxy with authentication.

#### Using Nginx with Basic Auth

**1. Install Nginx and Apache utilities:**

**Debian/Ubuntu:**
```bash
sudo apt update
sudo apt install nginx apache2-utils
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install nginx httpd-tools
```

**Arch Linux:**
```bash
sudo pacman -S nginx apache
```

**2. Create password file:**
```bash
sudo htpasswd -c /etc/nginx/.htpasswd printuser
```
Enter a strong password when prompted.

**3. Configure Nginx** (`/etc/nginx/sites-available/printrelay` or `/etc/nginx/conf.d/printrelay.conf`):
```nginx
server {
    listen 80;
    server_name print.yourdomain.com;

    location / {
        auth_basic "PrintRelay Access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**4. Enable the site (Debian/Ubuntu):**
```bash
sudo ln -s /etc/nginx/sites-available/printrelay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**5. Add SSL with Let's Encrypt:**

**Debian/Ubuntu:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d print.yourdomain.com
```

**RHEL/CentOS/Fedora:**
```bash
sudo dnf install certbot python3-certbot-nginx
sudo certbot --nginx -d print.yourdomain.com
```

**Arch Linux:**
```bash
sudo pacman -S certbot certbot-nginx
sudo certbot --nginx -d print.yourdomain.com
```

**6. Run PrintRelay (bind to localhost only):**
```bash
docker run -d \
  -p 127.0.0.1:5000:5000 \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:latest
```

**Benefits:**
- ✅ HTTPS encryption
- ✅ Password protection
- ✅ Full control over server
- ✅ Can integrate with SSO/OAuth (via Nginx modules)
- ✅ No third-party dependencies

**Considerations:**
- ⚠️ Requires domain name and SSL certificate
- ⚠️ Need to manage user credentials
- ⚠️ Requires static IP or port forwarding
- ⚠️ You're responsible for security updates
- ⚠️ Exposed to internet attacks (use fail2ban, rate limiting)

#### Using Caddy (Simpler Alternative)

Caddy provides automatic HTTPS with a simpler configuration.

**1. Install Caddy:**

**Debian/Ubuntu:**
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**RHEL/Fedora:**
```bash
dnf install 'dnf-command(copr)'
dnf copr enable @caddy/caddy
dnf install caddy
```

**Arch Linux:**
```bash
sudo pacman -S caddy
```

**2. Create password hash:**
```bash
caddy hash-password
```
Enter your password and copy the hash.

**3. Configure Caddy** (`/etc/caddy/Caddyfile`):
```caddyfile
print.yourdomain.com {
    basicauth {
        printuser <paste-hashed-password-here>
    }
    reverse_proxy localhost:5000
}
```

**4. Reload Caddy:**
```bash
sudo systemctl reload caddy
```

Caddy automatically obtains and renews SSL certificates from Let's Encrypt!

### Option 3: VPN or Tailscale (Private Network)

For private access (not public internet), VPN solutions provide the highest security by keeping PrintRelay completely off the public internet.

#### Using Tailscale (Easiest)

[Tailscale](https://tailscale.com/) creates a secure mesh network between your devices with zero configuration.

**1. Install Tailscale:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```
This works on most Linux distributions (Debian, Ubuntu, Fedora, Arch, etc.).

**2. Authenticate:**
```bash
sudo tailscale up
```
Follow the link to log in.

**3. Deploy PrintRelay normally:**
```bash
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:latest
```

**4. Access from any Tailscale-connected device:**
```
http://<tailscale-ip>:5000
```
Find your Tailscale IP: `tailscale ip -4`

**Benefits:**
- ✅ End-to-end encryption (WireGuard-based)
- ✅ No exposed public ports
- ✅ Works anywhere (home, office, mobile, behind CGNAT)
- ✅ Free for personal use (up to 100 devices)
- ✅ Zero configuration needed
- ✅ Works across NAT/firewalls

**Considerations:**
- ⚠️ Requires Tailscale account (free)
- ⚠️ Devices must have Tailscale installed
- ⚠️ Not suitable for public/guest access

#### Using Traditional VPN (WireGuard, OpenVPN)

If you prefer self-hosted VPN solutions for complete control:

1. Set up WireGuard or OpenVPN on your network
2. Deploy PrintRelay on the local network
3. Connect to VPN from remote devices
4. Access via local IP: `http://192.168.1.x:5000`

**Benefits:**
- ✅ Complete control over infrastructure
- ✅ No third-party services
- ✅ Network-level security

**Considerations:**
- ⚠️ Complex setup and maintenance
- ⚠️ Requires VPN server configuration
- ⚠️ Manual client configuration

### Comparison Table

| Method | Security | Complexity | Cost | Best For |
|--------|----------|------------|------|----------|
| **Cloudflare Tunnel** | ⭐⭐⭐⭐ High | ⭐⭐ Medium | Free* | Internet printing, no port forwarding, Zero Trust auth |
| **Nginx + Auth** | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | Domain cost | Full control, static IP available |
| **Caddy + Auth** | ⭐⭐⭐ Medium | ⭐⭐ Easy | Domain cost | Automatic HTTPS, simpler config |
| **Tailscale** | ⭐⭐⭐⭐⭐ | ⭐ Easy | Free* | Private network, personal/team use |
| **Traditional VPN** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ Hard | Free | Corporate environments, full control |

*Free tiers available with limitations

### Security Checklist for Remote Deployment

Before exposing PrintRelay remotely, ensure:

- [ ] **Authentication is enabled** (Cloudflare Access, basic auth, VPN, or Zero Trust)
- [ ] **HTTPS is configured** (automatic with Cloudflare/Caddy, manual with Nginx)
- [ ] **Strong passwords are used** (minimum 16 characters if using basic auth)
- [ ] **Access policies are configured** (restrict by email/IP if using Cloudflare Access)
- [ ] **Rate limiting is configured** (prevent brute force attacks)
- [ ] **Logs are monitored** (watch for suspicious activity)
- [ ] **CUPS permissions are reviewed** (restrict printer access on host)
- [ ] **File upload limits are appropriate** (default: 50MB)
- [ ] **Network firewall rules are configured** (if using Nginx, allow only 80/443)

### Recommendations by Use Case

**Printing from Anywhere Over Internet:**
→ Use **Cloudflare Tunnel** with Access authentication - No port forwarding, built-in DDoS protection

**Home/Personal Use (Private Network):**
→ Use **Tailscale** - Simplest setup, highest security, works behind CGNAT

**Small Office/Team (Internet Access):**
→ Use **Cloudflare Tunnel** with email-based Access policies or OAuth

**Static IP Available + Want Full Control:**
→ Use **Nginx** or **Caddy** with basic auth and Let's Encrypt SSL

**Corporate Environment:**
→ Use **Traditional VPN** with existing infrastructure or **Tailscale** for simpler management

**Guest/Public Access Needed:**
→ Use **Cloudflare Tunnel** with one-time PIN authentication (least friction for users)

---

## Configuration

### Environment Variables

#### Frontend (.env.local - for development)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_APP_TITLE` | Custom application title | ❌ No | "PrintRelay" |

#### Backend (Docker runtime)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | ❌ No | 5000 |
| `NODE_ENV` | Node environment | ❌ No | "production" |

### Example Configuration

**For Docker Compose deployment (recommended):**
```bash
docker compose up -d
```

**For Docker CLI deployment (with mDNS):**
```bash
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  printrelay
```

**Alternative (without mDNS, using port mapping):**
```bash
docker run -d \
  -p 5000:5000 \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  printrelay
```
Note: Without `--network=host`, you won't be able to use `printrelay.local`

**For local development (.env.local):**
```env
VITE_APP_TITLE=PrintRelay
```

---

## Local Development

### Frontend Development
```bash
npm install        # Install frontend dependencies
npm run dev        # Start Vite dev server on port 5000
npm run build      # Build production bundle to dist/
npm run preview    # Preview production build
```

### Backend Development
```bash
# Install backend dependencies
npm install express multer node-persist

# Run the backend (requires CUPS)
node server.js

# The backend serves the React app from dist/
```

### Full-Stack Development
For the best local development experience:

1. **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Backend:**
   ```bash
   node server.js
   ```

Note: You may want to configure Vite proxy to avoid CORS issues during development.

---

## Building for Production

### Docker Compose (Recommended)

The easiest deployment method is using Docker Compose:

```bash
# Build and start in one command
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

### Docker CLI (Alternative)

If you prefer Docker commands directly:

```bash
# Build the multi-stage Docker image
docker build -t printrelay .

# Run the container (with mDNS support and persistent config)
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  printrelay
```

The Docker build process:
1. Stage 1: Builds the React frontend with Vite
2. Stage 2: Creates production image with Node.js + CUPS client
3. Installs backend dependencies (Express, multer, node-persist, bonjour)
4. Copies built frontend and serves it via Express
5. Configures persistent storage for printer settings

### Manual Deployment (Without Docker)

If you prefer not to use Docker:

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Install backend dependencies:**
   ```bash
   npm install --prefix . express multer node-persist
   ```

3. **Run the server:**
   ```bash
   PORT=5000 node server.js
   ```

**Requirements:**
- Node.js 18+
- CUPS client tools installed (`cups-client` package on Debian/Ubuntu)
- CUPS daemon running and configured

---

## How It Works

### Application Flow

1. **On page load:**
   - Frontend fetches available CUPS printers from `/api/printers`
   - Loads previously saved printer selection from `/api/config`
   - Displays printers in dropdown menu

2. **User selects printer:**
   - Selection is saved to persistent storage via `/api/config`
   - Printer preference persists across sessions

3. **User submits print job:**
   - User uploads a file via drag-and-drop or file picker
   - User specifies number of copies (default: 1)
   - Form submits to `/api/print`
   - Backend retrieves file and saved printer configuration
   - Backend executes `lp -d [PRINTER] -n [COPIES] [FILE]` command
   - Print job is sent to CUPS
   - User receives success/error feedback

### API Endpoints

#### GET /api/printers
Returns list of available CUPS printers.

**Response:**
```json
{
  "printers": [
    { "name": "HP_LaserJet", "status": "enabled", "rawStatus": "idle" }
  ]
}
```

#### POST /api/config
Save printer selection.

**Request:**
```json
{ "printerName": "HP_LaserJet" }
```

#### POST /api/print
Submit print job.

**Body:** `multipart/form-data`
- `file`: Document to print
- `copies`: Number of copies (1-999)

---

## Network Discovery (mDNS/Bonjour)

PrintRelay automatically advertises itself on the local network using mDNS (also known as Bonjour or Zeroconf). This allows users to access the application using a friendly hostname instead of remembering IP addresses.

### Accessing via mDNS

Once deployed, access PrintRelay from any device on the local network:

```
http://printrelay.local:5000
```

### Requirements

**Docker deployment:**
- Use `--network=host` flag when running the container
- mDNS ports (5353 UDP) must not be blocked by firewall

**Client devices:**
- **macOS**: Built-in support (Bonjour)
- **iOS/iPadOS**: Built-in support
- **Linux**: Install `avahi-daemon` if not present
- **Windows 10/11**: Built-in support
- **Android**: May require Bonjour Browser app

### Troubleshooting mDNS

If `printrelay.local` doesn't resolve:

1. **Verify the server is advertising:**
   ```bash
   docker logs printrelay
   # Should see: "mDNS: Service advertised as printrelay.local"
   ```

2. **Check from another device (macOS/Linux):**
   ```bash
   dns-sd -B _http._tcp
   # Should see PrintRelay in the list
   ```

3. **Use IP address as fallback:**
   ```bash
   # Find container's IP
   hostname -I  # On the host machine
   # Then access: http://<ip-address>:5000
   ```

4. **Firewall issues:**
   - Ensure UDP port 5353 (mDNS) is not blocked
   - Some corporate networks block mDNS traffic

---

## Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **TypeScript** - Type-safe development
- **Vite 6.2.0** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling (via CDN)

### Backend
- **Node.js 18+** - Runtime environment
- **Express 4.18+** - Web server framework
- **Multer** - File upload handling
- **node-persist** - Configuration persistence
- **Bonjour** - mDNS/Zeroconf service discovery
- **CUPS** - Common UNIX Printing System

### DevOps
- **Docker** - Containerization
- **Multi-stage builds** - Optimized image size

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **No Authentication:** This application currently has no authentication. Anyone who can access the web interface can print to configured printers.

2. **Remote Access:** If you need to access PrintRelay from outside your local network, **please read the [Remote Access & Deployment](#remote-access--deployment-beyond-local-network) section** for secure deployment options including VPN, reverse proxy, and Cloudflare Tunnel.

3. **CUPS Security:**
   - The container needs access to the CUPS socket (`/var/run/cups`)
   - Ensure CUPS is properly configured with printer access controls
   - Review CUPS permissions and printer sharing settings

4. **File Uploads:**
   - Maximum file size is 50MB (configurable in `server.js`)
   - Files are temporarily stored and deleted after printing
   - Ensure adequate disk space for `/tmp/printer-uploads`

**Recommendations for Production:**
- **Local network only:** Keep PrintRelay on your local network
- **Remote access:** Use VPN (Tailscale recommended) or secure reverse proxy
- **Rate limiting:** Implement request rate limiting to prevent abuse
- **Monitoring:** Monitor print job logs for suspicious activity
- **HTTPS:** Always use HTTPS for remote access (automatic with Cloudflare Tunnel)

---

## License

GNU Affero General Public License v3.0 (AGPL-3.0) - see [LICENSE](LICENSE) file for details.

This is a copyleft license that requires anyone who distributes your code or a derivative work to make the source available under the same terms, including for users interacting with it remotely over a network.

---

## Troubleshooting

### No printers found
- Ensure CUPS is running: `systemctl status cups`
- Check CUPS configuration: `lpstat -p`
- Verify Docker volume mount: `-v /var/run/cups:/var/run/cups`

### Print job fails
- Check CUPS queue: `lpq -a`
- Verify printer is accepting jobs: `cupsenable [printer-name]`
- Review backend logs: `docker logs printrelay`

### Connection issues
- Ensure the server is running: `docker ps` or check backend terminal
- Check browser console for error messages
- Verify you can access http://localhost:5000
- If `printrelay.local` doesn't work, try the server's IP address

### mDNS not working
- Verify container is running with `--network=host`
- Check logs: `docker logs printrelay` for mDNS advertisement message
- Try accessing via IP address instead: `http://<server-ip>:5000`
- Some corporate networks block mDNS (port 5353 UDP)

---

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

## License

GNU Affero General Public License v3.0 (AGPL-3.0) - see [LICENSE](LICENSE) file for details.

This is a copyleft license that requires anyone who distributes your code or a derivative work to make the source available under the same terms, including for users interacting with it remotely over a network.
