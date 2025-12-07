# Release Checklist - Step-by-Step Guide

This is your complete guide for creating and publishing a new version of PrintRelay.

## Pre-Release Checklist

Before creating a release, ensure:

- [ ] All features/fixes are complete and tested
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Docker image builds successfully (`docker build -t printrelay .`)
- [ ] All changes are committed to the `main` branch
- [ ] Documentation is updated (README, CLAUDE.md if needed)
- [ ] You've decided on the version number (MAJOR.MINOR.PATCH)

## Step 1: Prepare Your Local Repository

### 1.1 Ensure you're on the main branch

```bash
git branch
# Should show: * main
```

If not on main:
```bash
git checkout main
```

### 1.2 Pull the latest changes

```bash
git pull origin main
```

### 1.3 Check for uncommitted changes

```bash
git status
```

**Expected output:**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

If you have uncommitted changes, commit them first:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## Step 2: Determine Version Number

Based on what changed since the last release:

**PATCH (x.x.1) - Bug fixes only:**
- Fixed printer selection not saving
- Fixed dark mode toggle
- Security patches
- Documentation fixes

**MINOR (x.1.0) - New features (backward compatible):**
- ✅ Added duplex printing (what we just did!)
- ✅ Added landscape orientation (what we just did!)
- Added new file format support
- New configuration options

**MAJOR (2.0.0) - Breaking changes:**
- Changed API endpoints
- Removed features
- Required migration steps

**For the current changes:** We added duplex printing and landscape orientation (new features), so this is a **MINOR** release.

**Version to use:** `v1.1.0`

## Step 3: Test Everything One More Time

### 3.1 Test frontend build

```bash
npm run build
```

Expected: No errors, `dist/` folder created

### 3.2 Test Docker build

```bash
docker build -t printrelay-test .
```

Expected: Build completes successfully

### 3.3 (Optional) Test the Docker container locally

```bash
# Start the test container
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay-test \
  printrelay-test

# Check logs
docker logs printrelay-test

# Test in browser
# Visit: http://localhost:5000

# Clean up when done
docker stop printrelay-test
docker rm printrelay-test
docker rmi printrelay-test
```

## Step 4: Create the Version Tag

### 4.1 View existing tags (optional)

```bash
git tag
```

This shows all existing version tags (e.g., v1.0.0)

### 4.2 Create an annotated tag

**Format:**
```bash
git tag -a v<VERSION> -m "<MESSAGE>"
```

**For v1.1.0:**
```bash
git tag -a v1.1.0 -m "Release v1.1.0: Add duplex printing and landscape orientation"
```

**Explanation:**
- `-a` = Create an annotated tag (includes metadata)
- `v1.1.0` = The version number (always start with 'v')
- `-m "..."` = The tag message describing what's new

### 4.3 Verify the tag was created

```bash
git tag
```

You should see `v1.1.0` in the list.

View tag details:
```bash
git show v1.1.0
```

## Step 5: Push Everything to GitHub

### 5.1 Push the tag to GitHub

```bash
git push origin v1.1.0
```

**Expected output:**
```
Counting objects: 1, done.
Writing objects: 100% (1/1), 180 bytes | 180.00 KiB/s, done.
Total 1 (delta 0), reused 0 (delta 0)
To github.com:Taylor8484/Print-Relay.git
 * [new tag]         v1.1.0 -> v1.1.0
```

### 5.2 Verify on GitHub

Go to: https://github.com/Taylor8484/Print-Relay/tags

You should see your new tag `v1.1.0` listed.

## Step 6: Monitor the Automated Build

### 6.1 Watch GitHub Actions

1. Go to: https://github.com/Taylor8484/Print-Relay/actions
2. You should see a new workflow run: "Build and Publish Docker Image"
3. Click on it to watch the progress

**Build takes about 5-10 minutes** (building for both amd64 and arm64)

### 6.2 Wait for success

The workflow will show:
- ✅ Checkout repository
- ✅ Set up Docker Buildx
- ✅ Log in to GitHub Container Registry
- ✅ Extract metadata
- ✅ Build and push Docker image
- ✅ Generate build summary

### 6.3 Check the build summary

Click on "Generate build summary" to see:
- Registry: `ghcr.io`
- Image: `ghcr.io/taylor8484/print-relay`
- Tags created: `latest`, `1.1.0`, `1.1`, `1`

## Step 7: Verify Docker Images Were Published

### 7.1 Check GitHub Container Registry

Go to: https://github.com/Taylor8484/Print-Relay/pkgs/container/print-relay

You should see:
- `latest` tag updated
- `1.1.0` tag created (new)
- `1.1` tag created (new)
- `1` tag updated

### 7.2 (Optional) Test pulling the image

```bash
docker pull ghcr.io/taylor8484/print-relay:1.1.0
```

Expected: Image downloads successfully

## Step 8: Create the GitHub Release

### 8.1 Go to the releases page

https://github.com/Taylor8484/Print-Relay/releases/new

### 8.2 Fill in the release form

**Choose a tag:** Select `v1.1.0` from the dropdown

**Release title:**
```
v1.1.0 - Advanced Printing Options
```

**Release description:** (copy and customize the template below)

```markdown
## What's New in v1.1.0

### ✨ New Features
- **Duplex Printing**: Print double-sided documents with long-edge and short-edge options
- **Landscape Orientation**: Switch between portrait and landscape printing
- **Advanced Options UI**: Collapsible section to keep the interface clean
- **Pre-Built Docker Images**: Faster deployment with multi-platform support (amd64, arm64)

### 🔧 Improvements
- Persistent configuration storage across updates
- Docker Compose support for easier deployment
- Automated update script (`./update.sh`)
- Multi-platform Docker images (works on x86 and Raspberry Pi)

### 📚 Documentation
- Comprehensive update guide
- Pre-built image installation instructions
- Versioning and release process documentation

## Installation

### Using Pre-Built Image (Recommended)

**Docker Compose:**
```bash
wget https://raw.githubusercontent.com/Taylor8484/Print-Relay/main/docker-compose.prebuilt.yml
docker compose -f docker-compose.prebuilt.yml up -d
```

**Docker CLI:**
```bash
mkdir -p printer-config
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:1.1.0
```

### Building from Source

```bash
git clone https://github.com/Taylor8484/Print-Relay
cd Print-Relay
git checkout v1.1.0
docker compose up -d
```

## Upgrading from v1.0.0

Your printer configuration will be preserved!

**If using pre-built images:**
```bash
docker pull ghcr.io/taylor8484/print-relay:latest
docker stop printrelay && docker rm printrelay
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:latest
```

**If building from source:**
```bash
cd Print-Relay
./update.sh
```

## Accessing PrintRelay

- **Local machine**: http://localhost:5000
- **Network devices**: http://printrelay.local:5000 (via mDNS)
- **IP address**: http://<server-ip>:5000

## What's Next

Check out the [README](https://github.com/Taylor8484/Print-Relay#readme) for remote access options using Tailscale, VPN, or reverse proxy.

---

**Full Changelog**: https://github.com/Taylor8484/Print-Relay/compare/v1.0.0...v1.1.0
```

### 8.3 Publish the release

- [ ] Check "Set as the latest release"
- [ ] Click **"Publish release"**

## Step 9: Verify Everything Works

### 9.1 Test the published image

On a clean machine or directory:

```bash
# Create a test directory
mkdir -p ~/printrelay-test
cd ~/printrelay-test

# Pull and run
docker run -d \
  --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  --name printrelay \
  ghcr.io/taylor8484/print-relay:1.1.0

# Check logs
docker logs printrelay

# Visit in browser
# http://localhost:5000

# Test the new features
# - Expand "Advanced Options"
# - See duplex and orientation dropdowns

# Clean up
docker stop printrelay
docker rm printrelay
```

### 9.2 Check the release page

Visit: https://github.com/Taylor8484/Print-Relay/releases

- Release should be marked "Latest"
- Download count will start tracking
- Tag should be linked

## Step 10: Announce (Optional)

If you have users or want to share:

- Update any external documentation
- Post in relevant communities
- Share on social media
- Update your project README with latest version badge

## Quick Reference: Common Git Tag Commands

```bash
# List all tags
git tag

# View tag details
git show v1.1.0

# Delete local tag (if you made a mistake)
git tag -d v1.1.0

# Delete remote tag (if already pushed)
git push origin --delete v1.1.0

# Create lightweight tag (not recommended)
git tag v1.1.0

# Create annotated tag (recommended)
git tag -a v1.1.0 -m "Release message"

# Push specific tag
git push origin v1.1.0

# Push all tags
git push origin --tags
```

## Troubleshooting

### Problem: "Tag already exists"

```bash
# Delete the local tag
git tag -d v1.1.0

# Create it again with the correct message
git tag -a v1.1.0 -m "Correct message"

# Push it
git push origin v1.1.0
```

### Problem: "GitHub Actions build failed"

1. Go to Actions tab and check the error
2. Common issues:
   - Dockerfile syntax error
   - Build dependency missing
   - Platform-specific issue
3. Fix the issue, commit to main
4. Delete and recreate the tag:
   ```bash
   git tag -d v1.1.0
   git push origin --delete v1.1.0
   git tag -a v1.1.0 -m "Release v1.1.0: Fix build issue"
   git push origin v1.1.0
   ```

### Problem: "Can't push to GHCR"

- Permissions should be automatic for the repository
- Check: Settings → Actions → General → Workflow permissions
- Should be: "Read and write permissions"

## For Future Releases

### Patch Release (v1.1.1)
```bash
git tag -a v1.1.1 -m "Release v1.1.1: Fix printer selection bug"
git push origin v1.1.1
```

### Minor Release (v1.2.0)
```bash
git tag -a v1.2.0 -m "Release v1.2.0: Add print job queue viewer"
git push origin v1.2.0
```

### Major Release (v2.0.0)
```bash
git tag -a v2.0.0 -m "Release v2.0.0: New authentication system (breaking change)"
git push origin v2.0.0
```

---

## Complete Example Workflow

Here's everything in one script for copy/paste (update version as needed):

```bash
# 1. Prepare
git checkout main
git pull origin main
git status  # Ensure clean

# 2. Test
npm run build
docker build -t printrelay-test .

# 3. Create tag
git tag -a v1.1.0 -m "Release v1.1.0: Add duplex printing and landscape orientation"

# 4. Verify tag
git tag
git show v1.1.0

# 5. Push to GitHub
git push origin v1.1.0

# 6. Go to GitHub
# - Watch Actions: https://github.com/Taylor8484/Print-Relay/actions
# - Create Release: https://github.com/Taylor8484/Print-Relay/releases/new

# 7. Test published image
docker pull ghcr.io/taylor8484/print-relay:1.1.0
```

---

**Bookmark this file!** You'll use it for every release.
