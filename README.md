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

### 1. Clone the Repository
```bash
git clone https://github.com/Taylor8484/Print-Relay
cd Print-Relay
```

### 2. Build the Docker Image
```bash
docker build -t printrelay .
```

### 3. Run the Container
```bash
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  --name printrelay \
  printrelay
```

**Note:** Using `--network=host` enables mDNS discovery across your local network.

### 4. Access the Application

**On the same machine:**
- `http://localhost:5000`

**From other devices on your network:**
- `http://printrelay.local:5000` (via mDNS/Bonjour)
- `http://<server-ip>:5000` (if mDNS doesn't work)

---

## Remote Access & Deployment Beyond Local Network

⚠️ **Security First:** PrintRelay currently has no built-in authentication. When deploying for remote access, you **must** implement security measures to prevent unauthorized access to your printers.

### Option 1: VPN or Tailscale (Recommended)

The most secure approach is to keep PrintRelay on your local network and access it through a VPN.

#### Using Tailscale (Easiest)

[Tailscale](https://tailscale.com/) creates a secure mesh network between your devices:

1. **Install Tailscale on the host machine:**
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```

2. **Deploy PrintRelay normally:**
   ```bash
   docker run -d \
     --network=host \
     -v /var/run/cups:/var/run/cups \
     --name printrelay \
     printrelay
   ```

3. **Access from any Tailscale-connected device:**
   ```
   http://<tailscale-ip>:5000
   # Find your Tailscale IP: tailscale ip -4
   ```

**Benefits:**
- End-to-end encryption
- No exposed public ports
- Works anywhere (home, office, mobile)
- Free for personal use (up to 100 devices)
- No firewall configuration needed

#### Using Traditional VPN (WireGuard, OpenVPN)

If you prefer self-hosted VPN solutions:

1. Set up WireGuard or OpenVPN on your network
2. Deploy PrintRelay on the local network
3. Connect to VPN from remote devices
4. Access via local IP: `http://192.168.1.x:5000`

### Option 2: Reverse Proxy with Authentication

If you need web-accessible deployment without VPN, use a reverse proxy with authentication.

#### Using Nginx with Basic Auth

1. **Create password file:**
   ```bash
   sudo apt install apache2-utils
   sudo htpasswd -c /etc/nginx/.htpasswd printuser
   ```

2. **Configure Nginx:**
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

3. **Add SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d print.yourdomain.com
   ```

4. **Run PrintRelay (without host network):**
   ```bash
   docker run -d \
     -p 127.0.0.1:5000:5000 \
     -v /var/run/cups:/var/run/cups \
     --name printrelay \
     printrelay
   ```

**Benefits:**
- HTTPS encryption
- Password protection
- Access from anywhere via domain name
- Can integrate with SSO/OAuth

**Considerations:**
- Requires domain name and SSL certificate
- Need to manage user credentials
- Exposed to internet (ensure strong passwords)

#### Using Caddy (Simpler Alternative)

Caddy provides automatic HTTPS with a simpler configuration:

```caddyfile
print.yourdomain.com {
    basicauth {
        printuser $2a$14$Zkx19XLiW6VYouLHR5NmfOFU0z2GTNmpkT/5qqR7hx6e
    }
    reverse_proxy localhost:5000
}
```

### Option 3: Cloudflare Tunnel (Zero Trust)

Cloudflare Tunnel (formerly Argo Tunnel) exposes your service without opening firewall ports.

#### Setup Steps

1. **Install cloudflared:**
   ```bash
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Authenticate with Cloudflare:**
   ```bash
   cloudflared tunnel login
   ```

3. **Create a tunnel:**
   ```bash
   cloudflared tunnel create printrelay
   ```

4. **Configure the tunnel** (`~/.cloudflared/config.yml`):
   ```yaml
   tunnel: <tunnel-id>
   credentials-file: /home/user/.cloudflared/<tunnel-id>.json

   ingress:
     - hostname: print.yourdomain.com
       service: http://localhost:5000
     - service: http_status:404
   ```

5. **Route DNS:**
   ```bash
   cloudflared tunnel route dns printrelay print.yourdomain.com
   ```

6. **Run the tunnel:**
   ```bash
   cloudflared tunnel run printrelay
   ```

7. **Add Cloudflare Access (recommended):**
   - Go to Cloudflare Zero Trust dashboard
   - Create an Access application for `print.yourdomain.com`
   - Configure authentication (email OTP, Google, GitHub, etc.)

**Benefits:**
- No port forwarding required
- Free tier available
- DDoS protection included
- Can add Zero Trust authentication
- Automatic HTTPS

**Considerations:**
- Requires Cloudflare account and domain
- Traffic routes through Cloudflare
- Slight latency added

### Comparison Table

| Method | Security | Complexity | Cost | Best For |
|--------|----------|------------|------|----------|
| **Tailscale** | ⭐⭐⭐⭐⭐ | ⭐ Easy | Free* | Personal use, small teams |
| **Traditional VPN** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ Hard | Free | Full network access needed |
| **Nginx + Auth** | ⭐⭐⭐ Medium | ⭐⭐⭐ Medium | Domain cost | Web-only access |
| **Cloudflare Tunnel** | ⭐⭐⭐⭐ High | ⭐⭐ Medium | Free* | No port forwarding, Zero Trust |

*Free tiers available with limitations

### Security Checklist for Remote Deployment

Before exposing PrintRelay remotely, ensure:

- [ ] **Authentication is enabled** (basic auth, VPN, or Zero Trust)
- [ ] **HTTPS is configured** (if using reverse proxy)
- [ ] **Strong passwords are used** (minimum 16 characters)
- [ ] **Rate limiting is configured** (prevent brute force attacks)
- [ ] **Logs are monitored** (watch for suspicious activity)
- [ ] **CUPS permissions are reviewed** (restrict printer access)
- [ ] **File upload limits are appropriate** (default: 50MB)
- [ ] **Network firewall rules are configured** (allow only necessary ports)

### Recommendations by Use Case

**Home/Personal Use:**
→ Use **Tailscale** for simplicity and security

**Small Office/Team:**
→ Use **Tailscale** or **Cloudflare Tunnel** with Access policies

**Public Access Needed:**
→ Use **Nginx with authentication** or **Cloudflare Tunnel** with strict Access rules

**Corporate Environment:**
→ Use **Traditional VPN** with existing infrastructure

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

**For Docker deployment (with mDNS):**
```bash
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  --name printrelay \
  printrelay
```

**Alternative (without mDNS, using port mapping):**
```bash
docker run -d \
  -p 5000:5000 \
  -v /var/run/cups:/var/run/cups \
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

### Docker Build (Recommended)

The recommended deployment method is using Docker:

```bash
# Build the multi-stage Docker image
docker build -t printrelay .

# Run the container (with mDNS support)
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  --name printrelay \
  printrelay
```

The Docker build:
1. Stage 1: Builds the React frontend with Vite
2. Stage 2: Creates production image with Node.js + CUPS client
3. Installs backend dependencies (Express, multer, node-persist)
4. Copies built frontend and serves it via Express

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
