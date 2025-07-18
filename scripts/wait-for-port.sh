#!/bin/bash

port="$1"
if [ -z "$port" ]; then
  echo "Usage: $0 <port>" >&2
  exit 1
fi

echo "Waiting for server on port $port..."
while ! nc -z localhost "$port"; do
  sleep 0.1
done

echo "Server on port $port is ready"
