#!/bin/bash
set -e

echo "========================================="
echo "PrintRelay Update Script"
echo "========================================="
echo ""

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "Error: Neither 'docker-compose' nor 'docker compose' found."
    echo "Please install Docker Compose first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "Warning: Not in a git repository."
    echo "Make sure you're in the PrintRelay directory."
    exit 1
fi

echo "Step 1: Pulling latest changes from GitHub..."
git pull origin main
echo "✓ Code updated"
echo ""

echo "Step 2: Stopping current container..."
$COMPOSE_CMD down
echo "✓ Container stopped"
echo ""

echo "Step 3: Rebuilding Docker image..."
$COMPOSE_CMD build --no-cache
echo "✓ Image rebuilt"
echo ""

echo "Step 4: Starting updated container..."
$COMPOSE_CMD up -d
echo "✓ Container started"
echo ""

echo "Step 5: Verifying deployment..."
sleep 3
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo "✓ PrintRelay is running"
    echo ""
    echo "========================================="
    echo "Update completed successfully!"
    echo "========================================="
    echo ""
    echo "Access PrintRelay at:"
    echo "  • http://localhost:5000"
    echo "  • http://printrelay.local:5000"
    echo ""
    echo "Check logs with: $COMPOSE_CMD logs -f"
else
    echo "✗ Container may not be running correctly"
    echo "Check logs with: $COMPOSE_CMD logs"
    exit 1
fi
