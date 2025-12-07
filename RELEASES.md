# Release Process & Versioning

This document describes the release process and versioning strategy for PrintRelay.

## Semantic Versioning

PrintRelay follows [Semantic Versioning](https://semver.org/) (SemVer):

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)
```

- **MAJOR** (1.x.x): Breaking changes that require user action
- **MINOR** (x.1.x): New features that are backward compatible
- **PATCH** (x.x.1): Bug fixes and minor improvements

### Examples

**PATCH Release (1.0.0 → 1.0.1):**
- Bug fixes
- Security patches
- Documentation updates
- Performance improvements (no API changes)

**MINOR Release (1.0.0 → 1.1.0):**
- New features (e.g., duplex printing, landscape orientation)
- New API endpoints (backward compatible)
- New configuration options (with defaults)
- UI enhancements

**MAJOR Release (1.0.0 → 2.0.0):**
- Breaking API changes
- Removed endpoints or features
- Changed configuration format requiring migration
- Major architectural changes

## Creating a Release

### 1. Determine Version Number

Based on the changes since the last release, decide whether this is a MAJOR, MINOR, or PATCH release.

### 2. Update Version References (if applicable)

Update version numbers in:
- `package.json` (if you add a version field)
- Any version displays in the UI
- Documentation references

### 3. Create and Push Git Tag

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create an annotated tag
git tag -a v1.1.0 -m "Release v1.1.0: Add duplex printing and landscape orientation"

# Push the tag to GitHub
git push origin v1.1.0
```

### 4. Automated Build Process

When you push a tag:
1. GitHub Actions automatically triggers
2. Docker image is built for multiple platforms (amd64, arm64)
3. Image is published to GitHub Container Registry (GHCR) with tags:
   - `ghcr.io/taylor8484/print-relay:latest` (always latest release)
   - `ghcr.io/taylor8484/print-relay:1.1.0` (specific version)
   - `ghcr.io/taylor8484/print-relay:1.1` (major.minor)
   - `ghcr.io/taylor8484/print-relay:1` (major version)

### 5. Create GitHub Release

Go to: https://github.com/Taylor8484/Print-Relay/releases/new

1. Select the tag you just pushed
2. Set the release title (e.g., "v1.1.0 - Advanced Printing Options")
3. Write release notes (see template below)
4. Click "Publish release"

## Release Notes Template

```markdown
## What's New in v1.1.0

### ✨ New Features
- Added double-sided printing support (duplex)
- Added landscape orientation option
- Advanced options section in UI (collapsible)

### 🐛 Bug Fixes
- Fixed configuration persistence across updates

### 📚 Documentation
- Added comprehensive update guide
- Added Docker Compose examples
- Added pre-built image instructions

### 🔧 Improvements
- Improved update process with automated script
- Added persistent volume mounts for configuration
- Multi-platform Docker images (amd64, arm64)

## Installation

### Using Pre-Built Image (Recommended)
\`\`\`bash
docker run -d --network=host \
  -v /var/run/cups:/var/run/cups \
  -v $(pwd)/printer-config:/app/printer-config \
  ghcr.io/taylor8484/print-relay:1.1.0
\`\`\`

### Building from Source
\`\`\`bash
git clone https://github.com/Taylor8484/Print-Relay
cd Print-Relay
git checkout v1.1.0
docker-compose up -d
\`\`\`

## Upgrading

See [Updating PrintRelay](https://github.com/Taylor8484/Print-Relay#updating-printrelay) in the README.

**Full Changelog**: https://github.com/Taylor8484/Print-Relay/compare/v1.0.0...v1.1.0
```

## Version Guidelines for Common Changes

### When to Increment PATCH (x.x.1)
- Fix printer selection not persisting
- Fix dark mode toggle
- Update dependencies (security patches)
- Fix typos in UI or documentation
- Performance optimizations

### When to Increment MINOR (x.1.0)
- Add duplex printing option ✅ (done)
- Add landscape orientation ✅ (done)
- Add new supported file formats
- Add printer status indicators
- Add print job queue view
- New configuration options (with defaults)

### When to Increment MAJOR (2.0.0)
- Remove API endpoints
- Change API request/response format
- Require manual migration steps
- Remove backward compatibility
- Change authentication system

## Pre-Release Versions

For testing before official release:

```bash
# Create a pre-release tag
git tag -a v1.1.0-beta.1 -m "Beta release for testing duplex printing"
git push origin v1.1.0-beta.1
```

This creates tagged images like:
- `ghcr.io/taylor8484/print-relay:1.1.0-beta.1`

## Hotfix Process

For urgent fixes to production:

```bash
# Create hotfix branch from the tag
git checkout -b hotfix/1.0.1 v1.0.0

# Make the fix, commit, and test
git add .
git commit -m "Fix critical CUPS connection issue"

# Merge to main
git checkout main
git merge hotfix/1.0.1

# Tag and push
git tag -a v1.0.1 -m "Hotfix: Fix CUPS connection issue"
git push origin main
git push origin v1.0.1

# Delete hotfix branch
git branch -d hotfix/1.0.1
```

## Rollback Procedure

If a release has critical issues:

1. **Immediate mitigation**: Users can pin to previous version
   ```bash
   docker pull ghcr.io/taylor8484/print-relay:1.0.0
   ```

2. **Create hotfix**: Follow hotfix process above

3. **Communicate**: Update GitHub release with warning and workaround

## Checklist Before Release

- [ ] All tests pass (once you add automated tests)
- [ ] Documentation is updated
- [ ] CLAUDE.md reflects any new patterns or architecture
- [ ] Breaking changes are clearly documented
- [ ] Migration guide exists (for MAJOR releases)
- [ ] Changelog is updated
- [ ] Version number follows SemVer
- [ ] Tag message is descriptive

## Current Version

As of this document, PrintRelay is at:
- **Version**: 1.1.0 (unreleased - pending first tag)
- **Latest Tag**: v1.0.0 (initial release)
- **Next Release**: v1.1.0 (duplex printing + landscape orientation)
