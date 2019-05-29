#!/bin/sh

set -e

######## Environment specific
if [ "$MOPS_ENVIRONMENT" == "dev" ]; then
  echo "We are in dev so using dev conf."
  cp /app/nginx-sites-available/localhost.conf /etc/nginx/conf.d/default.conf
else
  echo "We are production so using that conf."
  cp /app/nginx-sites-available/scrumboard.adinstruments.com.conf /etc/nginx/conf.d/default.conf
fi

exec "$@"