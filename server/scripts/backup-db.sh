#!/usr/bin/env bash
#
# Backs up the MongoDB database to a timestamped local archive using
# mongodump. Requires the MongoDB Database Tools (mongodump/mongorestore)
# to be installed separately — they don't ship with the mongoose/npm
# dependency, since they're a native binary, not a Node package.
# Install: https://www.mongodb.com/try/download/database-tools
#
# Usage:
#   ./scripts/backup-db.sh                 # uses MONGODB_URI from server/.env
#   ./scripts/backup-db.sh "mongodb+srv://..."   # or pass a URI explicitly
#
# Output: server/backups/<timestamp>.archive.gz — a single compressed
# archive (mongodump --archive --gzip), not a directory of BSON files —
# easier to move around, and mongorestore reads it back directly.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$SERVER_DIR/backups"

if ! command -v mongodump &> /dev/null; then
  echo "Error: mongodump not found." >&2
  echo "Install the MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools" >&2
  exit 1
fi

URI="${1:-}"
if [ -z "$URI" ]; then
  if [ -f "$SERVER_DIR/.env" ]; then
    URI="$(grep -E '^MONGODB_URI=' "$SERVER_DIR/.env" | cut -d '=' -f2-)"
  fi
fi

if [ -z "$URI" ]; then
  echo "Error: no MongoDB URI provided and none found in server/.env." >&2
  echo "Usage: $0 [mongodb-uri]" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="$BACKUP_DIR/${TIMESTAMP}.archive.gz"

echo "Backing up to $OUTPUT_FILE ..."
mongodump --uri="$URI" --archive="$OUTPUT_FILE" --gzip

echo "Done. Restore with:"
echo "  mongorestore --uri=\"<target-uri>\" --archive=\"$OUTPUT_FILE\" --gzip"
