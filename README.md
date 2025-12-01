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

2. **Network Security:**
   - **Deploy behind a firewall or VPN** - This is critical since there's no authentication
   - Use HTTPS with a reverse proxy (nginx, Traefik, etc.)
   - Consider implementing authentication (basic auth, OAuth, LDAP, etc.) for production use

3. **CUPS Security:**
   - The container needs access to the CUPS socket (`/var/run/cups`)
   - Ensure CUPS is properly configured with printer access controls
   - Review CUPS permissions and printer sharing settings

4. **File Uploads:**
   - Maximum file size is 50MB (configurable in `server.js`)
   - Files are temporarily stored and deleted after printing
   - Ensure adequate disk space for `/tmp/printer-uploads`

**Recommendations for Production:**
- **Run in a trusted network only** (behind firewall/VPN)
- Consider adding authentication if deploying beyond local network
- Implement request rate limiting
- Monitor print job logs
- Set up HTTPS with proper SSL/TLS certificates

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
