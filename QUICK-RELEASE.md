# Quick Release Guide

**TL;DR for creating a release when you're ready:**

## The Essential Commands

```bash
# 1. Make sure everything is committed and pushed
git checkout main
git pull origin main
git status  # Should be clean

# 2. Test build
npm run build
docker build -t printrelay .

# 3. Create and push tag (update version as needed)
git tag -a v1.1.0 -m "Release v1.1.0: Add duplex printing and landscape orientation"
git push origin v1.1.0

# 4. Wait for GitHub Actions to build (5-10 min)
# Watch: https://github.com/Taylor8484/Print-Relay/actions

# 5. Create GitHub Release
# Go to: https://github.com/Taylor8484/Print-Relay/releases/new
# - Select tag: v1.1.0
# - Title: v1.1.0 - Advanced Printing Options
# - Copy release notes from RELEASE-CHECKLIST.md
# - Publish!

# 6. Test it works
docker pull ghcr.io/taylor8484/print-relay:1.1.0
```

## Version Number Cheat Sheet

- **v1.0.1** - Bug fixes only
- **v1.1.0** - New features (what we just did!)
- **v2.0.0** - Breaking changes

## Need More Details?

See **RELEASE-CHECKLIST.md** for the complete step-by-step guide with troubleshooting.
