#!/bin/sh
set -e

if [ ! -z "${SERVICE_ACCOUNT_JSON}" ]; then
  echo "Writing service account JSON to serviceAccountKey.json"
  printf "%s" "$SERVICE_ACCOUNT_JSON" > serviceAccountKey.json
fi

# Start gunicorn
exec gunicorn -b 0.0.0.0:${PORT:-8080} app:app
