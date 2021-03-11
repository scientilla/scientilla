#!/bin/sh
# wait-for-postgres.sh

set -e

host="$DATABASE_HOST"
user="$DATABASE_USER"
shift
cmd="$@"

until PGPASSWORD=$DATABASE_PASSWORD psql -h "$host" -U "$user" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd